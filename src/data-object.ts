import { mayChange, diff, reset, clone, Operation } from "resettable";
import util from "util";
import arrify from "arrify";
import has from "lodash.has";
import get from "lodash.get";
import set from "lodash.set";
import isEqual from "lodash.isEqual";
import { VError } from "verror";
import InternalData, { InternalDataInterface } from "internal-data";
import { Logger, Data, Path, Format } from "./@types/";
import { log } from "./util";

/**
 * Returns key, parent path and array of parent path of given path.
 * @private
 * @param   {object} data                                 - Data which path will applied to.
 * @param   {string} path                                 - Path to get parent of.
 * @returns {{key: Key, path: Array.<string>, target: *}} - Key, target and parent path.
 */
function getParent(data: DataObject, path: Path): { key: string | number; target: Data | Array<any>; path: string[] } {
  const arrayPath = Array.isArray(path) ? path : path.split(".");
  const parentPath = arrayPath.slice(0, -1);
  const key = arrayPath[arrayPath.length - 1];
  const index = Number.isInteger(parseInt(key, 10)) ? parseInt(key, 10) : undefined;
  return { key: index || key, path: parentPath, target: parentPath.length > 0 ? data.get(parentPath.join(".")) : data.data };
}

/**
 * Removes given key from target either target is array or object.
 * @private
 * @param {Data|Array.<*>}  target  - Data which key would removed from.
 * @param {string|number}   key     - Key to remove
 * @returns {void}
 */
function remove(target: Data | Array<any>, key: string | number) {
  if (Array.isArray(target)) {
    target.splice(key as number, 1);
  } else {
    delete target[key];
  }
}

/**
 * @typedef {Object} DataObject~Internal
 * @private
 * @property {string}     name      - name path of the name to be modified.
 * @property {json|yaml}  [type]    - Data format of the name to be modified.
 * @property {Object}     data      - Actual data to store in name.
 * @property {isChanged}  boolean   - Whether data is changed.
 * @property {create}     boolean   - Whether to create the name if it does not exist.
 */
type Internal = {
  data: Data;
  name?: string;
  logger: Logger;
  snapshot: Data;
  original: Data;
  format: Format;
  operations?: Operation[];
  unapplied?: Operation[];
  track: boolean;
  sortKeys?: Path[];
};

const internalData: InternalDataInterface<DataObject, Internal> = new WeakMap();

/**
 * @classdesc
 * This class is used for modifications of the given object.
 * @hideconstructor
 */
export default class DataObject {
  /**
   * Creates an instance of DataObject.
   * @param   {Object}            [data={}]             - Data to be modified.
   * @param   {Object}            [options]             - Options
   * @param   {boolean}           [options.track]       - Whether to track changes.
   * @param   {Array.<string>}    [options.sortKeys]    - List of keys which their values shoud be sorted. Key names be paths like "scripts.test"
   * @param   {string}            [options.name]        - Path of the name to be used in logs.
   * @param   {Format}            [options.format]      - Data format used for parsing and serializing data.
   * @param   {Array.<Operation>} [options.operations]  - Operations to reset data to its original state.
   * @param   {Logger}            [options.logger]      - A looger instance such as winston. Must implement `silky`, `verbose`, `info`, `warn`, `error`.
   * @returns {DataObject}                              - Instance.
   */
  constructor(
    data: Data = {},
    {
      newCreated,
      track,
      name,
      format,
      operations = newCreated ? diff(data, undefined) : undefined,
      logger,
      sortKeys,
    }: { newCreated?: boolean; track: boolean; name?: string; format: Format; operations?: Operation[]; logger: Logger; sortKeys?: Path[] },
  ) {
    let unapplied;
    const snapshot = track && !newCreated ? clone(data) : {};
    const original = track && !newCreated ? clone(data) : {};
    if (track) {
      unapplied = reset(original, operations);
      logger.debug(`[reset] Before: ${log(data)}\n[reset] After: ${log(original)}\n[reset] Unapplied Ops: ${log(unapplied)}`);
    }

    internalData.set(this, { data, track, name, format, operations, logger, original, snapshot, unapplied, sortKeys });
  }

  /**
   * Whether data is changed.
   * @type {boolean}
   * @readonly
   */
  get isChanged(): boolean {
    const internal = internalData.get(this);
    return !isEqual(internal.data, internal.snapshot);
  }

  /**
   * Stored data.
   * @type {Data}
   * @readonly
   */
  get data(): Data {
    return internalData.get(this).data;
  }

  /**
   * Original state of the data after operations applied to reset into its original state.
   * @type {Data}
   * @readonly
   */
  get original(): Data {
    return internalData.get(this).original;
  }

  /**
   * Data in the state given to constructor
   * @type {Data}
   * @readonly
   */
  get snapshot(): Data {
    return internalData.get(this).snapshot;
  }

  /**
   * Operations which are not (cannot) applied during reset to original.
   * @type {Array.<Operation> | undefined}
   * @readonly
   * @private
   */
  get unapplied(): Operation[] | undefined {
    return internalData.get(this).unapplied;
  }

  /**
   * Data format used for parsing and serializing.
   * @type {Format}
   * @readonly
   * @private
   */
  get format(): Format {
    return internalData.get(this).format;
  }

  /**
   * List of keys to be sorted during serialization.
   * @type {Array.<Path> | undefined}
   * @readonly
   * @private
   */
  get sortKeys(): Array<Path> | undefined {
    return internalData.get(this).sortKeys;
  }

  /**
   * Returns one of the given values based on whether some of given property or properties exists in given object.
   * Property names may be given as chained such as `key` or `key.subkey`.
   * @param   {string|Array.<Path>}     props     - Property or properties to look in data
   * @param   {*}                       [t=true]  - Value to return if some of the properties exists in project.
   * @param   {*}                       [f=false] - Value to return if none of the properties exists in project.
   * @return  {*}                                 - `t` or `f` value based on existence of property.
   * @example
   * const result = project.hasProp(['scripts.build', 'scripts.build:doc'], 'yes', 'no');
   */
  has<T = true, F = false>(props: Path[] | string, t: T = (true as any) as T, f: F = (false as any) as F): T | F {
    return arrify(props).some(prop => has(this.data, prop)) ? t : f;
  }

  /**
   * Returns one of the given values based on whether some of given property path or property paths exists in object's target property path.
   * Property names may be given as chained such as `key` or `key.subkey`.
   * @param   {Path}                    prop      - Property or properties to look in data
   * @param   {string|Array.<Path>}     subProps  - Property or properties to look in data
   * @param   {*}                       [t=true]  - Value to return if some of the properties exists.
   * @param   {*}                       [f=false] - Value to return if none of the properties exists.
   * @returns {*}                                 - `t` or `f` value based on existence of sub property.
   * @example
   * const result = project.hasSubProp('scripts', ['build', 'build:doc']);
   * const result2 = project.hasSubProp('address.home', ['street.name', 'street.no']);
   */
  hasSubProp<T = true, F = false>(prop: Path, subProps: Path[] | string, t: T = (true as any) as T, f: F = (false as any) as F): T | F {
    const subObj = get(this.data, prop);
    return arrify(subProps).some(subProp => has(subObj, subProp)) ? t : f;
  }

  /**
   * Returns data in given key or path. Path may be given as chained. (i.e "scripts.compile")
   * @param   {Path} path     - Path to get data from
   * @returns {*}             - Data stored at given key.
   */
  get(path: Path): any {
    return get(internalData.get(this).data, path);
  }

  /**
   * Stores given data at given key or path. Based on force option, does not change value if it is not created automatically by this library by looking registry.
   * Path may be given as chained. (i.e "scripts.compile")
   * @param   {Path}      path    - Path to store data at.
   * @param   {*}         value   - Value to store at given key.
   * @returns {this}              - Object instance.
   */
  set(path: Path, value: any, { force = false } = {}): this {
    if (!Array.isArray(path) && typeof path !== "string") {
      throw new VError("Path must be a string");
    }

    const internal = internalData.get(this);
    const oldValue = get(internal.data, path);
    const willChange = !internal.track || force || mayChange(internal.data, internal.original, path);
    if (willChange) {
      set(internal.data, path, value);
    }
    internal.logger[willChange ? "info" : "warn"](`${willChange ? "[" : "[Not "}Set Key]  "${path}" to "${value}" in ${internal.name}`);
    return this;
  }

  /**
   * Stores each key and its value in the object. Key's may be given as chained paths such as `scripts.compile`.
   * @param   {Object}        data                  - Data to store at object.
   * @param   {Object}        [options]             - Options
   * @param   {boolean}       [options.force=false] - Whether to force change even value is altered by user manually.
   * @returns {this}                                - Object instance.
   * @example
   * data.setObject({ "a.b": 1, c: 2, d: 3 });
   */
  setObject(data: Data, { force = false } = {}): this {
    Object.entries(data).forEach(([key, value]) => this.set(key, value, { force }));
    return this;
  }

  /**
   * Removes given path or paths from object . Based on force option, does not remove value if it is not created automatically by this library by looking registry.
   * Path may be given as chained. (i.e "scripts.compile")
   * @param   {string|Array.<Path>}     path                  - Path or list of paths to remove
   * @param   {Object}                  [options]             - Options
   * @param   {boolean}                 [options.force=false] - Whether to force change even value is altered by user manually.
   * @returns {this}                                          - Object instance.
   */
  remove(path: string | Path[], { force = false, internalCall = false } = {}): this {
    if (Array.isArray(path) && !internalCall) {
      path.forEach(k => this.remove(k, { force, internalCall: true }));
      return this;
    }

    const internal = internalData.get(this);
    if (has(internal.data, path as Path)) {
      const willChange = !internal.track || force || mayChange(internal.data, internal.original, path as Path);
      if (willChange) {
        const { key, target } = getParent(this, path as Path);
        remove(target, key);
      }
      internal.logger[willChange ? "info" : "warn"](`${willChange ? "[" : "[Not "}Remove Key] "${path}" from ${internal.name}`);
    }

    return this;
  }

  /**
   * Returns list of operations to be applied to reset data back to its state provided to constructor.
   * @returns {Array.<Operation>}  - List of operations.
   * @private
   */
  diffFromSnapshot(): Operation[] {
    const internal = internalData.get(this);
    return diff(internal.data, internal.snapshot);
  }

  /**
   * Returns list of operations to be applied to reset data back to its original state including operations applied to state given to constructor.
   * If `options.compact` is true, diff is calculated by comparing original state to current state. If `options.compact` is false, diff of cuurent state and snapshot
   * are calculated and it is concatenated to previous operations.
   * concatenating
   * @param   {Object}            Options - Options
   * @param   {boolean}           compact - Whether to compact list of operations.
   * @returns {Array.<Operation>}         - List of operations.
   * @private
   */
  diffFromOriginal({ compact = true } = {}): Operation[] {
    const internal = internalData.get(this);
    return compact ? diff(internal.data, internal.original) : (internal.operations || []).concat(this.diffFromSnapshot());
  }

  /**
   * Resets data and snapshot to its original states.
   * @returns {Array.<Operation>} - Unapplied operations
   */
  reset(): Array<Operation> | undefined {
    const internal = internalData.get(this);
    const unapplied = clone(internal.unapplied);
    internal.data = clone(internal.original);
    internal.snapshot = clone(internal.original);
    internal.operations = undefined;
    internal.unapplied = undefined;
    return unapplied;
  }
}

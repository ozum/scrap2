/// <reference path="../@types/sort-keys" />
import * as path from "path";
import * as util from "util";
import * as fs from "fs-extra";
import yaml from "js-yaml";
import isEqual from "lodash.isEqual";
import get from "lodash.get";
import has from "lodash.has";
import set from "lodash.set";
import isEmpty from "lodash.isempty";
import crypto from "crypto";
import sortKeys from "sort-keys";
import { VError } from "verror";

import { Format, Data, Path, BasicLogger, Registry } from "./@types";

export const extensionFormat: { [key: string]: Format } = {
  ".json": "json",
  ".yaml": "yaml",
};

/**
 * Returns data to be written to log as result of inspect.
 * @param   {*}     data  - Data to be logged.
 * @returns {string}      - Data to log.
 * @private
 */
export function log(data: any): string {
  return util.inspect(data, { depth: null });
}

/**
 * Returns whether given registry object is empty. Registry object without keys or with keys having empty values
 * (empty array, empty object) is considered empty registry.
 * @param   {object}  registry  - Registry object to check
 * @returns {boolean}           - Whether given registry object is empty.
 * @private
 */
export function isEmptyRegistry(registry: Registry): boolean {
  return !registry || isEqual(registry, {}) || Object.values(registry).every(isEmpty);
}

/**
 * Gets and sorts the value at path of object.
 * @param   {Object} object - Object to get vaue from
 * @param   {string} key    - Key to get value of. May be a deep path.
 * @returns {*}             - Sorted value at the key.
 * @private
 */
function getSorted(object: Data, key: Path): any {
  const value = get(object, key);
  return typeof value === "object" ? sortKeys(value) : value;
}

/**
 * Returns given object sorted by key names. If list of keys are provided, returns a sub-object of original which only contains given keys.
 * Key names may be deep paths such as "script.build" etc.
 * @param   {Object}        object  - Object to sort
 * @param   {Array<string>} keys    - Keys to include
 * @returns {Object}                - Sorted object
 * @private
 */
function getSortedObject(object: Data, keys?: Path[]): Data {
  // prettier-ignore
  return keys && (keys.length > 0)
    ? keys.sort().filter(key => has(object, key)).reduce((prev, key) => set(prev, key, getSorted(object, key)), object)
    : sortKeys(object);
}

/**
 * Returns hash signature for given object. If list of keys are provided, only provided keys and their values are used in hash calculation.
 * Key names may be deep paths such as "script.build" etc.
 * @param   {Object}        object  - Object to calculate hash for.
 * @param   {Array<Path>}   [keys]  - Keys to include in hash calculation
 * @returns {string}                - Hash value for given object using given or all keys.
 * @private
 */
export function hashObject(object: Data, keys?: Path[]): string {
  // prettier-ignore
  return crypto.createHash("sha1").update(JSON.stringify(getSortedObject(object, keys))).digest("hex");
}

/**
 * Serializes and returns given data as string. If data is already string, returs it as it is. If no format given `json` is the default.
 * @param   {Data}          data            - Data to serialize.
 * @param   {Format}        [format="json"] - Format to use serializing. `json` or `yaml`.
 * @param   {Array.<Path>}  [sortKeys]      - List of paths to sort keys of.
 * @returns {string}                        - Serialized data
 * @private
 */
export function serializeData(data: Data, format: Format = "json", sortKeys?: Array<Path>): { format: Format; data: string } {
  const sortedData = sortKeys ? getSortedObject(data, sortKeys) : data;
  return format === "yaml"
    ? { format: "yaml", data: yaml.safeDump(sortedData) }
    : { format: "json", data: JSON.stringify(sortedData, undefined, 2) };
}

/**
 * Parses given string and returns format and object. If no format given, tries to parse first as json, then yaml.
 * @param   {string}                          content   - Content to parse
 * @param   {Format}                          [format]  - Format to use for parsing. `json`, `yaml`..
 * @returns {{data: object, format: Format}}            - Parsed object or input string.
 * @throws  {VError}                                    - Throws error if data cannot be parsed.
 * @private
 */
export function parseData(content: string, format?: Format): { format: Format; data: Data } {
  const errors = [];

  if (format === "json" || !format) {
    try {
      return { format: "json", data: JSON.parse(content) };
    } catch (e) {
      errors.push(new VError(e, "Cannot parse data as JSON."));
    }
  }

  if (format === "yaml" || (!format && errors.length > 0)) {
    try {
      return { format: "yaml", data: yaml.safeLoad(content) as Data };
    } catch (e) {
      errors.push(new VError(e, "Cannot parse data as YAML."));
    }
  } else {
    throw new VError("Cannot parse data.");
  }

  throw VError.errorFromList(errors);
}

/**
 * Returns data format of given file. First looks file extension, then file content of the file.
 * @param   {string} file   - File to determine format for.
 * @returns {Format}        - Data format for given file.
 * @throws  {VError}        - Throws error if file format cannot be determined.
 * @private
 */
export function getFileFormat(file: string): Format | undefined {
  if (extensionFormat[path.extname(file)]) {
    return extensionFormat[path.extname(file)];
  }

  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");
    return parseData(content).format;
  }
  throw new VError("Cannot determine format. No format provided, file name has no extension and no file to look content.");
}

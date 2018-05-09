/// <reference path="../@types/empty-dir" />
import * as path from "path";
import * as fs from "fs-extra";
import js_beautify from "js-beautify";
import VError from "verror";
import arrify from "arrify";
import crypto from "crypto";
import isEqual from "lodash.isEqual";
import uniq from "lodash.uniq";
import emptyDir from "empty-dir";
import { clone, Operation } from "resettable";
import { InternalDataInterface } from "internal-data";

import DataObject from "./data-object";
import { getLogger, setLogLevel, getLogLevel } from "./logger";
import { log, isEmptyRegistry, extensionFormat, serializeData, parseData, getFileFormat, hashObject } from "./util";
import { Format, FileDetail, Path, BasicLogger, Data, FileOptions, Registry } from "./@types";

const DEFAULT_REGISTRY: Registry = { createdDataFiles: [], files: {}, directories: [] };

/**
 * Internal object to store private data.
 * @typedef {Object} Project~Internal
 * @private
 * @property {string}         registryFile      - Path of registry file.
 * @property {string}         sourceRoot        - Root directory path of module which requires this library.
 * @property {Object}         registry          - Module registry data which is stored in a file in project root.
 * @property {Object}         dataFiles         - Tracked data files. Keys are file paths relative to project root.
 * @property {boolean}        track             - Whether to track file to determine if they are auto created by module.
 * @property {Logger}         logger            - logger object.
 */
type Internal = {
  registryFile: string;
  sourceRoot: string;
  track: boolean;
  dataFiles: { [key: string]: DataObject };
  registry: Registry;
  logger: BasicLogger;
};

const internalData: InternalDataInterface<ResettableFile, Internal> = new WeakMap();

/**
 * @classdesc
 * Provides utility class and methods for boilerplate projects to create/copy/remove files, directories and data files (json/yaml).
 * Created files, directories and data files are tracked and recorded to a json file, and modifications done by this library can be undone
 * by `reset()` method.
 */
export default class ResettableFile {
  /**
   * @param   {string}      registryFile              - Path of the registry file. Registry file's directory is also root directory.
   * @param   {Object}      [options]                 - Options
   * @param   {string}      [options.sourceRoot]      - Source root. If provided all source files are calculated relative to this path for copy, symbolic link etc.
   * @param   {boolean}     [options.track]           - Sets default tracking option for methods.
   * @param   {string}      [options.logLevel="warn"] - Sets log level if default logger is used. ("error", "warn", "info", "debug", "verbose", "silly")
   * @param   {BasicLogger} [options.logger]          - A looger instance such as winston. Must implement `info`, `warn`, `error`, `verbose`, `silly`.
   * @returns {Project}                               - Instance
   * @throws  {VError}                                - Throws error if registry file exists, but cannot be read.
   */
  constructor(
    registryFile: string,
    { sourceRoot = "", track = true, logLevel = "warn" as keyof BasicLogger, logger = getLogger(logLevel) } = {},
  ) {
    try {
      internalData.set(this, {
        registryFile,
        sourceRoot,
        track,
        logger,
        dataFiles: {},
        registry: Object.assign(clone(DEFAULT_REGISTRY), fs.existsSync(registryFile) ? fs.readJsonSync(registryFile) : {}),
      });
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, "Cannot create Resettable-File instance.");
    }
  }

  /**
   * Root path for files to be managed. It is the directory registry file is located.
   * @readonly
   * @type {string}
   */
  get root() {
    return path.dirname(internalData.get(this).registryFile);
  }

  /**
   * Source root path for files to be managed. It is the source root directory given during object construction.
   * @readonly
   * @type {string}
   */
  get sourceRoot() {
    return internalData.get(this).sourceRoot;
  }

  /**
   * Whether files of the project are tracked by default.
   * @readonly
   * @type {boolean}
   */
  get track() {
    return internalData.get(this).track;
  }

  /**
   * Returns logger object which provides `error`, `warn`, `info`, `debug`, `verbose`, `silly` methods.
   * @readonly
   * @type {BasicLogger}
   */
  get logger() {
    return internalData.get(this).logger;
  }

  /**
   * Log level if default logger is used. ("none", "error", "warn", "info", "debug", "verbose", "silly")
   * @type {string} logLevel - Log level: ("none", "error", "warn", "info", "debug", "verbose", "silly")
   */
  set logLevel(logLevel: keyof BasicLogger) {
    setLogLevel(this.logger, logLevel);
  }

  get logLevel(): keyof BasicLogger {
    return getLogLevel(this.logger);
  }

  /**
   * Returns given path after prepending it to the root. Path may be given as a single string or in multiple parts.
   * @param   {...string} part  - Path or path parts to get full path in root.
   * @returns {string}          - Path in root.
   * @example
   * const resettable = new ResettableFile({ registryFile: "dir/registry.json" });
   * resettable.fromRoot("path/to/file.txt"); // dir/path/to/file.txt
   */
  fromRoot(...part: string[]): string {
    return path.join(this.root, ...part);
  }

  /**
   * Returns given path after prepending it to the source root. Path may be given as a single string or in multiple parts.
   * @param   {...string} part  - Path or path parts to get full path in root.
   * @returns {string}          - Path in root.
   * @example
   * const resettable = new ResettableFile({ sourceRoot: "sourcedir" });
   * resettable.fromSourceRoot("path/to/file.txt"); // sourcedir/path/to/file.txt
   */
  fromSourceRoot(...part: string[]): string {
    return path.join(this.sourceRoot, ...part);
  }

  /**
   * Checks whether given file is a tracked data file.
   * @param   {string}  projectFile   - File to check
   * @returns {boolean}        - Whether given file is a tracked data file.
   */
  isDataFile(projectFile: string): boolean {
    const internal = internalData.get(this);
    return Array.isArray(internal.registry.files[projectFile]) || internal.dataFiles[projectFile] !== undefined;
  }

  /**
   * Returns one of the given values based on existence of given file path or file paths in root.
   * @param   {string|Array<string>}  projectFiles  - File or list of files to look in root.
   * @param   {*}                     [t=true]      - Value to return if any of the files exists in root.
   * @param   {*}                     [f=false]     - Value to return if none of the files exists in root.
   * @return  {*}                                   - `t` or `f` value based on existence of files in root.
   */
  hasFileSync<T = true, F = false>(projectFiles: string | string[], t: T = (true as any) as T, f: F = (false as any) as F): T | F {
    return arrify(projectFiles).find(file => fs.existsSync(this.fromRoot(file))) ? t : f;
  }

  /**
   * Saves registry file
   * @param   {Object}  [options]         - Options
   * @param   {boolean} [options.isReset] - Whether this is a reset operation's save.
   * @returns {void}
   * @throws  {VError}                    - Throws error if registry file cannot be written.
   * @private
   */
  private saveRegistrySync({ isReset = false } = {}) {
    const internal = internalData.get(this);
    const registryFile = internal.registryFile;
    const isEmpty = isEmptyRegistry(internal.registry);
    this.logger.debug(`[saveRegistry] ${log(internal.registry)}`);

    try {
      if (isEmpty && fs.existsSync(registryFile)) {
        fs.removeSync(registryFile);
        this.logger.info(`Deleted registry file (It is empty): ${registryFile}`);
        return;
      }

      if (!isEmpty) {
        isReset
          ? this.logger.error(`Data remains after reset. Review registry: ${registryFile}`)
          : this.logger.info(`Registry saved: ${registryFile}`);
        fs.outputFileSync(registryFile, serializeData(internal.registry, "json", []).data);
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot save registry file: ${registryFile}`);
    }
  }

  /**
   * Saves data files and registry file. Must be called if any changes are made.
   * @returns {void}
   * @throws  {VError}  - Throws error if files cannot be written
   */
  saveSync() {
    const internal = internalData.get(this);
    let writtenAny = false;
    try {
      Object.entries(internal.dataFiles)
        .filter(([projectFile, dataObject]) => dataObject.isChanged)
        .forEach(([projectFile, dataObject]) => {
          internal.registry.files[projectFile] = dataObject.diffFromOriginal({ compact: true });
          const { format, sortKeys } = dataObject;
          this.writeFileSync(projectFile, dataObject.data, { format, sortKeys, serialize: true, track: false, force: true }); // Track is false, because tracked data files are tracked key level and written partially.
          writtenAny = true;
        });
      this.saveRegistrySync();
      writtenAny ? this.logger.info("Resettable files saved.") : null;
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, "Cannot save resettable files.");
    }
  }

  /**
   * Resets modifications made by this library by deleting created files and returns data files in original state.
   * WARNING: Does not recreate deleted files.
   * @returns {void}
   * @throws  {VError}  - Throws error if files cannot be written
   */
  resetSync() {
    const internal = internalData.get(this);
    try {
      this.logger.info("Reset begins.");
      const allFiles = uniq(Object.keys(internal.registry.files).concat(Object.keys(internal.dataFiles)));
      allFiles.forEach(projectFile => this.resetFileSync(projectFile));

      // Delete created directories if they are empty.
      clone(internal.registry.directories)
        .reverse()
        .forEach(dir => this.deleteDirSync(dir));

      this.saveRegistrySync({ isReset: true });
      this.logger.info("Reset ends.");
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, "Cannot reset ResettableFile");
    }
  }

  /**
   * Resets given file.
   * @param   {string} projectFile - File to reset
   * @returns {void}
   * @throws  {VError}             - Throws error if file cannot be reset.
   */
  resetFileSync(projectFile: string, { throwOnError = true } = {}) {
    const internal = internalData.get(this);
    const registryValue = internal.registry.files[projectFile];
    const dataFilesValue = internal.dataFiles[projectFile];
    if (registryValue || dataFilesValue) {
      this.isDataFile(projectFile) ? this.resetDataFileSync(projectFile) : this.deleteFileSync(projectFile);
    } else {
      const message = `Cannot reset file (not in registry): ${this.fromRoot(projectFile)}`;
      if (throwOnError) {
        throw new VError(message);
      }
      this.logger.warn(message);
    }
  }

  /**
   * Returns file details related to given file path relative to root.
   * @param   {string}              projectFile   - File to get detail for.
   * @param   {Object}              options       - Options
   * @param   {boolean}             options.force - Assume safe to operate on file even it is not auto created.
   * @param   {boolean}             options.track - Whether to track file if it is created by module.
   * @returns {FileDetail}                        - File details
   * @throws  {VError}                            - Throws error if file details cannot be get.
   */
  getFileDetailsSync(projectFile: string, { force, track }: { force: boolean; track: boolean }): FileDetail {
    const internal = internalData.get(this);
    const filePath = this.fromRoot(projectFile);
    const result: FileDetail = { isSafe: false };
    const registryValue = internal.registry.files[projectFile];
    const isInRegistry = projectFile in internal.registry.files;
    const exists = this.hasFileSync(projectFile);

    try {
      if (exists) {
        const realPath = fs.realpathSync(filePath);
        result.stats = fs.lstatSync(filePath);
        result.linkTarget = result.stats.isSymbolicLink() ? realPath : undefined;

        const realFileStats = result.linkTarget ? fs.lstatSync(realPath) : undefined;
        result.hash =
          result.stats.isDirectory() || (realFileStats && realFileStats.isDirectory()) ? undefined : this.getFileHashSync(projectFile);
      }

      if (force) {
        result.isSafe = true;
      } else if (!track) {
        result.isSafe = !exists; // If it is not tracked, report not safe for existing files to prevent overwrite.
      } else if (this.isDataFile(projectFile)) {
        result.isSafe = false; // Data files.
      } else {
        result.isSafe = !result.stats && !isInRegistry;
        if (result.stats && isInRegistry) {
          if (result.linkTarget) {
            result.isSafe = result.linkTarget === registryValue;
          } else {
            result.isSafe = result.hash === registryValue;
          }
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot get file details: ${filePath}.`);
    }

    this.logger.debug(
      `[getFileDetails] force: ${force}, track: ${track}, isInRegistry: ${isInRegistry}, registryValue: ${registryValue}, result: { isSafe: ${
        result.isSafe
      }, stats: ${result.stats ? "available" : "undefined"}, linkTarget: ${result.linkTarget} }`,
    );

    return result;
  }

  /**
   * Calculates and returns hash for given file relative to root. For js, json and yaml files, ignores format differences and returns
   * same hash for same data even they are formatted differently.
   * @param   {string} projectFile  - File path of the file relative to root to calculate hash for.
   * @returns {string}              - Calculated hash for file.
   */
  getFileHashSync(projectFile: string): string {
    let content: any;
    try {
      content = fs.readFileSync(this.fromRoot(projectFile), "utf8");
      if (path.extname(projectFile) === ".js") {
        // prettier-ignore
        return crypto.createHash("sha1").update(js_beautify(content)).digest("hex");
      }
      // If it is parseble data, use object to ignore whitespace differences.
      const { format, data } = parseData(content);
      data.__hash_format__ = format; // To detect different format of same data, add format as a key.
      return hashObject(data);
    } catch (e) {
      // prettier-ignore
      return crypto.createHash("sha1").update(content).digest("hex");
    }
  }

  /**
   * Reads json or yaml data file and returns {@link DataObject} instance. Records changes made to object and writes them to registry file to be cleared when necessary.
   * Changes made are saved to same file when project is saved via `save()` method.
   * @param   {string}          projectFile                       - File path to read relative to root.
   * @param   {Object}          [options]                         - Options
   * @param   {boolean}         [options.create=false]            - Whether to create file if it does not exist.
   * @param   {Object}          [options.defaultContent]          - Default content to write if file is created.
   * @param   {boolean}         [options.throwNotExists=true]     - Throw error if file does not exist.
   * @param   {boolean}         [options.format=[file extension]] - Format to serialize data in given format. (`json` or `yaml`) Default is `json`.
   * @param   {boolean}         [options.createFormat="json"]     - Format to serialize data in given format. (`json` or `yaml`) Default is `json`.
   * @param   {boolean}         [options.track=[this.track]]      - Whether to track file in registry if it is created by module.
   * @param   {boolean}         [options.force=false]             - Whether to force write file even it exist.
   * @param   {Array.<string>}  [options.sortKeys]                - List of keys which their values shoud be sorted. Key names be paths like "scripts.test"
   * @returns {DataObject}                                        - {@link DataObject} instance.
   * @throws  {VError}                                            - Throws error if file cannot be created.
   */
  getDataObjectSync(
    projectFile: string,
    {
      create = false,
      defaultContent = {} as { [key: string]: any },
      throwNotExists = true,
      format = extensionFormat[path.extname(projectFile)],
      createFormat = (format || "json") as Format,
      track = this.track,
      sortKeys = undefined as undefined | Path[],
      force = false,
    }: FileOptions = {},
  ): DataObject {
    const internal = internalData.get(this);
    const file = this.fromRoot(projectFile);

    if (internal.dataFiles[projectFile]) {
      return internal.dataFiles[projectFile];
    }

    try {
      let operations = internal.registry.files[projectFile];

      if (typeof operations === "string") {
        const { isSafe } = this.getFileDetailsSync(projectFile, { force, track: true });
        if (!isSafe) {
          throw new VError(`Already tracked as a regular file and it is changed: ${file}`);
        } else {
          this.logger.info(`Tracked file changed to tracked data file in registry: ${file}`);
          operations = [];
        }
      }

      const exists = this.hasFileSync(projectFile);
      // prettier-ignore
      const { data, format: parsedFormat } = this.readFileDetailedSync(projectFile, { createFormat, create, format, throwNotExists, force, defaultContent, parse: true, serialize: true, track: false }); // Track is false, because tracked data files are tracked key level and written partially.

      if (!exists && !internal.registry.createdDataFiles.includes(projectFile)) {
        internal.registry.createdDataFiles.push(projectFile);
      }

      // prettier-ignore
      internal.dataFiles[projectFile] = new DataObject(data, { track, sortKeys, operations, newCreated: !exists, logger: this.logger, format: parsedFormat!, name: file });
      return internal.dataFiles[projectFile];
    } catch (e) {
      throw new VError(e, `Cannot read data from file: ${file}`);
    }
  }

  /**
   * Resets data modifications made by this library from given file. After clearing if data is an empty object (`{}`), deletes file.
   * @param   {string} projectFile  - Project file to clear
   * @returns {void}
   * @private
   */
  private resetDataFileSync(projectFile: string) {
    const internal = internalData.get(this);
    const file = this.fromRoot(projectFile);
    const dataObject = this.getDataObjectSync(projectFile);
    const unapplied = dataObject.reset();
    const emptyData = isEqual(dataObject.data, {}) || !internal.registry.files[projectFile];
    const createdIndex = internal.registry.createdDataFiles.indexOf(projectFile);

    internal.registry.createdDataFiles.splice(createdIndex, 1);

    if (emptyData && createdIndex > -1) {
      fs.removeSync(file);
      this.logger.info(`Deleted data file after reset (empty object created by ResettableFile): ${file}`);
    } else {
      const { format, sortKeys } = dataObject;
      this.writeFileSync(projectFile, dataObject.data, { format, sortKeys, serialize: true, track: false, force: true }); // Track is false, because tracked data files are tracked key level and written partially.
    }

    /* istanbul ignore next */
    unapplied
      ? this.logger.warn(`Cannot reset data file (some steps cannot be reset): ${this.fromRoot(file)}`)
      : delete internal.registry.files[projectFile];
  }

  /**
   * Creates a symbolic link in project which points to a file in module. Removes previously created symbolic link created by this library.
   * @param   {string}        targetFile                    - Target file which link points to. Should be given relative to module root.
   * @param   {string}        projectFile                   - Link file. Should be given relative to project root.
   * @param   {Object}        [options]                     - Options
   * @param   {boolean}       [options.force=false]         - Writes file even it exists and not auto created.
   * @param   {boolean}       [options.track=[this.track]]  - Whether to track symlink if it is created by module.
   * @returns {void}
   * @throws  {VError}                                      - Throws error if symbolic link cannot be created.
   * @example
   * // Creates tsconfig.json symbolic link file in project root, pointing to a file from toolkit.
   * createSymLink(here('../../config.json'), 'tsconfig.json');
   */
  createSymLinkSync(targetFile: string, projectFile: string, { force = false, track = this.track } = {}) {
    const internal = internalData.get(this);
    const { isSafe, stats, linkTarget } = this.getFileDetailsSync(projectFile, { force, track });
    const fileAbsolute = this.fromRoot(projectFile);
    const target = this.fromSourceRoot(targetFile);

    try {
      if (linkTarget && target === linkTarget) {
        this.logger.verbose(`Skipped symbolic link creation (file exists and has same target): ${target} -> ${fileAbsolute}`);
      } else if (!isSafe) {
        this.logger.warn(`Skipped symbolic link creation (changed by user): ${target} -> ${fileAbsolute}`);
      } else {
        if (stats) {
          fs.removeSync(fileAbsolute);
        }

        const type = fs.lstatSync(target).isDirectory() ? "dir" : "file";
        const linkPath = path.relative(path.dirname(fileAbsolute), target);
        fs.symlinkSync(linkPath, fileAbsolute, type);
        this.logger.info(`${stats ? "Overwritten" : "Created"} symbolic link: ${target} -> ${fileAbsolute}`);
        if (track) {
          internal.registry.files[projectFile] = target;
        }
      }
    } catch (e) {
      throw new VError(e, `Cannot create symbolic link:  ${target} -> ${fileAbsolute}`);
    }
  }

  /**
   * Reads and returns content of the given file relative to root. Optionally can create file if it does not exist.
   * @param   {string}      projectFile                       - File to read relative to root.
   * @param   {Object}      [options]                         - Options
   * @param   {boolean}     [options.create=false]            - Whether to create file if it does not exist.
   * @param   {boolean}     [options.track=[this.track]]      - Whether to track file in registry if it is created by module.
   * @param   {boolean}     [options.force=false]             - Whether to force create even it is deleted by user.
   * @param   {*}           [options.defaultContent]          - Default content to write if file does not exist.
   * @param   {boolean}     [options.throwNotExists=true]     - Throw error if file does not exist.
   * @param   {boolean}     [options.parse=false]             - Whether to parse file content to create a js object.
   * @param   {Format}      [options.format=[file extension]] - Format to use parsing data.
   * @param   {Format}      [options.createFormat=json]       - Format to be used while creating nonexisting file if no format is provided.
   * @param   {Format}      [options.serialize=[parse]]       - Whether to serialize content if file is created. (Default is status of parse option)
   * @returns {*}                                             - Content of the file.
   * @throws  {VError}                                        - Throws error if file cannot be found.
   */
  readFileSync(projectFile: string, options?: FileOptions): any | undefined {
    return this.readFileDetailedSync(projectFile, options).data;
  }

  /**
   * Reads and returns content and format of the given file relative to project root. Optionally can create file if it does not exist.
   * @param   {string}      projectFile                       - File to read relative to project root.
   * @param   {Object}      [options]                         - Options
   * @param   {boolean}     [options.create=false]            - Whether to create file if it does not exist.
   * @param   {boolean}     [options.track=[this.track]]      - Whether to track file in registry if it is created by module.
   * @param   {boolean}     [options.force=false]             - Whether to force create even it is deleted by user.
   * @param   {*}           [options.defaultContent]          - Default content to write if file does not exist.
   * @param   {boolean}     [options.throwNotExists=true]     - Throw error if file does not exist.
   * @param   {boolean}     [options.parse=false]             - Whether to parse file content to create a js object.
   * @param   {Format}      [options.format=[file extension]] - Format to use parsing data.
   * @param   {Format}      [options.createFormat=json]       - Format to be used while creating nonexisting file if no format is provided.
   * @param   {Format}      [options.serialize=[parse]]       - Whether to serialize content if file is created. (Default is status of parse option)
   * @returns {{ data:*, format: Format }}                    - Content of the file.
   * @throws  {VError}                                        - Throws error if file cannot be found.
   */
  readFileDetailedSync(
    projectFile: string,
    {
      create = false,
      track = this.track,
      force = false,
      defaultContent,
      throwNotExists = true,
      parse = false,
      format = extensionFormat[path.extname(projectFile)],
      createFormat = (format || "json") as Format,
      serialize = parse,
    }: FileOptions = {},
  ): { data?: any; format?: Format } {
    const file = this.fromRoot(projectFile);

    try {
      const exists = this.hasFileSync(projectFile);

      if (exists) {
        const content = fs.readFileSync(file, "utf8");
        return parse ? parseData(content, format) : { data: content, format: undefined };
      }
      if (create) {
        this.logger.verbose(`File does not exists and will be created (create option in effect): ${file}`);
        this.writeFileSync(projectFile, defaultContent || "", { force, track, serialize, format: format || createFormat });
        return { data: defaultContent, format: serialize ? createFormat : undefined };
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot read from file: ${file}`);
    }

    if (throwNotExists) {
      throw new VError(`File not found: ${file}`);
    }

    return { data: defaultContent, format: defaultContent ? createFormat : undefined };
  }

  /**
   * Creates and writes given data to a file in project.
   * @param   {string}        projectFile                       - File path to relative to project root.
   * @param   {string}        data                              - Data to write
   * @param   {Object}        [options]                         - Options
   * @param   {boolean}       [options.force=false]             - Writes file even it exists and not auto created.
   * @param   {boolean}       [options.track=[this.track]]      - Whether to track file in registry if it is created by module.
   * @param   {boolean}       [options.serialize=false]         - Whether to serialize object before written to file.
   * @param   {Format}        [options.format=[file extension]] - Format to use serializing data.
   * @param   {Array}         [options.sortKeys]                - Keys to be sorted. Keys may be given as chained paths. (i.e. `a.b.c` -> Keys of c would be sorted)
   * @returns {void}
   * @throws  {VError}                                          - Throws error if file cannot be created
   * @example
   * project.writeFile("./some-config.json", '{"name": "my-project"}'); // Writes given data to some-config.json in project root.
   */
  writeFileSync(
    projectFile: string,
    data: string | { [key: string]: any },
    {
      force = false,
      track = this.track,
      serialize = false,
      format = extensionFormat[path.extname(projectFile)],
      sortKeys = undefined,
    }: FileOptions = {},
  ): void {
    if (data === null || data === undefined) {
      throw new VError("Cannot write file. File data to be written cannot be undefined or null. Use empty string if necessary.");
    }

    if (!serialize && typeof data !== "string") {
      throw new VError("Cannot write file, because content is not a string and 'serialize' / 'parse' is false.");
    }

    const internal = internalData.get(this);
    const filePath = this.fromRoot(projectFile);
    const { isSafe, stats } = this.getFileDetailsSync(projectFile, { force, track });
    const serializeFormat = serialize ? format || getFileFormat(filePath) : format;

    try {
      if (isSafe) {
        const content = serialize ? serializeData(data as object, serializeFormat, sortKeys).data : data;
        fs.outputFileSync(filePath, content);

        if (track) {
          internal.registry.files[projectFile] = this.getFileHashSync(projectFile);
        }

        this.logger.info(`Written file (${track ? "" : "not "}tracked): ${filePath}`);
      } else {
        this.logger.warn(`Skipped write file (${track ? "" : "not "}tracked): ${filePath}`);
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot create file: ${filePath}.`);
    }

    let logText = `Registry: ${log(internal.registry)}`;
    logText = logText + `Exists: ${!!stats} ${log({ force, track, serialize, format, serializeFormat })}`;
    this.logger.debug(`[writeFile] ${logText}`.replace(new RegExp("\n", "g"), ""));
  }

  /**
   * Deletes a file from project. Path should be given relative to project root.
   * @param   {string}        projectFile                   - File path relative to paroject root.
   * @param   {Object}        [options]                     - Options
   * @param   {boolean}       [options.force=false]         - Deletes file even it exists and not auto created.
   * @param   {boolean}       [options.track=[this.track]]  - Whether to operate in tracked mode. In non-tracked mode existing files are not deleted if force is not active.
   * @param   {boolean}       [options.log=true]            - Whether to log operation.
   * @returns {void}
   * @throws  {VError}                                      - Throws error if file cannot be deleted.
   * @example
   * project.copy("./some-config.json", "./some-config.json"); // Copies some-config.json file from module's root to project's root.
   */
  deleteFileSync(projectFile: string, { force = false, track = this.track, log = true } = {}) {
    const internal = internalData.get(this);
    const file = this.fromRoot(projectFile);
    const { isSafe, stats } = this.hasFileSync(projectFile)
      ? this.getFileDetailsSync(projectFile, { force, track })
      : { isSafe: true, stats: undefined };

    if (stats && stats.isDirectory()) {
      throw new VError(`Cannot delete (It is a directory). Use "deleteDir": ${file}`);
    }
    try {
      if (isSafe) {
        fs.removeSync(file);
        log ? this.logger.info(`Deleted file (${track ? "" : "not "}tracked): ${file}`) : "";
        delete internal.registry.files[projectFile]; // Delete from registry.
      } else {
        log ? this.logger.warn(`Skipped delete file (${track ? "" : "not "}tracked): ${file}`) : "";
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot delete file: ${file}`);
    }
  }

  /**
   * Copies a file from module to project. Paths should be given relative to module root and project root.
   * @param { string}         sourceFile                    - Source file path.
   * @param   {string}        projectFile                   - Destinantion file path relative to paroject root.
   * @param   {Object}        [options]                     - Options
   * @param   {boolean}       [options.force=false]         - Overwrites file even it exists and not auto created.
   * @param   {boolean}       [options.track=[this.track]]  - Whether to track file in registry if it is created by module.
   * @returns {void}
   * @throws  {VError}                                      - Throws error if file cannot be created
   * @example
   * project.copy("./some-config.json", "./some-config.json"); // Copies some-config.json file from module's root to project's root.
   */
  copyFileSync(sourceFile: string, projectFile: string, { force = false, track = this.track } = {}) {
    const internal = internalData.get(this);
    const source = this.fromSourceRoot(sourceFile);
    const destination = this.fromRoot(projectFile);
    const { isSafe } = this.getFileDetailsSync(projectFile, { force, track });

    try {
      if (isSafe) {
        fs.copySync(source, destination);
        this.logger.info(`Copied file (${track ? "" : "not "}tracked): ${source} to ${destination}`);
        if (track) {
          internal.registry.files[projectFile] = this.getFileHashSync(projectFile); // Calculate fresh hash here, because getFileDetails() returns previous file (overwritten file) hash.
        }
      } else {
        this.logger.warn(`Skipped copy file (${track ? "" : "not "}tracked): ${source} to ${destination}`);
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot copy file: ${source} to ${destination}`);
    }
  }

  /**
   * Creates given directory and its tree relative to project root.
   * @param   {string}  projectDir                    - Directory path to relative to project root.
   * @param   {Object}  [options]                     - Options
   * @param   {boolean} [options.track=[this.track]]  - Whether to track file in registry if it is created by module.
   * @param   {boolean} [options.logDirs=true]        - Whether to log delete operation of sub directories.
   * @returns {void}
   * @throws  {VError}                                - Throws error if directory tree cannot be created.
   * @example
   * project.createDir("path/to/dir"); // Created "path", "to" and "dir" as necessary.
   */
  createDirSync(projectDir: string, { track = this.track, logDirs = true } = {}) {
    const internal = internalData.get(this);
    const parts = path.normalize(projectDir).split(path.sep);
    let current = "";
    let topDir = true;

    try {
      for (const part of parts) {
        current = path.join(current, part);
        if (!fs.existsSync(this.fromRoot(current))) {
          fs.mkdirSync(this.fromRoot(current));
          topDir || logDirs ? this.logger.info(`Created directory (${track ? "" : "not "}tracked): ${this.fromRoot(current)}`) : "";
          if (track) {
            internal.registry.directories.push(current);
          }
        } else {
          topDir || logDirs
            ? this.logger.warn(`Skipped create directory (${track ? "" : "not "}tracked) (directory exists): ${this.fromRoot(current)}`)
            : "";
        }
        topDir = false;
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot create directory: ${this.fromRoot(current)} during creation of ${this.fromRoot(projectDir)}`);
    }
  }

  /**
   * Deletes directory if empty or all of it's contents are created by this library. `force` option may be used to delete non-empty directories.
   * @param   {string}        projectDir                    - Destinantion directory to delete.
   * @param   {Object}        [options]                     - Options
   * @param   {boolean}       [options.force=false]         - Deletes directory and it's contents even it is not empty.
   * @param   {boolean}       [options.track=[this.track]]  - Whether to track file in registry if it is created by module.
   * @param   {boolean}       [options.logFiles=true]       - Whether to log delete operation of files.
   * @param   {boolean}       [options.logDirs=true]        - Whether to log delete operation of sub directories.
   * @returns {void}
   * @throws  {VError}                                      - Throws error if directory or its content cannot be deleted.
   */
  deleteDirSync(projectDir: string, { force = false, track = this.track, logFiles = true, logDirs = true, topDir = true } = {}) {
    const internal = internalData.get(this);
    const dir = this.fromRoot(projectDir);

    try {
      const dirFiles = fs.readdirSync(dir);

      for (const dirFile of dirFiles) {
        const file = path.join(dir, dirFile);
        if (fs.lstatSync(file).isDirectory()) {
          this.deleteDirSync(path.join(projectDir, dirFile), { force, track, logFiles, logDirs, topDir: false });
        } else {
          this.deleteFileSync(path.join(projectDir, dirFile), { force, track, log: logFiles });
        }
      }

      if (force || emptyDir.sync(dir)) {
        fs.removeSync(dir);
        logDirs || topDir ? this.logger.info(`Deleted directory: ${dir}`) : "";
        const index = internal.registry.directories.indexOf(projectDir);
        if (index > -1) {
          internal.registry.directories.splice(index, 1);
        }
      } else {
        logDirs || topDir ? this.logger.warn(`Skipped delete directory: ${dir}`) : "";
      }
    } catch (e) {
      /* istanbul ignore next */
      throw new VError(e, `Cannot delete directory: ${dir}`);
    }
  }
}

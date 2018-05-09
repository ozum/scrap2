const winston = require("winston");
import fs from "fs-extra";
import { Operation } from "resettable";

export const logger = new winston.createLogger();
export type Logger = typeof logger;

export interface BasicLogger {
  none?: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  info: (message: string) => void;
  debug: (message: string) => void;
  verbose: (message: string) => void;
  silly: (message: string) => void;
}

/**
 * Data format supported by this library.
 * @typedef {"json"|"yaml"} Format
 */
export type Format = "json" | "yaml";
export type Data = { [key: string]: any };
export type Path = string | Array<string>;

/**
 * Type to store file details.
 * @typedef {Object} Project~FileDetail
 * @property {boolean}  isSafe        - Whether it is safe to delete or change given file. (Is true if file is created automatically by module and is not modified by user.)
 * @property {fs.Stats} [stats]       - `fs.Stats` file details. Undefined if file does not exists.
 * @property {string}   [linkTarget]  - If file is a symbolic link, target path relative to module root.
 * @property {string}   [hash]        - File hash (Undefined for directories)
 */
export interface FileDetail {
  isSafe: boolean;
  stats?: fs.Stats;
  linkTarget?: string;
  hash?: string;
}

/**
 * Type for file operation methods' options.
 * @typedef {Object} FileOptions
 * @property {boolean}  [create]          - Whether to create file if it does not exist.
 * @property {boolean}  [track]           - Whether to track file in registry if it is created by module.
 * @property {boolean}  [force]           - Whether to force create even it is deleted by user.
 * @property {*}        [defaultContent]  - Default content to write if file does not exist.
 * @property {boolean}  [errorNotExists]  - Throw error if file does not exist.
 * @property {boolean}  [parse]           - Whether to parse file content to create a js object.
 * @property {Format}   [format]          - Format to use parsing data.
 * @property {Format}   [createFormat]    - Format to be used while creating nonexisting file if no format is provided.
 * @property {Format}   [serialize]       - Whether to serialize content if file is created. (Default is status of parse option)
 * @property {Array}    [sortKeys]        - Keys to be sorted. Keys may be given as chained paths. (i.e. `a.b.c` -> Keys of c would be sorted)
 */
export interface FileOptions {
  create?: boolean;
  defaultContent?: { [key: string]: any } | string;
  throwNotExists?: boolean;
  format?: Format;
  createFormat?: Format;
  track?: boolean;
  sortKeys?: Path[];
  force?: boolean;
  parse?: boolean;
  serialize?: boolean;
}

/**
 * Type for registry
 * @typedef {Object} Registry
 * @property {Object.<string, Operation[] | string>}  files       - Object which stores files. Keys are file names relative to root, values are array of operations (for data files), hash (for regular files) or target file (for symbolic links)
 * @property {Array.<string>}                         directories - List of directories created.
 */
export type Registry = {
  createdDataFiles: Array<string>;
  files: { [key: string]: Operation[] | string };
  directories: Array<string>;
};

/* istanbul ignore next */
const docMe = 1;

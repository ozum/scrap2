import * as childProcess from "child_process";
import path from "path";
import fs from "fs-extra";
import { promisify } from "util";
import has from "lodash.has";

import ResettableFile from "./index";
import { stubLogger } from "./logger";
import { BasicLogger } from "./@types";

const [exec] = [promisify(childProcess.exec)];

const LOGLEVEL: keyof BasicLogger = "error";
const paths = {
  projectMaster: path.join(__dirname, "./__test_supplements__/project-master"),
  project: path.join(__dirname, "./__test_supplements__/project"),
  project2Master: path.join(__dirname, "./__test_supplements__/project-2-master"),
  project2: path.join(__dirname, "./__test_supplements__/project-2"),
  sourceFiles: path.join(__dirname, "./__test_supplements__/files"),
};
let resettableFile: ResettableFile;

// Generates a filename to be used in tests
function getFileName(extension = ""): [string, string] {
  const randomInt = Math.floor(Math.random() * Math.floor(999999));
  const dot = extension ? "." : "";
  const file = `auto-test-qx-${randomInt}${dot}${extension}`;
  return [file, path.join(paths.project, file)];
}

// Deletes directory of project and copies files from master
async function refresh(projectNo: number | "" = "", options = {}): Promise<ResettableFile> {
  const project = paths[`project${projectNo}`];
  const master = paths[`project${projectNo}Master`];
  return fs
    .remove(project)
    .then(() => fs.copy(master, project))
    .then(
      () =>
        new ResettableFile(
          path.join(project, "registry.json"),
          Object.assign({ sourceRoot: paths.sourceFiles, logLevel: LOGLEVEL }, options),
        ),
    );
}

// Deletes directory of project
async function clear(projectNo: number | "" = ""): Promise<void> {
  const project = paths[`project${projectNo}`];
  return fs.remove(project);
}

beforeAll(async () => {
  try {
    resettableFile = await refresh();
  } catch (e) {
    console.error(e);
  }
});

afterAll(async () => {
  try {
    await Promise.all([clear(), clear(2)]);
  } catch (e) {
    console.error(e);
  }
});

describe("ResettableFile", () => {
  it("should create object with options", () => {
    const rf = new ResettableFile(path.join(paths.project2, "registry.json"));
    expect(rf.root).toBe(paths.project2);
  });

  it("should create object with all options", () => {
    const rf = new ResettableFile(path.join(paths.project2, "registry.json"), {
      sourceRoot: paths.sourceFiles,
      track: false,
      logger: stubLogger,
      logLevel: LOGLEVEL,
    });
    expect(rf.root).toBe(paths.project2);
  });

  it("should have root attribute", () => {
    expect(resettableFile.root).toBe(paths.project);
  });

  it("should have track attribute", () => {
    expect(resettableFile.track).toBe(true);
  });

  it("should have readable/writeable logLevel attribute", () => {
    const oldLevel = resettableFile.logLevel;
    resettableFile.logLevel = "none";
    expect(resettableFile.logLevel).toBe("none");
    resettableFile.logLevel = oldLevel;
  });

  it("should calculate fromRoot()", () => {
    expect(resettableFile.fromRoot("some/file.js")).toBe(path.join(paths.project, "some/file.js"));
  });

  describe("hasFileSync() method", () => {
    it("should return true for existing files", () => {
      expect(resettableFile.hasFileSync("index.js")).toBe(true);
    });

    it("should return false for non-existing files", () => {
      expect(resettableFile.hasFileSync("non-exists.js")).toBe(false);
    });

    it("should return 1 for existing files", () => {
      expect(resettableFile.hasFileSync("index.js", 1, 0)).toBe(1);
    });

    it("should return 0 for non-existing files", () => {
      expect(resettableFile.hasFileSync("non-exists.js", 1, 0)).toBe(0);
    });
  });

  describe("createSymLinkSync() method", () => {
    it("should create symbolic link", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.createSymLinkSync("some-config/link-target.json", projectFile);
      const stats = fs.lstatSync(file);
      const target = fs.realpathSync(file);
      expect([stats.isSymbolicLink(), target]).toEqual([true, path.join(paths.sourceFiles, "some-config/link-target.json")]);
    });

    it("should not create symbolic link if manual created file exists", () => {
      resettableFile.createSymLinkSync("some-config/link-target.json", "user-created.json");
      const content = fs.readJsonSync(path.join(paths.project, "user-created.json"));
      expect(content).toEqual({ Manual: "Custom" });
    });

    it("should create symbolic link if manual created file exists (force = true)", () => {
      const [projectFile, file] = getFileName();
      fs.writeFileSync(file, "x");
      resettableFile.createSymLinkSync("some-config/link-target.json", projectFile, { force: true });
      const stats = fs.lstatSync(file);
      const target = fs.realpathSync(file);
      expect([stats.isSymbolicLink(), target]).toEqual([true, path.join(paths.sourceFiles, "some-config/link-target.json")]);
    });

    it("should create non tracked symbolic link", () => {
      const [projectFile, file] = getFileName();
      resettableFile.createSymLinkSync("some-config/link-target.json", projectFile, { track: false });
      const stats = fs.lstatSync(file);
      const target = fs.realpathSync(file);
      expect([stats.isSymbolicLink(), target]).toEqual([true, path.join(paths.sourceFiles, "some-config/link-target.json")]);
    });

    it("should not overwrite non tracked symbolic link", () => {
      const [projectFile, file] = getFileName();
      resettableFile.createSymLinkSync("some-config/link-target.json", projectFile, { track: false });
      resettableFile.deleteFileSync(projectFile);
      const exists = fs.existsSync(file);
      expect(exists).toBe(true);
    });

    it("should not recreate same symbolic link", () => {
      const [projectFile, file] = getFileName();
      resettableFile.createSymLinkSync("some-config/link-target.json", projectFile);
      resettableFile.createSymLinkSync("some-config/link-target.json", projectFile);
      const exists = fs.existsSync(file);
      expect(exists).toBe(true);
    });

    it("should recreate symbolic link to directory", () => {
      const [projectFile, file] = getFileName();
      resettableFile.createSymLinkSync("some-config", projectFile);
      const exists = fs.existsSync(file);
      expect(exists).toBe(true);
    });

    it("should throw if symbolic link cannot be created", () => {
      const [projectFile, file] = getFileName();
      expect(() => resettableFile.createSymLinkSync("not-exists", projectFile)).toThrow("Cannot create symbolic link");
    });
  });

  describe("getDataObjectSync() method", () => {
    it("should create data file if does not exist (create = true)", () => {
      resettableFile.getDataObjectSync("x.json", { create: true, defaultContent: { x: 1 } });
      const data = fs.readJsonSync(resettableFile.fromRoot("x.json"));
      expect(data).toEqual({ x: 1 });
    });

    it("should create data file even if it is deleted by user (force: true)", () => {
      const [projectFile, file] = getFileName();
      resettableFile.copyFileSync("data.json", projectFile);
      fs.removeSync(file);
      resettableFile.getDataObjectSync(projectFile, {
        create: true,
        defaultContent: { default: true },
        sortKeys: [],
        createFormat: "yaml",
        force: true,
        track: false,
      });
      const exists = fs.existsSync(file);
      const content = fs.readFileSync(file, "utf8").replace(new RegExp("\\s", "g"), "");
      expect([exists, content]).toEqual([true, "default:true"]);
    });

    it("should return same content without reading from disk again if required twice", () => {
      const [projectFile, file] = getFileName();
      const firstRead = resettableFile.getDataObjectSync(projectFile, { create: true, defaultContent: { a: 1 } });
      fs.writeFileSync(file, '{ "a": 2 }');
      const secondRead = resettableFile.getDataObjectSync(projectFile);
      expect(secondRead.data).toEqual({ a: 1 });
    });

    it("should return default content without creating file (throwNotExists: false, format: json)", () => {
      const [projectFile, file] = getFileName();
      const dataObject = resettableFile.getDataObjectSync(projectFile, { throwNotExists: false, format: "json" });
      const exists = fs.existsSync(file);
      expect([exists, dataObject.data]).toEqual([false, {}]);
    });

    it("should create file with default format if no format can be decided", () => {
      const [projectFile, file] = getFileName();
      resettableFile.getDataObjectSync(projectFile, { create: true, defaultContent: { a: 1 }, format: undefined, createFormat: undefined });
      const content = fs.readFileSync(file, "utf8").replace(new RegExp("\\s", "g"), "");
      expect(content).toEqual('{"a":1}');
    });

    it("should convert tracked file to tracked data data file", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.copyFileSync("data.json", projectFile);
      const dataObject = resettableFile.getDataObjectSync(projectFile);
      expect(dataObject.data.is).toBe(true);
      dataObject.reset();
    });

    it("should throw if changed file tried to be overwritten", () => {
      const [projectFile, file] = getFileName();
      resettableFile.copyFileSync("data.json", projectFile);
      fs.removeSync(file);

      expect(() => resettableFile.getDataObjectSync(projectFile, { create: true })).toThrow("it is changed");
    });

    it("should throw if file cannot be read", () => {
      expect(() => resettableFile.getDataObjectSync("not-exists")).toThrow("Cannot read data from file");
    });
  });

  describe("resetFileSync() method", () => {
    it("should reset data file", () => {
      const dataObject = resettableFile.getDataObjectSync("data.json");
      dataObject.set("x", 1);
      resettableFile.resetFileSync("data.json");
      expect(dataObject.has("x")).toBe(false);
    });

    // it("should reset data file", () => {
    //   const dataObject = resettableFile.getDataObjectSync("data.json");
    //   dataObject.set("x", 1);
    //   resettableFile.saveSync();
    //   resettableFile.resetFileSync("data.json");
    //   const data = fs.readJsonSync(path.join(paths.project, "data.json"));
    //   expect(has(data, "x")).toBe(false);
    // });

    it("should throw if non-tracked file tried to be reset", () => {
      expect(() => resettableFile.resetFileSync("text.txt")).toThrow("Cannot reset file");
    });

    it("should not reset if non-tracked file tried to be reset (throwOnError: false)", () => {
      resettableFile.resetFileSync("text.txt", { throwOnError: false });
      const exists = fs.existsSync(resettableFile.fromRoot("text.txt"));
      expect(exists).toBe(true);
    });

    it("should delete file after reset if object is empty", () => {
      const [projectFile, file] = getFileName();
      const dataObject = resettableFile.getDataObjectSync(projectFile, { create: true });
      const created = fs.existsSync(file);
      dataObject.set("x", 1);
      resettableFile.resetFileSync(projectFile);
      const deleted = !fs.existsSync(file);
      expect([created, deleted]).toEqual([true, true]);
    });
  });

  describe("readFileSync() method", () => {
    it("should read file", () => {
      const content = resettableFile.readFileSync("text.txt");
      expect(content).toEqual("text file\n");
    });

    it("should parse file (parse = true)", () => {
      const data = resettableFile.readFileSync("user-created.json", { parse: true });
      expect(data).toEqual({ Manual: "Custom" });
    });

    it("should create non existing file (create = true)", () => {
      resettableFile.readFileSync("read-file.json", { create: true, defaultContent: { color: "red" }, parse: true });
      const data = fs.readJsonSync(path.join(paths.project, "read-file.json"));
      expect(data).toEqual({ color: "red" });
    });

    it("should create non existing file with an empty content (create = true)", () => {
      const [projectFile, file] = getFileName();
      resettableFile.readFileSync(projectFile, { create: true });
      const data = fs.readFileSync(file, "utf8");
      expect(data).toBe("");
    });

    it("should return default content (create = false, throwNotExists = false)", () => {
      const [projectFile, file] = getFileName();
      const content = resettableFile.readFileSync(projectFile, { throwNotExists: false });
      expect(content).toBeUndefined();
    });

    it("should not create non-existing file if user deleted it", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.writeFileSync(projectFile, '{ "no": 1 }'); // Create a project file.
      fs.removeSync(file); // User removes it.
      const data = resettableFile.readFileSync(projectFile, { create: true, parse: true, defaultContent: { no: 1 } }); // It should not create deleted file.
      const exists = fs.existsSync(file);
      expect(exists).toBe(false);
    });

    it("should create non-existing file even user deleted it (force = true)", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.writeFileSync(projectFile, '{ "no": 1 }'); // Create a project file.
      fs.removeSync(file); // User removes it.
      const data = resettableFile.readFileSync(projectFile, { create: true, force: true, parse: true, defaultContent: { no: 1 } }); // It should create deleted file.
      const data2 = fs.readJsonSync(file);
      expect(data).toEqual({ no: 1 });
      expect(data).toEqual(data2);
    });

    it("should create non-existing file with given format (createFormat = 'yaml')", () => {
      const [projectFile, file] = getFileName();
      const data = resettableFile.readFileSync(projectFile, { create: true, parse: true, createFormat: "yaml", defaultContent: { no: 2 } });
      const data2 = fs.readFileSync(file, "utf8");
      expect(data2).toEqual("'no': 2\n"); // YAML
    });

    it("should throw for non-existing file without create (create = false)", () => {
      expect(() => resettableFile.readFileSync("not-exists")).toThrow("File not found");
    });

    it("should parse file without extension if format given (format = 'yaml')", () => {
      const [projectFile, file] = getFileName();
      const data = resettableFile.readFileSync("yaml-file", { parse: true, format: "yaml" });
      expect(data.languages.perl).toBe("Elite");
    });

    it("should parse file without extension if no format given", () => {
      const [projectFile, file] = getFileName();
      const data = resettableFile.readFileSync("yaml-file", { parse: true });
      expect(data.languages.perl).toBe("Elite");
    });

    it("should create non-tracked file if not exists", () => {
      const [projectFile, file] = getFileName("txt");
      const data = resettableFile.readFileSync(projectFile, { create: true, track: false, defaultContent: "x" });
      expect(data).toBe("x");
    });

    it("should treat created non-tracked file as user-created", () => {
      const [projectFile, file] = getFileName("txt");
      const data = resettableFile.readFileSync(projectFile, { create: true, track: false, defaultContent: "x" });
      resettableFile.deleteFileSync(projectFile);
      const exists = fs.existsSync(file);
      expect(exists).toBe(true);
    });
  });

  describe("writeFileSync() method", () => {
    it("should write file", () => {
      const [projectFile, file] = getFileName("txt");
      resettableFile.writeFileSync(projectFile, "x");
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("x");
    });

    it("should not overwrite user created file", () => {
      const [projectFile, file] = getFileName("txt");
      fs.writeFileSync(file, "u");
      resettableFile.writeFileSync(projectFile, "x");
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("u");
    });

    it("should overwrite user created file (force = true)", () => {
      const [projectFile, file] = getFileName("txt");
      fs.writeFileSync(file, "u");
      resettableFile.writeFileSync(projectFile, "x", { force: true });
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("x");
    });

    it("should sort requested keys (sortKeys)", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.writeFileSync(
        projectFile,
        { zzzz: [1, 2], letters: { c: 3, a: 1, b: 2 } },
        { serialize: true, sortKeys: ["letters"] },
      );
      const content = fs.readFileSync(file, "utf8").replace(new RegExp(/\s/, "g"), "");
      expect(content).toBe('{"zzzz":[1,2],"letters":{"a":1,"b":2,"c":3}}');
    });

    it("should create non-tracked file (track = false)", () => {
      const [projectFile, file] = getFileName("txt");
      resettableFile.writeFileSync(projectFile, "x", { track: false });
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("x");
    });

    it("should create non-tracked file - 2 (track = false)", () => {
      const [projectFile, file] = getFileName("txt");
      resettableFile.writeFileSync(projectFile, "x", { track: false });
      resettableFile.deleteFileSync(projectFile);
      const exists = fs.existsSync(file);
      expect(exists).toBe(true);
    });

    it("should not overwrite non-tracked file (track = false)", () => {
      const [projectFile, file] = getFileName("txt");
      fs.writeFileSync(file, "x");
      resettableFile.writeFileSync(projectFile, "y", { track: false });
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("x");
    });

    it("should serialize data based on old file content without extension", () => {
      const [projectFile, file] = getFileName();
      fs.writeJsonSync(file, { a: 1 });
      resettableFile.writeFileSync(projectFile, { a: 2 }, { serialize: true, force: true });
      const content = fs.readJsonSync(file);
      expect(content).toEqual({ a: 2 });
    });

    it("should throw if content is undefined", () => {
      const [projectFile, file] = getFileName();
      expect(() => resettableFile.writeFileSync("x", undefined)).toThrow("File data to be written cannot be undefined or null");
    });

    it("should throw if content is null", () => {
      const [projectFile, file] = getFileName();
      expect(() => resettableFile.writeFileSync("x", null)).toThrow("File data to be written cannot be undefined or null");
    });

    it("should throw if content object and serialize is false", () => {
      const [projectFile, file] = getFileName();
      expect(() => resettableFile.writeFileSync("x", { a: 1 })).toThrow("content is not a string");
    });
  });

  describe("deleteFileSync() method", () => {
    it("should delete project file", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.writeFileSync(projectFile, "x");
      const isCreated = fs.existsSync(file);
      resettableFile.deleteFileSync(projectFile);
      const isDeleted = !fs.existsSync(file);
      expect(isCreated).toBe(true);
      expect(isDeleted).toBe(true);
    });

    it("should not delete user created file", () => {
      const [projectFile, file] = getFileName("json");
      fs.writeFileSync(file, "y");
      const isCreated = fs.existsSync(file);
      resettableFile.deleteFileSync(projectFile);
      const isDeleted = !fs.existsSync(file);
      expect(isCreated).toBe(true);
      expect(isDeleted).toBe(false);
    });

    it("should not delete user created file (log = false)", () => {
      resettableFile.deleteFileSync("text.txt", { log: false });
      const exists = resettableFile.hasFileSync("text.txt");
      expect(exists).toBe(true);
    });

    it("should delete user created file (force = true)", () => {
      const [projectFile, file] = getFileName("json");
      fs.writeFileSync(file, "y");
      const isCreated = fs.existsSync(file);
      resettableFile.deleteFileSync(projectFile, { force: true });
      const isDeleted = !fs.existsSync(file);
      expect(isCreated).toBe(true);
      expect(isDeleted).toBe(true);
    });

    it("should not delete directory", () => {
      const [projectFile, file] = getFileName();
      fs.mkdirpSync(file);
      expect(() => resettableFile.deleteFileSync(projectFile, { force: true })).toThrow("It is a directory");
    });

    it("should not delete existing file in non tracked mode (track = false)", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.writeFileSync(projectFile, "x");
      const isCreated = fs.existsSync(file);
      resettableFile.deleteFileSync(projectFile, { track: false });
      const isDeleted = !fs.existsSync(file);
      expect(isCreated).toBe(true);
      expect(isDeleted).toBe(false);
    });

    it("should not delete existing file in non tracked mode (track = false, force = true)", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.writeFileSync(projectFile, "x");
      const isCreated = fs.existsSync(file);
      resettableFile.deleteFileSync(projectFile, { track: false, force: true });
      const isDeleted = !fs.existsSync(file);
      expect(isCreated).toBe(true);
      expect(isDeleted).toBe(true);
    });

    it("should not delete tracked data file", () => {
      const dataObject = resettableFile.getDataObjectSync("data.json");
      resettableFile.deleteFileSync("data.json");
      expect(fs.existsSync(resettableFile.fromRoot("data.json"))).toBe(true);
    });

    it("should skip log (log = false)", () => {
      const [projectFile, file] = getFileName("json");
      resettableFile.writeFileSync(projectFile, "x");
      resettableFile.deleteFileSync(projectFile, { log: false });
      resettableFile.deleteFileSync("text.tst", { log: false });
      const exists1 = fs.existsSync(file);
      const exists2 = resettableFile.hasFileSync("text.txt");
      expect([exists1, exists2]).toEqual([false, true]);
    });
  });

  describe("copyFileSync() method", () => {
    it("should copy project file", () => {
      const [projectFile, file] = getFileName("js");
      resettableFile.copyFileSync("trial.js", projectFile);
      const isCreated = fs.existsSync(file);
      expect(isCreated).toBe(true);
    });

    it("should not overwrite user created file", () => {
      resettableFile.copyFileSync("trial.js", "text.txt");
      const content = fs.readFileSync(resettableFile.fromRoot("text.txt"), "utf8");
      expect(content).toBe("text file\n");
    });

    it("should overwrite user created file (force = true)", () => {
      const [projectFile, file] = getFileName("txt");
      fs.writeFileSync(file, "x");
      resettableFile.copyFileSync("some-text.txt", projectFile, { force: true });
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("some text\n");
    });

    it("should copy non-tracked file (track = false)", () => {
      const [projectFile, file] = getFileName("txt");
      resettableFile.copyFileSync("some-text.txt", projectFile, { track: false });
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("some text\n");
    });

    it("should not overwrite non-tracked file (track = false)", () => {
      const [projectFile, file] = getFileName("txt");
      fs.writeFileSync(file, "x");
      resettableFile.copyFileSync("some-text.txt", projectFile, { track: false });
      const content = fs.readFileSync(file, "utf8");
      expect(content).toBe("x");
    });

    it("should copy file as non tracked (track = false) - 2", () => {
      const [projectFile, file] = getFileName("txt");
      resettableFile.copyFileSync("trial.js", projectFile, { track: false });
      const isCreated = fs.existsSync(file);
      resettableFile.deleteFileSync(projectFile);
      const isDeleted = !fs.existsSync(file);
      expect([isCreated, isDeleted]).toEqual([true, false]);
    });
  });

  describe("createDirSync() method", () => {
    it("should create directory", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/dir`, `${filePrefix}/dir`];
      resettableFile.createDirSync(projectFile, { logDirs: false });
      const isCreated = fs.existsSync(file);
      expect(isCreated).toBe(true);
    });

    it("should create non tracked directory (track = false)", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/dir`, `${filePrefix}/dir`];
      resettableFile.createDirSync(projectFile, { track: false });
      const isCreated = fs.existsSync(file);
      expect(isCreated).toBe(true);
    });

    it("should skip existing directory (track = false)", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/dir`, `${filePrefix}/dir`];
      fs.mkdirsSync(file);
      resettableFile.createDirSync(projectFile, { track: false, logDirs: false });
      const isCreated = fs.existsSync(file);
      expect(isCreated).toBe(true);
    });
  });

  describe("deleteDirSync() method", () => {
    it("should delete directory", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/dir`, `${filePrefix}/dir`];
      fs.mkdirsSync(file);
      resettableFile.deleteDirSync(projectFile);
      const exists = fs.existsSync(file);
      expect(exists).toBe(false);
    });

    it("should not delete non-empty directory", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/dir`, `${filePrefix}/dir`];
      fs.mkdirsSync(file);
      fs.writeFileSync(path.join(file, "text.txt"), "x");
      resettableFile.deleteDirSync(projectFile, { logDirs: false });
      const exists = fs.existsSync(file);
      expect(exists).toBe(true);
    });

    it("should delete non-empty directory (force = true)", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/dir`, `${filePrefix}/dir`];
      fs.mkdirsSync(file);
      fs.writeFileSync(path.join(file, "text.txt"), "x");
      resettableFile.deleteDirSync(projectFile, { force: true, logDirs: false });
      const exists = fs.existsSync(file);
      expect(exists).toBe(false);
    });

    it("should delete empty directory recursively", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/dir`, `${filePrefix}/dir`];
      fs.mkdirsSync(file);
      resettableFile.deleteDirSync(projectPrefix);
      const exists = fs.existsSync(file);
      expect(exists).toBe(false);
    });

    it("should delete non-empty directory containing auto-created files", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/sub/dir/a`, `${filePrefix}/sub/dir/a`];
      const [projectFile2, file2] = [`${projectPrefix}/sub/dir/u`, `${filePrefix}/sub/dir/u`];

      resettableFile.createDirSync(projectFile); // Auto created directory tree
      resettableFile.createDirSync(projectFile2); // Auto created directory tree 2
      resettableFile.writeFileSync(path.join(projectPrefix, "sub/dir/a/x.txt"), "x"); // Auto created file
      fs.writeFileSync(path.join(filePrefix, "sub/dir/u/y.txt"), "y"); // User created file
      resettableFile.deleteDirSync(projectPrefix);

      const userContent = fs.readFileSync(path.join(filePrefix, "sub/dir/u/y.txt"), "utf8");
      const exists = fs.existsSync(path.join(filePrefix, "sub/dir/a"));
      expect([userContent, exists]).toEqual(["y", false]);
      resettableFile.deleteDirSync(projectPrefix, { force: true }); // Not to prevent project.reset
    });

    it("should not log subdirs when deleted (logdirs = false)", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/a/b/c`, `${filePrefix}/a/b/c`];
      resettableFile.createDirSync(projectFile);
      resettableFile.deleteDirSync(projectPrefix, { logDirs: false });
      expect(true).toBe(true);
    });

    it("should not log subdirs when not deleted (logdirs = false)", () => {
      const [projectPrefix, filePrefix] = getFileName();
      const [projectFile, file] = [`${projectPrefix}/a/b/c`, `${filePrefix}/a/b/c`];
      fs.mkdirsSync(file);
      fs.writeFileSync(path.join(file, "z"), "z");
      resettableFile.deleteDirSync(projectPrefix, { logDirs: false });
      expect(true).toBe(true);
    });
  });

  describe("saveSync() method", () => {
    it("should save", async () => {
      const rf = await refresh(2);
      const dataObject = rf.getDataObjectSync("alt-x.json", { create: true, defaultContent: { x: 1 } });
      dataObject.set("k", 3);
      rf.writeFileSync("alt-x", "y");
      rf.saveSync();
      expect(fs.existsSync(rf.fromRoot("registry.json"))).toBe(true);
    });

    it("should not create registry if it is empty", async () => {
      const rf = await refresh(2);
      fs.removeSync(rf.fromRoot("registry.json"));
      rf.saveSync();
      expect(fs.existsSync(rf.fromRoot("registry.json"))).toBe(false);
    });
  });

  describe("resetSync() method", () => {
    it("should delete registry file if it is empty", async () => {
      const rf = await refresh(2);
      rf.getDataObjectSync("alt-x.json", { create: true, defaultContent: { a: 1 } });
      rf.writeFileSync("alt-x", "y");
      rf.resetSync();

      expect([rf.hasFileSync("registry.json"), rf.hasFileSync("alt-x.json"), rf.hasFileSync("alt-x")]).toEqual([false, false, false]);
    });

    it("should not delete registry if data remains", async () => {
      const rf = await refresh(2, { logger: stubLogger });
      rf.getDataObjectSync("alt-x.json", { create: true, defaultContent: { a: 1 } });
      rf.writeFileSync("alt-x", "y");
      rf.saveSync();
      fs.writeFileSync(rf.fromRoot("alt-x"), "other");
      rf.resetSync();
      expect([rf.hasFileSync("registry.json"), rf.hasFileSync("alt-x.json"), rf.hasFileSync("alt-x")]).toEqual([true, false, true]);
    });

    it("should delete created directories", async () => {
      const rf = await refresh(2);
      rf.createDirSync("a/b");
      rf.resetSync();
      const exists = fs.existsSync("a/b");
      expect(exists).toBe(false);
    });

    it("should reset all", async () => {
      await refresh(2);
    });
  });
});

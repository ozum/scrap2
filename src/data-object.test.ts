import DataObject from "./data-object";
import { stubLogger as logger } from "./logger";

let dataObject;

const data = {
  members: [
    { name: "George", address: { city: "Barcelona" } },
    { name: "Susan", address: { city: "Rome" } },
    { name: "Mert", address: { city: "Istanbul" } },
  ],
  color: {
    name: "red",
    codes: [1, 2, 3, 4],
  },
  is: true,
};

beforeAll(async () => {
  dataObject = new DataObject(data, { logger, track: true, format: "json", name: "somefile.json" });
}, 25000); // Set timeout. Instead of stubs, preferred module installation, which takes very long time. Be patient!

afterEach(() => dataObject.reset());

describe("Data object", () => {
  describe("constructor", () => {
    it("should accept undefined data", () => {
      const object = new DataObject(undefined, { logger, track: false, format: "json" });
      expect(object.data).toEqual({});
    });
  });

  describe("isChanged attribute", () => {
    it("should return false if data is not changed", () => {
      expect(dataObject.isChanged).toBe(false);
    });

    it("should return true if data is changed", () => {
      dataObject.set("x", "y");
      expect(dataObject.isChanged).toBe(true);
    });
  });

  describe("original attribute", () => {
    it("should return original", () => {
      dataObject.remove("members", { force: true });
      const hasName = dataObject.has("members.0.name");
      const originalName = dataObject.original.members[0].name;
      expect([hasName, originalName]).toEqual([false, "George"]);
    });
  });

  describe("snapshot attribute", () => {
    it("should return snapshot", () => {
      dataObject.remove("members", { force: true });
      const hasName = dataObject.has("members.0.name");
      const originalName = dataObject.snapshot.members[0].name;
      expect([hasName, originalName]).toEqual([false, "George"]);
    });
  });

  describe("unapplied attribute", () => {
    it("should return unapplied", () => {
      expect(dataObject.unapplied).toBeUndefined();
    });
  });

  describe("format attribute", () => {
    it("should return format", () => {
      expect(dataObject.format).toBe("json");
    });
  });

  describe("sortKeys attribute", () => {
    it("should return sortKeys", () => {
      const object = new DataObject(undefined, { logger, track: false, sortKeys: ["a", "b"], format: "json" });
      expect(object.sortKeys).toEqual(["a", "b"]);
    });
  });

  describe("has() method", () => {
    it("should return given values based on test", () => {
      expect(dataObject.has("color", 1, 0)).toBe(1);
      expect(dataObject.has("non-existing", 1, 0)).toBe(0);
    });
  });

  describe("hasSubProp() method", () => {
    it("should return boolean values based on test", () => {
      expect(dataObject.hasSubProp("color", ["name", "codes"])).toBe(true);
      expect(dataObject.hasSubProp("members.0", ["name", "address.city"])).toBe(true);
      expect(dataObject.hasSubProp("members.0", ["address.no"])).toBe(false);
    });

    it("should return given values based on test", () => {
      expect(dataObject.hasSubProp("color", ["name", "codes"], 1, 0)).toBe(1);
      expect(dataObject.hasSubProp("members.0", ["name", "address.city"], 1, 0)).toBe(1);
      expect(dataObject.hasSubProp("members.0", ["address.no"], 1, 0)).toBe(0);
    });
  });

  describe("set() method", () => {
    it("should set value", () => {
      dataObject.set("newData", true);
      expect(dataObject.data.newData).toBe(true);
    });

    it("should not set user modified value", () => {
      dataObject.set("is", false);
      expect(dataObject.data.is).toBe(true);
    });

    it("should set user modified value (force: true)", () => {
      dataObject.set("is", false, { force: true });
      expect(dataObject.data.is).toBe(false);
    });

    it("should throw for non-string paths", () => {
      expect(() => dataObject.set({}, "x")).toThrow("Path must be a string");
    });
  });

  describe("setObject() method", () => {
    it("should set multiple value", () => {
      dataObject.setObject({ members: 3, language: { type: "interpreted", name: "perl" } });
      expect(dataObject.data.language).toEqual({ type: "interpreted", name: "perl" });
      expect(dataObject.data.members).not.toEqual(3); // User created data should not be chagned.
    });

    it("should set multiple value excluding user modified", () => {
      dataObject.setObject({ members: 3, language: { type: "interpreted", name: "perl" } }, { force: true });
      expect(dataObject.data.language).toEqual({ type: "interpreted", name: "perl" });
      expect(dataObject.data.members).toBe(3); // User created data should not be chagned.
    });
  });

  describe("remove() method", () => {
    it("should remove value", () => {
      dataObject.set("toDelete", "x");
      expect(dataObject.data.toDelete).toBe("x");
      dataObject.remove("toDelete");
      expect(dataObject.has("toDelete")).toBe(false);
    });

    it("should handle non-existing value", () => {
      dataObject.remove("some-none-existing-key");
      expect(true).toBe(true);
    });

    it("should remove multiple value", () => {
      dataObject.setObject({ toDelete1: 1, toDelete2: 2 });
      expect([dataObject.data.toDelete1, dataObject.data.toDelete2]).toEqual([1, 2]);
      dataObject.remove(["toDelete1", "toDelete2"]);
      expect([dataObject.has("toDelete1"), dataObject.has("toDelete2")]).toEqual([false, false]);
    });

    it("should remove value containing dot", () => {
      dataObject.set(["with.dot", "delete"], 1); // data["with.dot"].delete
      expect(dataObject.get(["with.dot", "delete"])).toBe(1);
      dataObject.remove([["with.dot", "delete"]]);
      expect(dataObject.has([["with.dot", "delete"]])).toBe(false);
    });

    it("should not remove user modified value", () => {
      dataObject.remove("color.name");
      expect(dataObject.get("color.name")).toBe("red");
    });

    it("should remove user modified value (force: true)", () => {
      dataObject.remove("color.name", { force: true });
      expect(dataObject.has("color.name")).toBe(false);
    });

    it("should remove value from array", () => {
      dataObject.set("x", [1, 2, 3]);
      dataObject.remove("x.1");
      expect(dataObject.get("x")).toEqual([1, 3]);
    });
  });

  describe("diffFromSnapshot() method", () => {
    it("should return list of operations", () => {
      dataObject.set("x", "y");
      expect(dataObject.diffFromSnapshot()).toEqual([{ op: "test", path: "/x", value: "y" }, { op: "remove", path: "/x" }]);
    });
  });

  describe("diffFromOriginal() method", () => {
    it("should return list of operations", () => {
      dataObject.set("x", "y");
      expect(dataObject.diffFromOriginal()).toEqual([{ op: "test", path: "/x", value: "y" }, { op: "remove", path: "/x" }]);
    });

    it("should return list of operations (compact: false)", () => {
      dataObject.set("x", "y");
      expect(dataObject.diffFromOriginal({ compact: false })).toEqual([
        { op: "test", path: "/x", value: "y" },
        { op: "remove", path: "/x" },
      ]);
    });
  });
});

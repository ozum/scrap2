import { getFileFormat, parseData, serializeData } from "./util";

describe("getFileFormat()", () => {
  it("should return format based on file extension", () => {
    expect(getFileFormat("some.json")).toBe("json");
  });

  it("should throw if file format cannot be determined", () => {
    expect(() => getFileFormat("some-file")).toThrow("Cannot determine format");
  });
});

describe("parseData()", () => {
  it("should throw if yaml cannot be parsed", () => {
    expect(() => parseData("{wrong", "yaml")).toThrow("Cannot parse data as YAML");
  });

  it("should throw if data cannot be parsed", () => {
    expect(() => parseData("{wrong")).toThrow("first of 2 errors");
  });

  it("should throw if data cannot be parsed - 2", () => {
    expect(() => parseData("{wrong", "txt" as "json")).toThrow("Cannot parse data");
  });
});

describe("serializeData()", () => {
  it("should serialize data", () => {
    expect(serializeData({ a: 1 }, "yaml")).toEqual({ data: "a: 1\n", format: "yaml" });
  });

  it("should serialize data with default values", () => {
    const content = serializeData({ a: { b: 2 } });
    content.data = content.data.replace(new RegExp("\\s", "g"), "");
    expect(content).toEqual({ data: '{"a":{"b":2}}', format: "json" });
  });

  it("should serialize data", () => {
    const content = serializeData({ a: { b: 2 } }, "json", ["a.b"]);
    content.data = content.data.replace(new RegExp("\\s", "g"), "");
    expect(content).toEqual({ data: '{"a":{"b":2}}', format: "json" });
  });
});

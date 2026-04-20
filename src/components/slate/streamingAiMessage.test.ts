import { describe, expect, it } from "bun:test";
import { extractPartialMessageToClient } from "./streamingAiMessage";

describe("extractPartialMessageToClient", () => {
  it("returns empty until key appears", () => {
    expect(extractPartialMessageToClient('{"operations":[]')).toBe("");
  });

  it("extracts partial string before closing quote", () => {
    const buf =
      '{"operations":[],"messageToClient":"Hello wor';
    expect(extractPartialMessageToClient(buf)).toBe("Hello wor");
  });

  it("stops at closing quote", () => {
    const buf =
      '{"operations":[],"messageToClient":"Done.","extra":1}';
    expect(extractPartialMessageToClient(buf)).toBe("Done.");
  });

  it("decodes escapes", () => {
    const buf = '{"messageToClient":"Line\\nTwo"}';
    expect(extractPartialMessageToClient(buf)).toBe("Line\nTwo");
  });
});

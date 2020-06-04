import compileSchema from "../compileSchema";

describe("createLiform", () => {
  const schema = {
    definitions: {
      nameref: {
        type: "string"
      }
    },
    title: "A schema",
    properties: {
      name: {
        $ref: "#/definitions/nameref"
      }
    }
  };

  it("should resolve $refs", () => {
    const schemaCompiled = compileSchema(schema);
    expect(schemaCompiled.properties.name).toHaveProperty("type");
    expect(schemaCompiled.properties.name.type).toEqual("string");
  });
});

import { compileSchema } from "../src/schema";

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
      },
      prop: {
        title: "A property",
        type: "string",
      }
    },
    required: ['prop']
  }

  const schemaCompiled = compileSchema(schema);

  test("Copy objects", () => {
    expect(schemaCompiled.properties.prop).toEqual(schema.properties.prop)
    expect(schemaCompiled.properties.prop != schema.properties.prop).toBe(true)
  })

  test("Copy arrays", () => {
    expect(schemaCompiled.required).toEqual(schema.required)
    expect(schemaCompiled.required != schema.required).toBe(true)
  })

  test("Resolve $refs", () => {
    expect(schemaCompiled.properties.name).toHaveProperty("type")
    expect(schemaCompiled.properties.name.type).toEqual("string")
  })
})

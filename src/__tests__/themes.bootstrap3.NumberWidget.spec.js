import React from "react";
import Liform from "../";
import { FormFrame } from "./test-utils";

describe("NumberWidget", () => {
  it("should render a form with a number input", () => {
    const schema = {
      title: "A schema",
      properties: {
        field: {
          type: "number"
        }
      }
    };

    const Component = (
      <FormFrame>
        <Liform schema={schema} />
      </FormFrame>
    );

    const wrapper = render(Component);

    expect(wrapper.find("input[type=number]").length).toEqual(1);
  });
  it("required gives the input the required attribute", () => {
    const schema = {
      title: "A schema",
      properties: {
        field: {
          type: "string",
          widget: "number"
        }
      },
      required: ["field"]
    };

    const Component = (
      <FormFrame>
        <Liform schema={schema} />
      </FormFrame>
    );

    const wrapper = render(Component);

    expect(wrapper.find("input[required]").length).toEqual(1);
  });
});

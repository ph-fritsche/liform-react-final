import React from "react";
import Liform from "../";
import { FormFrame } from "./test-utils";

describe("PercentWidget", () => {
  it("should render a form with a number input and an addon", () => {
    const schema = {
      title: "A schema",
      properties: {
        field: {
          type: "string",
          widget: "percent"
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
    expect(wrapper.find(".input-group-addon").length).toEqual(1);
  });
  it("required gives the input the required attribute", () => {
    const schema = {
      title: "A schema",
      properties: {
        field: {
          type: "string",
          widget: "percent"
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

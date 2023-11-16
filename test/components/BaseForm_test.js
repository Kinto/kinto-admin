import React from "react";
import { fireEvent, render } from "@testing-library/react";
import BaseForm from "../../src/components/BaseForm";

const testSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      title: "Title",
      description: "Short title",
    },
    content: {
      type: "string",
      title: "Content",
      description: "Provide details...",
    },
  },
};

const testUiSchema = {
  "ui:order": ["title", "content"],
  content: {
    "ui:widget": "textarea",
  },
  id: {
    "ui:widget": "text",
    "ui:disabled": true,
  },
  last_modified: {
    "ui:widget": "hidden",
    "ui:disabled": true,
  },
  schema: {
    "ui:widget": "hidden",
    "ui:disabled": true,
  },
  "ui:disabled": false,
};

describe("BaseForm component", () => {
  it("Should render a rjsf form as expected", async () => {
    const result = render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
      />
    );

    const inputTitle = await result.findByLabelText("Title");
    const inputContent = await result.findByLabelText("Content");
    const submit = await result.findByText("Submit");
    const spinner = result.queryByTestId("spinner");

    expect(inputTitle.disabled).toBe(false);
    expect(inputContent.disabled).toBe(false);
    expect(submit.disabled).toBe(false);
    expect(spinner).toBeNull();
  });

  it("Should disable the form if disabled is true", async () => {
    const result = render(
      <BaseForm
        className="testClass"
        disabled={true}
        schema={testSchema}
        uiSchema={testUiSchema}
      />
    );

    const inputTitle = await result.findByLabelText("Title");
    const inputContent = await result.findByLabelText("Content");
    const submit = await result.findByText("Submit");
    const spinner = result.queryByTestId("spinner");

    expect(inputTitle.disabled).toBe(true);
    expect(inputContent.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(spinner).toBeNull();
  });

  it("Should show a spinner and disable the form when showSpinner is true", async () => {
    const result = render(
      <BaseForm
        className="testClass"
        showSpinner={true}
        schema={testSchema}
        uiSchema={testUiSchema}
      />
    );

    const inputTitle = await result.findByLabelText("Title");
    const inputContent = await result.findByLabelText("Content");
    const submit = await result.findByText("Submit");
    const spinner = result.queryByTestId("spinner");

    expect(inputTitle.disabled).toBe(true);
    expect(inputContent.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(spinner).toBeDefined();
  });

  it("Should show a spinner and disable the form when form is submitted", async () => {
    const result = render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
        onSubmit={jest.fn()}
      />
    );

    const inputTitle = await result.findByLabelText("Title");
    const inputContent = await result.findByLabelText("Content");
    const submit = await result.findByText("Submit");

    expect(inputTitle.disabled).toBe(false);
    expect(inputContent.disabled).toBe(false);
    expect(submit.disabled).toBe(false);
    expect(result.queryByTestId("spinner")).toBeNull();

    fireEvent.click(submit);

    expect(inputTitle.disabled).toBe(true);
    expect(inputContent.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(result.queryByTestId("spinner")).toBeDefined();
  });

  it("Should scroll to the first property that fails validation", async () => {
    const result = render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
        onSubmit={jest.fn()}
        customValidate={(data, errors) => {
          errors.title.addError("test error");
          return errors;
        }}
      />
    );
    const testFn = jest.fn();

    const submit = await result.findByText("Submit");
    const titleLabel = await result.findByText("Title");
    titleLabel.scrollIntoView = testFn;
    fireEvent.click(submit);
    expect(testFn).toHaveBeenCalledTimes(1);
    expect(result.container.querySelector(`[for="root_title"]`)).not.toBeNull();
  });

  it("Should scroll to the top of the form if validation failed without a specific property", async () => {
    const result = render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
        onSubmit={jest.fn()}
        customValidate={(data, errors) => {
          errors.addError("test error");
          return errors;
        }}
      />
    );
    const testFn = jest.fn();

    const submit = await result.findByText("Submit");
    const formWrapper = await result.findByTestId("formWrapper");
    formWrapper.scrollIntoView = testFn;
    fireEvent.click(submit);
    expect(testFn).toHaveBeenCalledTimes(1);
  });
});

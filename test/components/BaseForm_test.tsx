import BaseForm from "@src/components/BaseForm";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

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
    render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
      />
    );

    const inputTitle = await screen.findByLabelText("Title");
    const inputContent = await screen.findByLabelText("Content");
    const submit = await screen.findByText("Submit");
    const spinner = screen.queryByTestId("spinner");

    expect(inputTitle.disabled).toBe(false);
    expect(inputContent.disabled).toBe(false);
    expect(submit.disabled).toBe(false);
    expect(spinner).toBeNull();
  });

  it("Should disable the form if disabled is true", async () => {
    render(
      <BaseForm
        className="testClass"
        disabled={true}
        schema={testSchema}
        uiSchema={testUiSchema}
      />
    );

    const inputTitle = await screen.findByLabelText("Title");
    const inputContent = await screen.findByLabelText("Content");
    const submit = await screen.findByText("Submit");
    const spinner = screen.queryByTestId("spinner");

    expect(inputTitle.disabled).toBe(true);
    expect(inputContent.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(spinner).toBeNull();
  });

  it("Should show a spinner and disable the form when showSpinner is true", async () => {
    render(
      <BaseForm
        className="testClass"
        showSpinner={true}
        schema={testSchema}
        uiSchema={testUiSchema}
      />
    );

    const inputTitle = await screen.findByLabelText("Title");
    const inputContent = await screen.findByLabelText("Content");
    const submit = await screen.findByText("Submit");
    const spinner = screen.queryByTestId("spinner");

    expect(inputTitle.disabled).toBe(true);
    expect(inputContent.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(spinner).toBeDefined();
  });

  it("Should show a spinner and disable the form when form is submitted", async () => {
    render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
        onSubmit={vi.fn()}
      />
    );

    const inputTitle = await screen.findByLabelText("Title");
    const inputContent = await screen.findByLabelText("Content");
    const submit = await screen.findByText("Submit");

    expect(inputTitle.disabled).toBe(false);
    expect(inputContent.disabled).toBe(false);
    expect(submit.disabled).toBe(false);
    expect(screen.queryByTestId("spinner")).toBeNull();

    fireEvent.click(submit);

    expect(inputTitle.disabled).toBe(true);
    expect(inputContent.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(screen.queryByTestId("spinner")).toBeDefined();
  });

  it("Should scroll to the first property that fails validation", async () => {
    render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
        onSubmit={vi.fn()}
        customValidate={(data, errors) => {
          errors.title.addError("test error");
          return errors;
        }}
      />
    );
    const testFn = vi.fn();

    const submit = await screen.findByText("Submit");
    const titleLabel = await screen.findByText("Title");
    titleLabel.scrollIntoView = testFn;
    fireEvent.click(submit);
    expect(testFn).toHaveBeenCalledTimes(1);
    expect(titleLabel.getAttribute("for")).toBe("root_title");
  });

  it("Should scroll to the top of the form if validation failed without a specific property", async () => {
    render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={testUiSchema}
        onSubmit={vi.fn()}
        customValidate={(data, errors) => {
          errors.addError("test error");
          return errors;
        }}
      />
    );
    const testFn = vi.fn();

    const submit = await screen.findByText("Submit");
    const formWrapper = await screen.findByTestId("formWrapper");
    formWrapper.scrollIntoView = testFn;
    fireEvent.click(submit);
    expect(testFn).toHaveBeenCalledTimes(1);
  });

  it("Should show an error message when bad config causes the rjsf component to crash", async () => {
    render(
      <BaseForm
        className="testClass"
        schema={testSchema}
        uiSchema={{
          ...testUiSchema,
          content: {
            "ui:widget": "foo-not-real-thing",
          },
        }}
        formCrashMsg={<div>My custom crash message</div>}
      />
    );

    expect(await screen.findByText(/Error rendering form/)).toBeDefined();
    expect(await screen.findByText(/foo-not-real-thing/)).toBeDefined();
    expect(await screen.findByText(/My custom crash message/)).toBeDefined();
  });
});

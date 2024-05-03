import Spinner from "./Spinner";
import TagsField from "./TagsField";
import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import { FormProps, withTheme } from "@rjsf/core";
import { RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import React, { Component, ReactNode, useRef, useState } from "react";

const adminFields = { tags: TagsField };

const FormWithTheme = withTheme(Bootstrap4Theme);

export type BaseFormProps = Omit<FormProps, "validator"> & {
  showSpinner?: boolean;
  onSubmit: (data: RJSFSchema) => void;
};

export default function BaseForm(props: BaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const { className, disabled, showSpinner, onSubmit, ...restProps } = props;

  const handleOnSubmit = form => {
    setIsSubmitting(true);
    onSubmit(form);
  };

  const errorFocus = (err: RJSFValidationError) => {
    if (err?.property !== ".") {
      formRef.current
        .querySelector(`[for="root${err.property.replace(/\./g, "_")}"]`)
        .scrollIntoView({ behavior: "auto", block: "center" });
    } else {
      formRef.current.scrollIntoView({ behavior: "auto", block: "start" });
    }
  };

  return (
    <div className="formWrapper" ref={formRef} data-testid="formWrapper">
      <ErrorBoundary>
        <FormWithTheme
          {...restProps}
          focusOnFirstError={errorFocus}
          className={`rjsf ${className ? className : ""}`}
          validator={validator}
          onSubmit={handleOnSubmit}
          // @ts-ignore
          fields={adminFields}
          disabled={disabled || showSpinner || isSubmitting}
        />
        {(isSubmitting || showSpinner) && <Spinner />}
      </ErrorBoundary>
    </div>
  );
}

/*
  This is a wrapper for child components that could fail.
  There is no way to do this as a functional component at this time (2024-05-03).
  The official answer is to not have components that crash. (ok, fair)
  But we have some highly configurable UI's with rjsf, so a user's typo could cause an issue.
*/
class ErrorBoundary extends Component {
  declare state: {
    thrown?: Error;
  };

  declare props: {
    children: ReactNode;
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(thrown) {
    return {
      thrown,
    };
  }

  render() {
    if (this.state.thrown) {
      return (
        <>
          <h2>Error rendering form</h2>
          <div>
            This is likely caused by a bad <code>ui:widget</code> value in this
            collection's UI schema.
          </div>
          <code>
            {this.state.thrown.name}: {this.state.thrown.message}
          </code>
        </>
      );
    }

    return this.props.children;
  }
}

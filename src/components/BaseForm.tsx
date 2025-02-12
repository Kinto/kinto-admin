import Spinner from "./Spinner";
import TagsField from "./TagsField";
import Base64Input from "./rjsf/Base64Input";
import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import { FormProps, withTheme } from "@rjsf/core";
import {
  RJSFSchema,
  RJSFValidationError,
  RegistryWidgetsType,
} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import React, { Component, ReactNode, useRef, useState } from "react";

const adminFields = { tags: TagsField };

const FormWithTheme = withTheme(Bootstrap4Theme);

export type BaseFormProps = Omit<FormProps, "validator"> & {
  showSpinner?: boolean;
  formCrashMsg?: ReactNode;
  onSubmit: (data: RJSFSchema) => void;
};

const customWidgets: RegistryWidgetsType = {
  base64input: Base64Input,
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
      <ErrorBoundary formCrashMsg={props.formCrashMsg}>
        <FormWithTheme
          {...restProps}
          focusOnFirstError={errorFocus}
          className={`rjsf ${className ? className : ""}`}
          validator={validator}
          onSubmit={handleOnSubmit}
          // @ts-ignore
          fields={adminFields}
          disabled={disabled || showSpinner || isSubmitting}
          widgets={customWidgets}
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
    formCrashMsg?: ReactNode;
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
          {this.props.formCrashMsg || <></>}
          <code>
            {this.state.thrown.name}: {this.state.thrown.message}
          </code>
        </>
      );
    }

    return this.props.children;
  }
}

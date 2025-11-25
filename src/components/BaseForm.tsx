import Spinner from "./Spinner";
import TagsField from "./TagsField";
import Base64File from "./rjsf/Base64File";
import { Theme as BootstrapTheme } from "@rjsf/react-bootstrap";
import { FormProps, withTheme } from "@rjsf/core";
import {
  RJSFSchema,
  RJSFValidationError,
  RegistryWidgetsType,
} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import React, { Component, ReactNode, useRef, useState } from "react";

const adminFields = { tags: TagsField };

const FormWithTheme = withTheme(BootstrapTheme);

export type BaseFormProps = Omit<FormProps, "validator"> & {
  showSpinner?: boolean;
  formCrashMsg?: ReactNode;
  onSubmit: (data: RJSFSchema) => void;
};

const customWidgets: RegistryWidgetsType = {
  base64file: Base64File,
};

export default function BaseForm(props: BaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const { className, disabled, showSpinner, onSubmit, ...restProps } = props;

  const handleOnSubmit = async form => {
    setIsSubmitting(true);
    await onSubmit(form);
    setIsSubmitting(false);
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

  const formDisabled = disabled || showSpinner || isSubmitting;
  return (
    <div className="formWrapper" ref={formRef} data-testid="formWrapper">
      <ErrorBoundary formCrashMsg={props.formCrashMsg}>
        <FormWithTheme
          {...restProps}
          focusOnFirstError={errorFocus}
          className={`rjsf ${className ?? ""}`}
          validator={validator}
          onSubmit={handleOnSubmit}
          fields={adminFields}
          disabled={formDisabled}
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
          {this.props.formCrashMsg ?? <></>}
          <code>
            {this.state.thrown.name}: {this.state.thrown.message}
          </code>
        </>
      );
    }

    return this.props.children;
  }
}

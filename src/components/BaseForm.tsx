import Spinner from "./Spinner";
import TagsField from "./TagsField";
import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import { FormProps, withTheme } from "@rjsf/core";
import { RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import React, { useRef, useState } from "react";

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
    </div>
  );
}

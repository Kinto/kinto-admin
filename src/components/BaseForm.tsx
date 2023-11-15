import React, { useRef, useState } from "react";
import { withTheme, FormProps } from "@rjsf/core";
import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import validator from "@rjsf/validator-ajv8";
import { RJSFSchema, RJSFValidationError } from "@rjsf/utils";

import TagsField from "./TagsField";
import Spinner from "./Spinner";

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
        error
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

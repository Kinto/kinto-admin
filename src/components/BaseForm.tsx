import React, { useState } from "react";
import { withTheme, FormProps } from "@rjsf/core";
import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import validator from "@rjsf/validator-ajv8";
import { RJSFSchema } from "@rjsf/utils";

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
  const { className, disabled, showSpinner, onSubmit, ...restProps } = props;

  const handleOnSubmit = form => {
    setIsSubmitting(true);
    onSubmit(form);
  };

  return (
    <div className="formWrapper">
      <FormWithTheme
        {...restProps}
        className={`rjsf ${className ? className : ""}`}
        validator={validator}
        onSubmit={handleOnSubmit}
        // @ts-ignore
        fields={adminFields}
        disabled={disabled || showSpinner}
      />
      {(isSubmitting || showSpinner) && <Spinner />}
    </div>
  );
}

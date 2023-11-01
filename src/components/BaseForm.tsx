import React from "react";
import { withTheme, FormProps } from "@rjsf/core";
import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import validator from "@rjsf/validator-ajv8";

import TagsField from "./TagsField";
import Spinner from "./Spinner";

const adminFields = { tags: TagsField };

const FormWithTheme = withTheme(Bootstrap4Theme);

export type BaseFormProps = Omit<FormProps, "validator"> & {
  showSpinner?: boolean;
};

export default function BaseForm(props: BaseFormProps) {
  const { className, disabled, showSpinner, ...restProps } = props;

  return (
    <div className="formWrapper">
      <FormWithTheme
        {...restProps}
        className={`rjsf ${className ? className : ""}`}
        validator={validator}
        // @ts-ignore
        fields={adminFields}
        disabled={disabled || showSpinner}
      />
      {showSpinner && <Spinner />}
    </div>
  );
}

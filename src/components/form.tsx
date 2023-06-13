import { button, formRow, input } from "@/styles/forms.css";
import { error } from "@/styles/text.css";
import { Field, FieldAttributes, FieldProps } from "formik";
import React from "react";

export function FormInput(
  props: FieldAttributes<{
    hint?: string;
    label?: string;
    disabled?: boolean;
  }>
) {
  const id = React.useId();

  return (
    <div className={formRow}>
      {props.label && <label htmlFor={id}>{props.label}</label>}
      <Field id={id} {...props}>
        {(fieldProps: FieldProps) => {
          const { form, field, meta } = fieldProps;

          let textAfterField =
            meta.touched && meta.error ? (
              <p className={error}>{meta.error}</p>
            ) : (
              props.hint && <p>{props.hint}</p>
            );

          let style = props.type === "submit" ? button : input;

          return (
            <>
              <input
                className={style}
                type={props.type}
                placeholder={props.placeholder}
                disabled={props.disabled}
                title={props.title}
                value={props.value}
                onChange={(event) => {
                  form.setFieldValue(field.name, event.currentTarget.value);
                }}
              />
              {textAfterField}
            </>
          );
        }}
      </Field>
    </div>
  );
}

export function FormWithError({
  error,
  className,
  children
}: {
  error: string | null | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  let formClass = "form";

  return (
    <div className="form">
      {error != null && <span className="textError">{error}</span>}
      {children}
    </div>
  );
}

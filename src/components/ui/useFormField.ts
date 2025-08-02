import React from "react";
import { useFormContext, useFormState, type FieldPath, type FieldValues } from "react-hook-form";

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);


const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

function useFormField<
  TFieldValues extends import("react-hook-form").FieldValues = import("react-hook-form").FieldValues,
  TName extends import("react-hook-form").FieldPath<TFieldValues> = import("react-hook-form").FieldPath<TFieldValues>
>() {
  const fieldContext = React.useContext(FormFieldContext) as { name: TName };
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext<TFieldValues>();
  const formState = useFormState<TFieldValues>({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

export { useFormField }
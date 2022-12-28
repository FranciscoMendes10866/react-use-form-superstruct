import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { Struct, StructError, assert } from "superstruct";

interface IArgs<T> {
  initialValues: T;
  validationSchema: Struct<T, unknown>;
  resetOnSubmit?: boolean;
}

type IErrors<T> = Record<keyof T, string> | undefined;
type IHandleSubmit<T> = (values: T) => void;

interface IGetInputOptions {
  includeError?: boolean;
  type?: "text" | "checkbox" | "textarea";
  placeholder?: string;
}

interface IGetInputProps<T> extends IGetInputOptions {
  onChange: (evt: ChangeEvent<unknown>) => void;
  error?: string;
  checked?: boolean;
  value?: number | string;
  name: keyof T;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema,
  resetOnSubmit = true,
}: IArgs<T>) => {
  const [values, _setValues] = useState<T>(initialValues);
  const [errors, _setErrors] = useState<IErrors<T>>(undefined);

  const reset = useCallback(() => {
    _setErrors(undefined);
    _setValues(initialValues);
  }, []);

  const setValues = useCallback(({ target }: ChangeEvent<unknown>) => {
    let finalValue: string | boolean;
    let key: string;
    if (target instanceof HTMLInputElement) {
      const { type, checked, value, name } = target;
      finalValue = type === "checkbox" ? checked : value;
      key = name;
    } else if (target instanceof HTMLTextAreaElement) {
      const { value, name } = target;
      finalValue = value;
      key = name;
    }
    _setValues((currentValues) => ({ ...currentValues, [key]: finalValue }));
  }, []);

  const validate = useCallback(() => {
    try {
      assert(values, validationSchema);
    } catch (error) {
      if (error instanceof StructError) {
        const errorObj = error.failures().reduce(
          (acc, { key, message }) => ({
            ...acc,
            [key]: message,
          }),
          {}
        );
        _setErrors(errorObj as IErrors<T>);
        return errorObj;
      }
    }
    return {};
  }, [values, validationSchema]);

  const getInputProps = useCallback(
    (
      name: keyof T,
      { includeError, type = "text", placeholder }: IGetInputOptions = {}
    ) => {
      const props: IGetInputProps<T> = { onChange: setValues, name };
      if (includeError) props.error = errors?.[name];
      if (type === "checkbox") {
        props.checked = values?.[name];
        props.type = "checkbox";
      } else {
        props.value = values?.[name];
        props.type = type ?? "text";
        if (placeholder) props.placeholder = placeholder;
      }
      return props;
    },
    [errors, values]
  );

  const submitForm = useCallback(
    (handleSubmit: IHandleSubmit<T>) => (evt: FormEvent) => {
      evt.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length === 0) {
        handleSubmit(values);
        if (resetOnSubmit) reset();
      }
    },
    [values, resetOnSubmit]
  );

  return {
    values,
    errors,
    getInputProps,
    submitForm,
    reset,
  };
};

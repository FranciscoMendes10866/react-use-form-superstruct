import { useCallback } from "react";
import { object, nonempty, string, boolean, Infer } from "superstruct";

import { useForm } from "./hooks/useForm";

const validationSchema = object({
  name: nonempty(string()),
  message: nonempty(string()),
  isChecked: boolean(),
});

type IFormValues = Infer<typeof validationSchema>;

const App = () => {
  const { values, errors, getInputProps, submitForm } = useForm<IFormValues>({
    initialValues: {
      name: "",
      message: "",
      isChecked: false,
    },
    validationSchema,
  });

  const onSubmit = useCallback((formValues: IFormValues) => {
    alert(JSON.stringify(formValues));
  }, []);

  return (
    <section>
      <form onSubmit={submitForm(onSubmit)}>
        <input
          {...getInputProps("name", { placeholder: "Type your name..." })}
        />
        {errors?.name && <small>{errors.name}</small>}

        <textarea
          {...getInputProps("message", {
            type: "textarea",
            placeholder: "Leave a message...",
          })}
        />
        {errors?.message && (
          <>
            <small>{errors.message}</small>
            <br />
          </>
        )}

        <input {...getInputProps("isChecked", { type: "checkbox" })} />

        <br />
        <button type="submit">Send</button>
      </form>

      <pre>
        <code>{JSON.stringify(values, null, 2)}</code>
      </pre>
    </section>
  );
};

export default App;

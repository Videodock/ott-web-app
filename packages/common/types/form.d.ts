export type UseFormChangeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
export type UseFormBlurHandler = React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
export type UseFormSubmitHandler = React.FormEventHandler<HTMLFormElement>;

export type GenericFormErrors = { form: string };
export type GenericFormValues = Record<string, string | boolean>;
export type FormErrors<T> = Partial<{ [K in keyof T]: string } & GenericFormErrors>;
export type FormValues<T> = Partial<T & GenericFormValues>;

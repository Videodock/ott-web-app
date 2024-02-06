export type UseFormChangeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
export type UseFormBlurHandler = React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
export type UseFormSubmitHandler = React.FormEventHandler<HTMLFormElement>;

export type GenericFormErrors = { form: string };
// @TODO: this type is recursive and not working properly
export type GenericFormValues = Record<string, string | boolean>;
export type GenericFormNestedValues = Record<string, string | boolean | GenericFormValues>;
export type KeyedFormErrors<T> = { [K in keyof T]: T[K] extends Record<string, unknown> ? KeyedFormErrors<T[K]> : string };
export type FormErrors<T> = Partial<KeyedFormErrors<T> & GenericFormErrors>;
export type FormValues<T> = Partial<T & GenericFormValues>;

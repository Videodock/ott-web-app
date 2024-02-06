export type UseFormChangeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
export type UseFormBlurHandler = React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
export type UseFormSubmitHandler = React.FormEventHandler<HTMLFormElement>;

export type GenericFormErrors = { form: string | undefined };
// @TODO: this type is recursive and not working properly
export type GenericFormValues = Record<string, string | boolean>;
export type GenericFormNestedValues = Record<string, string | boolean | GenericFormValues>;
export type FormErrors<T> = Partial<Record<string, string | undefined> & GenericFormErrors>;
export type FormValues<T> = Partial<T & GenericFormValues>;

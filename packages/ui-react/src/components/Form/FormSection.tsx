import React, { useCallback, useContext, type ReactElement, type ReactNode } from 'react';
import type { GenericFormNestedValues } from '@jwp/ott-common/types/form';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import Button from '../Button/Button';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';

import styles from './Form.module.scss';
import { FormContext } from './Form';

export interface FormSectionContentArgs<T, TErrors> {
  values: T;
  isEditing: boolean;
  isBusy: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  errors?: TErrors | undefined;
}

export interface FormSectionProps<TData, TErrors> {
  className?: string;
  panelHeaderClassName?: string;
  label: string;
  editButton?: string | ReactElement;
  saveButton?: string;
  cancelButton?: string;
  canSave?: (values: TData) => boolean;
  onSubmit?: (values: TData) => Promise<void>;
  content?: (args: FormSectionContentArgs<TData, TErrors>) => ReactNode;
  children?: never;
  readOnly?: boolean;
}

export function FormSection<TData extends GenericFormNestedValues>({
  className,
  panelHeaderClassName,
  label,
  editButton,
  saveButton,
  cancelButton,
  canSave,
  onSubmit,
  content,
  readOnly = false,
}: FormSectionProps<TData, string[]>): ReactElement<FormSectionProps<TData, string[]>> | null {
  const sectionId = useOpaqueId(label);
  const {
    formState: { values, activeSectionId, isDirty, errors: formErrors, isBusy },
    setFormState,
    isLoading,
    onCancel,
  } = useContext(FormContext) as unknown as FormContext<TData>;

  const isEditing = sectionId === activeSectionId;

  const onChange = useCallback(
    ({ currentTarget }: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!currentTarget) return;

      const { name, type } = currentTarget;
      const value = type === 'checkbox' ? (currentTarget as HTMLInputElement).checked : currentTarget.value;

      if (!isEditing) {
        onCancel();
      }

      setFormState((oldState) => {
        const newValues = { ...oldState.values };

        // This logic handles nested names like 'consents.terms'
        const [nestedKey, fieldName] = name.split('.');

        if (nestedKey in newValues) {
          // @ts-ignore this typing is not working properly
          newValues[nestedKey as keyof TData] = {
            ...newValues[nestedKey],
            [fieldName]: value,
          };
        }

        return {
          ...oldState,
          values: newValues,
          isDirty: true,
          activeSectionId: sectionId,
        };
      });
    },
    [isEditing, onCancel, sectionId, setFormState],
  );

  const handleSubmit = useCallback(
    async function handleSubmit(event?: React.FormEvent) {
      event && event.preventDefault();

      if (onSubmit) {
        let errors: string[] = [];

        try {
          setFormState((s) => {
            return { ...s, isBusy: true };
          });
          await onSubmit(values);
        } catch (error: unknown) {
          errors = Array.of(error instanceof Error ? error.message : (error as string));
        }

        // Don't leave edit mode if there are errors
        if (errors.length) {
          setFormState((s) => {
            return {
              ...s,
              errors,
              isBusy: false,
            };
          });

          return;
        }
      }

      setFormState((s) => {
        return {
          ...s,
          activeSectionId: undefined,
          isDirty: false,
          isBusy: false,
        };
      });
    },
    [onSubmit, setFormState, values],
  );

  const onEdit = useCallback(
    function onEdit() {
      if (!isEditing) {
        onCancel();

        setFormState((s) => {
          return {
            ...s,
            activeSectionId: sectionId,
          };
        });
      }
    },
    [isEditing, onCancel, sectionId, setFormState],
  );

  return (
    <section aria-labelledby={sectionId} className={className}>
      <div className={panelHeaderClassName}>
        <h2 id={sectionId}>{label}</h2>
      </div>
      {isBusy && isEditing && <LoadingOverlay transparentBackground />}
      {content && (
        <form className={styles.flexBox} noValidate onSubmit={(event) => event.preventDefault()}>
          {content({
            values,
            isEditing,
            isBusy,
            onChange,
            ...(isEditing ? { errors: formErrors } : {}),
          })}
        </form>
      )}
      {(saveButton || editButton || cancelButton) && (
        <div className={styles.controls}>
          {isEditing ? (
            <>
              {saveButton && (
                <Button label={saveButton} type="submit" onClick={handleSubmit} disabled={!isDirty || isLoading || (canSave && !canSave(values))} />
              )}
              {cancelButton && <Button label={cancelButton} type="reset" variant="text" onClick={onCancel} />}
            </>
          ) : (
            !readOnly &&
            editButton &&
            (typeof editButton === 'object' ? (
              (editButton as ReactElement)
            ) : (
              <Button label={editButton as string} type="button" onClick={onEdit} disabled={isLoading} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

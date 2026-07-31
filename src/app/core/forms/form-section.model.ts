export type FormFieldType = 'text' | 'number' | 'select' | 'checkbox';

export interface FormFieldOption {
  label: string;
  value: string | number | null;
}

export interface FormFieldConfig {
  type: FormFieldType;
  controlName: string;
  label: string;
  id?: string;
  labelCol?: string;
  inputCol?: string;
  readonly?: boolean;
  hidden?: boolean;
  options?: FormFieldOption[];
  groupErrorKey?: string;
  groupErrorFields?: string[];
  groupErrorMessage?: string;
}

export interface FormSectionConfig {
  title: string;
  topMargin?: boolean;
  columns: FormFieldConfig[][];
}

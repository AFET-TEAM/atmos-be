export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "url"
    | "textarea"
    | "number"
    | "email"
    | "password"
    | "file"
    | "date"
    | "time";
  placeholder?: string;
  required?: boolean;
  value?: string | number;
  autoFocus?: boolean;
};

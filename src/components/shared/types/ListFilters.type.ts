export type ListFilterFieldType = "text" | "masked" | "select";

export interface ListFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface ListFilterField {
  readonly name: string;
  readonly label: string;
  readonly type: ListFilterFieldType;
  readonly placeholder?: string;
  readonly options?: readonly ListFilterOption[];
  readonly mask?: (value: string) => string;
  readonly unmask?: (value: string) => string;
}

export type ListFilterValues = Record<string, string>;

export type FiltroListaFieldType = "text" | "masked" | "select";

export interface FiltroListaOption {
  readonly value: string;
  readonly label: string;
}

export interface FiltroListaField {
  readonly name: string;
  readonly label: string;
  readonly type: FiltroListaFieldType;
  readonly placeholder?: string;
  readonly options?: readonly FiltroListaOption[];
  readonly mask?: (value: string) => string;
  readonly unmask?: (value: string) => string;
  readonly disabled?: (values: FiltroListaValues) => boolean;
  readonly tooltip?: string;
}

export type FiltroListaRow = readonly FiltroListaField[];

export interface FiltrosListaProps {
  readonly title?: string;
  readonly description?: string;
  readonly fields: readonly FiltroListaRow[];
  readonly values: FiltroListaValues;
  readonly onChange: (name: string, value: string) => void;
  readonly onSearch: () => void;
  readonly onClear: () => void;
  readonly searchLabel?: string;
}

export type FiltroListaValues = Record<string, string>;

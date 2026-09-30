export type FiltroListaFieldType = "text" | "masked" | "select";

export interface FiltroListaOption {
  readonly value: string;
  readonly label: string;
}

export type FiltroListaValues = Record<string, string>;

export interface FiltroListaField<
  TValues extends FiltroListaValues = FiltroListaValues,
> {
  readonly name: Extract<keyof TValues, string>;
  readonly label: string;
  readonly type: FiltroListaFieldType;
  readonly placeholder?: string;
  readonly options?: readonly FiltroListaOption[];
  readonly mask?: (value: string) => string;
  readonly unmask?: (value: string) => string;
  readonly disabled?: (values: TValues) => boolean;
  readonly tooltip?: string;
}

export type FiltroListaRow<
  TValues extends FiltroListaValues = FiltroListaValues,
> = readonly FiltroListaField<TValues>[];

export interface FiltrosListaProps<
  TValues extends FiltroListaValues = FiltroListaValues,
> {
  readonly title?: string;
  readonly description?: string;
  readonly fields: readonly FiltroListaRow<TValues>[];
  readonly values: TValues;
  readonly onChange: (name: Extract<keyof TValues, string>, value: string) => void;
  readonly onSearch: () => void;
  readonly onClear: () => void;
  readonly searchLabel?: string;
}

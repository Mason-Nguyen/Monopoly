export type Nullable<T> = T | null;
export type Dictionary<TKey extends string, TValue> = Record<TKey, TValue>;
export interface ErrorEventPayload<Code extends string> {
    code: Code;
    message: string;
}

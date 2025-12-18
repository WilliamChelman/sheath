/**
 * i18n Type Utilities
 *
 * Provides full type-safety for translation keys and interpolation params.
 */

export type Primitive = string | number | boolean | Date | null | undefined;

/**
 * A message definition without params.
 */
export interface SimpleMessageDef {
  readonly message: string;
}

/**
 * A message definition with typed params.
 */
export interface ParamMessageDef<TParams extends Record<string, Primitive>> {
  readonly message: string;
  readonly params: TParams;
}

/**
 * A message definition - either simple or with params.
 */
export type MessageDef<
  TParams extends Record<string, Primitive> | never = never
> = [TParams] extends [never] ? SimpleMessageDef : ParamMessageDef<TParams>;

/**
 * Any message def (for schema typing).
 */
export type AnyMessageDef =
  | SimpleMessageDef
  | ParamMessageDef<Record<string, Primitive>>;

/**
 * A schema is a nested object where leaves are message definitions.
 */
export type MessageSchema = {
  readonly [key: string]: AnyMessageDef | MessageSchema;
};

/**
 * Check if a type is a message definition (leaf node).
 */
export type IsMessageDef<T> = T extends { message: string } ? true : false;

/**
 * Helper to flatten keys with depth limit to prevent infinite recursion.
 * Supports up to 5 levels of nesting.
 */
type FlattenLevel5<T, P extends string> = T extends { message: string }
  ? P
  : never;

type FlattenLevel4<T, P extends string> = T extends { message: string }
  ? P
  : T extends object
  ? { [K in keyof T & string]: FlattenLevel5<T[K], `${P}.${K}`> }[keyof T &
      string]
  : never;

type FlattenLevel3<T, P extends string> = T extends { message: string }
  ? P
  : T extends object
  ? { [K in keyof T & string]: FlattenLevel4<T[K], `${P}.${K}`> }[keyof T &
      string]
  : never;

type FlattenLevel2<T, P extends string> = T extends { message: string }
  ? P
  : T extends object
  ? { [K in keyof T & string]: FlattenLevel3<T[K], `${P}.${K}`> }[keyof T &
      string]
  : never;

type FlattenLevel1<T, P extends string> = T extends { message: string }
  ? P
  : T extends object
  ? { [K in keyof T & string]: FlattenLevel2<T[K], `${P}.${K}`> }[keyof T &
      string]
  : never;

/**
 * Flatten a nested schema into dot-separated key paths.
 * Supports up to 5 levels of nesting.
 *
 * Example:
 *   { home: { title: { message: 'Home' } } }
 *   => 'home.title'
 */
export type FlattenKeys<T> = T extends { message: string }
  ? ''
  : T extends object
  ? { [K in keyof T & string]: FlattenLevel1<T[K], K> }[keyof T & string]
  : never;

/**
 * Get the value at a given dot-separated path.
 */
export type GetAtPath<
  T,
  Path extends string
> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? GetAtPath<T[Head], Tail>
    : never
  : Path extends keyof T
  ? T[Path]
  : never;

/**
 * Extract params type from a MessageDef.
 * Returns Record<string, never> (empty object) for simple messages.
 */
export type ExtractParams<T> = T extends ParamMessageDef<infer P>
  ? P
  : T extends SimpleMessageDef
  ? Record<string, never>
  : never;

/**
 * Get the params for a given key path in a schema.
 */
export type ParamsForKey<TSchema, TKey extends string> = ExtractParams<
  GetAtPath<TSchema, TKey>
>;

/**
 * Check if params are required for a key.
 */
export type HasParams<TSchema, TKey extends string> = keyof ParamsForKey<
  TSchema,
  TKey
> extends never
  ? false
  : true;

/**
 * Locale messages: same structure as schema but with string values only.
 */
export type LocaleMessages<T> = T extends { message: string }
  ? string
  : T extends object
  ? { readonly [K in keyof T]: LocaleMessages<T[K]> }
  : never;

/**
 * Supported locales type (extend as needed).
 */
export type SupportedLocale = 'en' | 'fr';

/**
 * A bundle's locale map.
 */
export type LocaleMap<TSchema extends MessageSchema> = {
  readonly [L in SupportedLocale]?: LocaleMessages<TSchema>;
};

/**
 * Require at least 'en' locale.
 */
export type RequiredLocaleMap<TSchema extends MessageSchema> = {
  readonly en: LocaleMessages<TSchema>;
} & LocaleMap<TSchema>;

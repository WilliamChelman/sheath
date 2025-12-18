/**
 * i18n Bundle Utilities
 *
 * Allows components/features to define their own message bundles independently.
 */

import { IntlMessageFormat } from 'intl-messageformat';
import type {
  FlattenKeys,
  LocaleMessages,
  MessageSchema,
  Primitive,
  RequiredLocaleMap,
  SupportedLocale,
} from './i18n.types';

/**
 * An i18n bundle definition.
 */
export interface I18nBundle<
  TNamespace extends string = string,
  TSchema extends MessageSchema = MessageSchema
> {
  readonly namespace: TNamespace;
  readonly schema: TSchema;
  readonly locales: RequiredLocaleMap<TSchema>;
}

/**
 * Define a type-safe i18n bundle.
 *
 * @example
 * ```ts
 * const homeBundle = defineI18nBundle({
 *   namespace: 'home',
 *   schema: {
 *     title: { message: '' },
 *     welcome: { message: '', params: {} as { name: string } },
 *   } as const,
 *   locales: {
 *     en: { title: 'Home', welcome: 'Welcome, {name}!' },
 *   },
 * });
 * ```
 */
export function defineI18nBundle<
  TNamespace extends string,
  TSchema extends MessageSchema
>(bundle: I18nBundle<TNamespace, TSchema>): I18nBundle<TNamespace, TSchema> {
  return bundle;
}

/**
 * Get a message from locale messages by dot-separated path.
 */
function getMessageByPath(
  messages: LocaleMessages<MessageSchema>,
  path: string
): string | undefined {
  const parts = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = messages;

  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * A translator function scoped to a specific bundle.
 * All keys are valid, params are optional (runtime validated).
 */
export type BundleTranslator<TSchema extends MessageSchema> = (
  key: FlattenKeys<TSchema>,
  params?: Record<string, Primitive>
) => string;

/**
 * Create a translator function for a specific bundle.
 * This is used by I18nService internally.
 */
export function createBundleTranslator<TSchema extends MessageSchema>(
  getLocale: () => SupportedLocale,
  locales: RequiredLocaleMap<TSchema>,
  formatterCache: Map<string, IntlMessageFormat>
): BundleTranslator<TSchema> {
  return (key: FlattenKeys<TSchema>, params?: Record<string, Primitive>) => {
    const locale = getLocale();
    const messages = locales[locale] ?? locales.en;
    const message = getMessageByPath(messages, key as string);

    if (!message) {
      console.warn(`[i18n] Missing translation for key: ${String(key)}`);
      return String(key);
    }

    // If no params and no ICU syntax, return directly
    if (!params && !message.includes('{')) {
      return message;
    }

    // Format with ICU
    const cacheKey = `${locale}:${String(key)}`;
    let formatter = formatterCache.get(cacheKey);

    if (!formatter) {
      formatter = new IntlMessageFormat(message, locale);
      formatterCache.set(cacheKey, formatter);
    }

    return formatter.format(params ?? {}) as string;
  };
}

/**
 * Composed bundle entry for the app registry.
 */
export interface ComposedBundleEntry {
  readonly namespace: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly locales: RequiredLocaleMap<any>;
}

/**
 * Compose multiple bundles into a single registry.
 * Detects namespace collisions at runtime.
 */
export function composeBundles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bundles: readonly I18nBundle<string, any>[]
): Map<string, ComposedBundleEntry> {
  const registry = new Map<string, ComposedBundleEntry>();
  const namespaces = new Set<string>();

  for (const bundle of bundles) {
    if (namespaces.has(bundle.namespace)) {
      throw new Error(
        `[i18n] Duplicate namespace detected: "${bundle.namespace}". Each bundle must have a unique namespace.`
      );
    }

    namespaces.add(bundle.namespace);
    registry.set(bundle.namespace, {
      namespace: bundle.namespace,
      locales: bundle.locales,
    });
  }

  return registry;
}

/**
 * Type helper: extract the full namespaced key type from a bundle.
 */
export type NamespacedKeys<TBundle extends I18nBundle> =
  TBundle extends I18nBundle<infer TNamespace, infer TSchema>
    ? `${TNamespace}.${FlattenKeys<TSchema> & string}`
    : never;

/**
 * Type helper: combine keys from multiple bundles.
 */
export type CombinedBundleKeys<TBundles extends readonly I18nBundle[]> =
  TBundles[number] extends I18nBundle
    ? NamespacedKeys<TBundles[number]>
    : never;

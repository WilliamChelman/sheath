/**
 * i18n Service
 *
 * Signal-based i18n service for Angular applications.
 */

import { Injectable, signal, computed, type Signal } from '@angular/core';
import { IntlMessageFormat } from 'intl-messageformat';
import {
  composeBundles,
  createBundleTranslator,
  type BundleTranslator,
  type ComposedBundleEntry,
  type I18nBundle,
} from './i18n.bundle';
import type {
  FlattenKeys,
  MessageSchema,
  Primitive,
  SupportedLocale,
} from './i18n.types';

/**
 * Configuration for the I18nService.
 */
export interface I18nConfig {
  readonly defaultLocale: SupportedLocale;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly bundles: readonly I18nBundle<string, any>[];
}

/**
 * I18nService - provides type-safe translations with signal-based reactivity.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _locale = signal<SupportedLocale>('en');
  private readonly _registry = signal<Map<string, ComposedBundleEntry>>(
    new Map()
  );
  private readonly _formatterCache = new Map<string, IntlMessageFormat>();

  /**
   * Current locale as a readonly signal.
   */
  readonly locale: Signal<SupportedLocale> = this._locale.asReadonly();

  /**
   * Available locales based on registered bundles.
   */
  readonly availableLocales = computed(() => {
    const registry = this._registry();
    const locales = new Set<SupportedLocale>(['en']);

    for (const entry of registry.values()) {
      for (const locale of Object.keys(entry.locales) as SupportedLocale[]) {
        locales.add(locale);
      }
    }

    return Array.from(locales);
  });

  /**
   * Initialize the i18n service with bundles and default locale.
   */
  init(config: I18nConfig): void {
    const registry = composeBundles(config.bundles);
    this._registry.set(registry);
    this._locale.set(config.defaultLocale);
    this._formatterCache.clear();
  }

  /**
   * Set the current locale.
   */
  setLocale(locale: SupportedLocale): void {
    if (this._locale() !== locale) {
      this._locale.set(locale);
      // Clear formatter cache when locale changes
      this._formatterCache.clear();
    }
  }

  /**
   * Translate a namespaced key (namespace.key.path).
   *
   * @example
   * ```ts
   * i18n.t('home.title');
   * i18n.t('home.welcome', { name: 'John' });
   * ```
   */
  t(key: string, params?: Record<string, Primitive>): string {
    const [namespace, ...keyParts] = key.split('.');
    const keyPath = keyParts.join('.');

    const entry = this._registry().get(namespace);
    if (!entry) {
      console.warn(`[i18n] Unknown namespace: "${namespace}" in key: "${key}"`);
      return key;
    }

    const locale = this._locale();
    const messages = entry.locales[locale] ?? entry.locales.en;
    const message = this.getMessageByPath(messages, keyPath);

    if (!message) {
      console.warn(`[i18n] Missing translation for key: "${key}"`);
      return key;
    }

    // If no params and no ICU syntax, return directly
    if (!params && !message.includes('{')) {
      return message;
    }

    // Format with ICU
    const cacheKey = `${locale}:${key}`;
    let formatter = this._formatterCache.get(cacheKey);

    if (!formatter) {
      formatter = new IntlMessageFormat(message, locale);
      this._formatterCache.set(cacheKey, formatter);
    }

    return formatter.format(params ?? {}) as string;
  }

  /**
   * Create a bundle-scoped translator.
   * Components can use this for type-safe translations limited to their bundle.
   *
   * @example
   * ```ts
   * const t = i18nService.useBundleT(homeBundle);
   * t('title'); // Type-safe, only accepts keys from homeBundle
   * ```
   */
  useBundleT<TSchema extends MessageSchema>(
    bundle: I18nBundle<string, TSchema>
  ): BundleTranslator<TSchema> {
    return createBundleTranslator(
      () => this._locale(),
      bundle.locales,
      this._formatterCache
    );
  }

  /**
   * Create a signal-based translator that reacts to locale changes.
   * Returns a computed signal with the translation value.
   *
   * @example
   * ```ts
   * title = i18nService.translate('home.title');
   * // In template: {{ title() }}
   * ```
   */
  translate(key: string, params?: Record<string, Primitive>): Signal<string> {
    return computed(() => {
      // Access locale to create dependency
      this._locale();
      return this.t(key, params);
    });
  }

  /**
   * Create a bundle-scoped signal translator.
   *
   * @example
   * ```ts
   * const tSignal = i18nService.useBundleTSignal(homeBundle);
   * title = tSignal('title'); // Returns Signal<string>
   * ```
   */
  useBundleTSignal<TSchema extends MessageSchema>(
    bundle: I18nBundle<string, TSchema>
  ): (key: FlattenKeys<TSchema>, params?: Record<string, Primitive>) => Signal<string> {
    const translator = this.useBundleT(bundle);

    return (key: FlattenKeys<TSchema>, params?: Record<string, Primitive>) => {
      return computed(() => {
        // Access locale to create dependency
        this._locale();
        return translator(key, params);
      });
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getMessageByPath(messages: any, path: string): string | undefined {
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
}

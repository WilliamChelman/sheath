// Types
export type {
  Primitive,
  SimpleMessageDef,
  ParamMessageDef,
  MessageDef,
  AnyMessageDef,
  MessageSchema,
  FlattenKeys,
  GetAtPath,
  ExtractParams,
  ParamsForKey,
  HasParams,
  LocaleMessages,
  SupportedLocale,
  LocaleMap,
  RequiredLocaleMap,
} from './lib/i18n.types';

// Bundle utilities
export {
  defineI18nBundle,
  createBundleTranslator,
  composeBundles,
  type I18nBundle,
  type BundleTranslator,
  type ComposedBundleEntry,
  type NamespacedKeys,
  type CombinedBundleKeys,
} from './lib/i18n.bundle';

// Service
export { I18nService, type I18nConfig } from './lib/i18n.service';

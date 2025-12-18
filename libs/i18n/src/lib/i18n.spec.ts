import { describe, it, expect, beforeEach } from 'vitest';
import { I18nService } from './i18n.service';
import { defineI18nBundle, composeBundles } from './i18n.bundle';

// Test bundle with various message types
const testBundle = defineI18nBundle({
  namespace: 'test',
  schema: {
    simple: { message: '' },
    nested: {
      deep: {
        key: { message: '' },
      },
    },
    withParam: {
      message: '',
      params: {} as { name: string },
    },
    plural: {
      message: '',
      params: {} as { count: number },
    },
    select: {
      message: '',
      params: {} as { gender: string },
    },
  } as const,
  locales: {
    en: {
      simple: 'Hello',
      nested: {
        deep: {
          key: 'Deep value',
        },
      },
      withParam: 'Hello, {name}!',
      plural: '{count, plural, =0 {No items} one {# item} other {# items}}',
      select:
        '{gender, select, male {He} female {She} other {They}} liked this',
    },
  },
});

const anotherBundle = defineI18nBundle({
  namespace: 'another',
  schema: {
    greeting: { message: '' },
  } as const,
  locales: {
    en: {
      greeting: 'Greetings',
    },
  },
});

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    service = new I18nService();
    service.init({
      defaultLocale: 'en',
      bundles: [testBundle, anotherBundle],
    });
  });

  describe('basic translation', () => {
    it('should translate simple keys', () => {
      expect(service.t('test.simple')).toBe('Hello');
    });

    it('should translate nested keys', () => {
      expect(service.t('test.nested.deep.key')).toBe('Deep value');
    });

    it('should return key for missing translations', () => {
      expect(service.t('test.nonexistent')).toBe('test.nonexistent');
    });

    it('should return key for unknown namespace', () => {
      expect(service.t('unknown.key')).toBe('unknown.key');
    });
  });

  describe('locale switching', () => {
    it('should switch locale', () => {
      expect(service.t('test.simple')).toBe('Hello');

      service.setLocale('de');

      // Falls back to 'en' since 'de' not defined
      expect(service.t('test.simple')).toBe('Hello');
      expect(service.locale()).toBe('de');
    });

    it('should fall back to en for missing locale', () => {
      service.setLocale('fr');

      // Falls back to 'en' since 'fr' not defined
      expect(service.t('test.simple')).toBe('Hello');
    });
  });

  describe('ICU message formatting', () => {
    it('should interpolate simple params', () => {
      expect(service.t('test.withParam', { name: 'World' })).toBe(
        'Hello, World!'
      );
    });

    it('should handle plurals - zero', () => {
      expect(service.t('test.plural', { count: 0 })).toBe('No items');
    });

    it('should handle plurals - one', () => {
      expect(service.t('test.plural', { count: 1 })).toBe('1 item');
    });

    it('should handle plurals - many', () => {
      expect(service.t('test.plural', { count: 5 })).toBe('5 items');
    });

    it('should handle select - male', () => {
      expect(service.t('test.select', { gender: 'male' })).toBe(
        'He liked this'
      );
    });

    it('should handle select - female', () => {
      expect(service.t('test.select', { gender: 'female' })).toBe(
        'She liked this'
      );
    });

    it('should handle select - other', () => {
      expect(service.t('test.select', { gender: 'nonbinary' })).toBe(
        'They liked this'
      );
    });
  });

  describe('bundle-scoped translator', () => {
    it('should create bundle-scoped translator', () => {
      const t = service.useBundleT(testBundle);

      expect(t('simple')).toBe('Hello');
      expect(t('nested.deep.key')).toBe('Deep value');
    });

    it('should react to locale changes', () => {
      const t = service.useBundleT(testBundle);

      expect(t('simple')).toBe('Hello');

      service.setLocale('de');

      // Falls back to 'en' since 'de' not defined
      expect(t('simple')).toBe('Hello');
    });

    it('should handle params in bundle translator', () => {
      const t = service.useBundleT(testBundle);

      expect(t('withParam', { name: 'TypeScript' })).toBe('Hello, TypeScript!');
    });
  });

  describe('multiple bundles', () => {
    it('should access keys from different bundles', () => {
      expect(service.t('test.simple')).toBe('Hello');
      expect(service.t('another.greeting')).toBe('Greetings');
    });
  });

  describe('available locales', () => {
    it('should return available locales', () => {
      const locales = service.availableLocales();

      expect(locales).toContain('en');
      expect(locales).not.toContain('es');
    });
  });
});

describe('composeBundles', () => {
  it('should compose multiple bundles', () => {
    const registry = composeBundles([testBundle, anotherBundle]);

    expect(registry.size).toBe(2);
    expect(registry.has('test')).toBe(true);
    expect(registry.has('another')).toBe(true);
  });

  it('should throw on duplicate namespace', () => {
    const duplicateBundle = defineI18nBundle({
      namespace: 'test', // Same as testBundle
      schema: {
        key: { message: '' },
      } as const,
      locales: {
        en: { key: 'Value' },
      },
    });

    expect(() => composeBundles([testBundle, duplicateBundle])).toThrow(
      'Duplicate namespace detected: "test"'
    );
  });
});

describe('defineI18nBundle', () => {
  it('should create a bundle with correct structure', () => {
    const bundle = defineI18nBundle({
      namespace: 'myBundle',
      schema: {
        hello: { message: '' },
      } as const,
      locales: {
        en: { hello: 'Hello' },
      },
    });

    expect(bundle.namespace).toBe('myBundle');
    expect(bundle.locales.en.hello).toBe('Hello');
  });
});

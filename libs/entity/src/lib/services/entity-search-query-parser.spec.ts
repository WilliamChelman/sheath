import { describe, it, expect, beforeEach } from 'vitest';
import { EntitySearchQueryParser } from './entity-search-query-parser';
import { EntityClassPropertyConfig } from '../models/entity-class-property-config';

const testPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.level',
    name: 'Level',
    datatype: 'number',
    aliases: ['lvl'],
  },
  {
    id: 'sheath.ds.role',
    name: 'Role',
    datatype: 'string',
  },
  {
    id: 'sheath.ds.ancestry',
    name: 'Ancestry',
    datatype: 'string',
    isMulti: true,
    aliases: ['anc'],
  },
  {
    id: 'sheath.ds.stamina',
    name: 'Stamina',
    datatype: 'number',
    aliases: ['hp', 'health'],
  },
  {
    id: 'sheath.ds.stability',
    name: 'Stability',
    datatype: 'number',
    aliases: ['stab'],
  },
  {
    id: 'sheath.ds.freeStrike',
    name: 'Free Strike',
    datatype: 'number',
    aliases: ['fs', 'freestrike'],
  },
];

describe('EntitySearchQueryParser', () => {
  let parser: EntitySearchQueryParser;

  beforeEach(() => {
    parser = new EntitySearchQueryParser(testPropertyConfigs);
  });

  describe('text-only queries', () => {
    it('should parse plain text query', () => {
      const result = parser.parse('goblin warrior');

      expect(result.text).toBe('goblin warrior');
      expect(result.properties).toEqual({});
      expect(result.numberFilters).toEqual({});
    });

    it('should handle empty query', () => {
      const result = parser.parse('');

      expect(result.text).toBe('');
      expect(result.properties).toEqual({});
      expect(result.numberFilters).toEqual({});
    });

    it('should preserve quoted phrases', () => {
      const result = parser.parse('"time raider" boss');

      expect(result.text).toBe('time raider boss');
    });

    it('should handle multiple quoted phrases', () => {
      const result = parser.parse('"fire elemental" "ice dragon"');

      expect(result.text).toBe('fire elemental ice dragon');
    });
  });

  describe('property resolution', () => {
    it('should resolve property by alias', () => {
      const result = parser.parse('lvl:5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
      expect(result.text).toBe('');
    });

    it('should resolve property by name (case-insensitive)', () => {
      const result = parser.parse('Level:5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
    });

    it('should resolve property by name lowercase', () => {
      const result = parser.parse('level:5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
    });

    it('should resolve property by last segment of ID', () => {
      const result = parser.parse('role:boss');

      expect(result.properties['sheath.ds.role']).toBe('boss');
    });

    it('should resolve property with spaces in name', () => {
      const result = parser.parse('freestrike:5');

      expect(result.numberFilters['sheath.ds.freeStrike']).toEqual({
        exact: [5],
      });
    });

    it('should resolve by alias with multiple aliases', () => {
      const result = parser.parse('hp:50');

      expect(result.numberFilters['sheath.ds.stamina']).toEqual({ exact: [50] });
    });

    it('should resolve by alternate alias', () => {
      const result = parser.parse('health:50');

      expect(result.numberFilters['sheath.ds.stamina']).toEqual({ exact: [50] });
    });

    it('should resolve partial match if unambiguous', () => {
      const result = parser.parse('ro:boss');

      expect(result.properties['sheath.ds.role']).toBe('boss');
    });

    it('should treat ambiguous partial match as text', () => {
      // 'sta' could match 'stamina' or 'stability'
      const result = parser.parse('sta:5');

      expect(result.text).toBe('sta:5');
      expect(result.numberFilters).toEqual({});
    });

    it('should treat unknown property as text', () => {
      const result = parser.parse('unknown:value');

      expect(result.text).toBe('unknown:value');
      expect(result.properties).toEqual({});
    });

    it('should treat single-char partial match as text', () => {
      const result = parser.parse('r:boss');

      expect(result.text).toBe('r:boss');
    });
  });

  describe('string property filters', () => {
    it('should parse single string value', () => {
      const result = parser.parse('role:boss');

      expect(result.properties['sheath.ds.role']).toBe('boss');
    });

    it('should parse multi-value string filter', () => {
      const result = parser.parse('role:boss,brute,ambusher');

      expect(result.properties['sheath.ds.role']).toEqual([
        'boss',
        'brute',
        'ambusher',
      ]);
    });

    it('should parse multi-value without spaces', () => {
      const result = parser.parse('ancestry:humanoid,beast,dragon');

      expect(result.properties['sheath.ds.ancestry']).toEqual([
        'humanoid',
        'beast',
        'dragon',
      ]);
    });

    it('should treat spaced values as separate tokens', () => {
      // Spaces separate tokens, so this becomes: filter + text + text
      const result = parser.parse('ancestry:humanoid, beast, dragon');

      expect(result.properties['sheath.ds.ancestry']).toEqual(['humanoid']);
      expect(result.text).toBe('beast, dragon');
    });

    it('should filter empty values in multi-value', () => {
      const result = parser.parse('role:boss,,brute');

      expect(result.properties['sheath.ds.role']).toEqual(['boss', 'brute']);
    });
  });

  describe('number property filters', () => {
    it('should parse single number as exact match', () => {
      const result = parser.parse('level:5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
    });

    it('should parse explicit exact match with =', () => {
      const result = parser.parse('level:=5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
    });

    it('should parse number range', () => {
      const result = parser.parse('level:3-7');

      expect(result.numberFilters['sheath.ds.level']).toEqual({
        min: 3,
        max: 7,
      });
    });

    it('should parse greater than', () => {
      const result = parser.parse('level:>5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ min: 5.001 });
    });

    it('should parse greater than or equal', () => {
      const result = parser.parse('level:>=5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ min: 5 });
    });

    it('should parse less than', () => {
      const result = parser.parse('level:<10');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ max: 9.999 });
    });

    it('should parse less than or equal', () => {
      const result = parser.parse('level:<=10');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ max: 10 });
    });

    it('should parse list of exact numbers', () => {
      const result = parser.parse('level:1,3,5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({
        exact: [1, 3, 5],
      });
    });

    it('should handle decimal numbers', () => {
      const result = parser.parse('level:2.5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [2.5] });
    });

    it('should handle negative numbers in range', () => {
      const result = parser.parse('level:-5-5');

      expect(result.numberFilters['sheath.ds.level']).toEqual({
        min: -5,
        max: 5,
      });
    });

    it('should treat invalid number format as text', () => {
      const result = parser.parse('level:abc');

      expect(result.text).toBe('level:abc');
      expect(result.numberFilters).toEqual({});
    });

    it('should treat partially invalid number list as text', () => {
      const result = parser.parse('level:1,two,3');

      expect(result.text).toBe('level:1,two,3');
      expect(result.numberFilters).toEqual({});
    });
  });

  describe('mixed queries', () => {
    it('should parse text with single filter', () => {
      const result = parser.parse('goblin level:5');

      expect(result.text).toBe('goblin');
      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
    });

    it('should parse text with multiple filters', () => {
      const result = parser.parse('dragon level:5-10 role:boss');

      expect(result.text).toBe('dragon');
      expect(result.numberFilters['sheath.ds.level']).toEqual({
        min: 5,
        max: 10,
      });
      expect(result.properties['sheath.ds.role']).toBe('boss');
    });

    it('should handle filters before and after text', () => {
      const result = parser.parse('level:5 goblin warrior role:boss');

      expect(result.text).toBe('goblin warrior');
      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
      expect(result.properties['sheath.ds.role']).toBe('boss');
    });

    it('should handle quoted phrase with filters', () => {
      const result = parser.parse('"time raider" level:>5 ancestry:humanoid');

      expect(result.text).toBe('time raider');
      expect(result.numberFilters['sheath.ds.level']).toEqual({ min: 5.001 });
      expect(result.properties['sheath.ds.ancestry']).toBe('humanoid');
    });

    it('should handle multiple number filters', () => {
      const result = parser.parse('level:5 hp:>20 stability:>=3');

      expect(result.text).toBe('');
      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
      expect(result.numberFilters['sheath.ds.stamina']).toEqual({ min: 20.001 });
      expect(result.numberFilters['sheath.ds.stability']).toEqual({ min: 3 });
    });
  });

  describe('edge cases', () => {
    it('should treat trailing colon as text', () => {
      const result = parser.parse('level:');

      expect(result.text).toBe('level:');
      expect(result.numberFilters).toEqual({});
    });

    it('should handle colon at start of word', () => {
      const result = parser.parse(':value');

      expect(result.text).toBe(':value');
    });

    it('should handle multiple colons', () => {
      const result = parser.parse('time:10:30');

      expect(result.text).toBe('time:10:30');
    });

    it('should handle filter-like text for unknown property', () => {
      const result = parser.parse('foo:bar level:5');

      expect(result.text).toBe('foo:bar');
      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [5] });
    });

    it('should handle empty string value in filter', () => {
      const result = parser.parse('role:');

      expect(result.text).toBe('role:');
      expect(result.properties).toEqual({});
    });

    it('should handle whitespace-only query', () => {
      const result = parser.parse('   ');

      expect(result.text).toBe('');
    });

    it('should override later filter with same property', () => {
      const result = parser.parse('level:5 level:10');

      expect(result.numberFilters['sheath.ds.level']).toEqual({ exact: [10] });
    });
  });
});

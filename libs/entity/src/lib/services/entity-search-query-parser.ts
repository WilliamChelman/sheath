import { EntityClassPropertyConfig } from '../models/entity-class-property-config';
import { NumberRangeFilter } from './entity-search.service';

export interface ParsedSearchQuery {
  text: string;
  properties: Record<string, unknown>;
  numberFilters: Record<string, NumberRangeFilter>;
}

interface Token {
  type: 'text' | 'filter';
  raw: string;
  propertyName?: string;
  value?: string;
}

export class EntitySearchQueryParser {
  private readonly propertyLookup: Map<string, EntityClassPropertyConfig>;

  constructor(private readonly propertyConfigs: EntityClassPropertyConfig[]) {
    this.propertyLookup = this.buildPropertyLookup();
  }

  parse(query: string): ParsedSearchQuery {
    const tokens = this.tokenize(query);
    const textParts: string[] = [];
    const properties: Record<string, unknown> = {};
    const numberFilters: Record<string, NumberRangeFilter> = {};

    for (const token of tokens) {
      if (token.type === 'text') {
        textParts.push(token.raw);
        continue;
      }

      const config = this.resolveProperty(token.propertyName!);
      if (!config) {
        // Unknown property - treat as text
        textParts.push(token.raw);
        continue;
      }

      const value = token.value ?? '';
      if (!value) {
        // Empty value - treat as text
        textParts.push(token.raw);
        continue;
      }

      if (config.datatype === 'number') {
        const numFilter = this.parseNumberValue(value);
        if (numFilter) {
          numberFilters[config.id] = numFilter;
        } else {
          // Invalid number format - treat as text
          textParts.push(token.raw);
        }
      } else {
        // String or boolean property
        const parsedValue = this.parseStringValue(value);
        properties[config.id] = parsedValue;
      }
    }

    return {
      text: textParts.join(' ').trim(),
      properties: Object.keys(properties).length > 0 ? properties : {},
      numberFilters: Object.keys(numberFilters).length > 0 ? numberFilters : {},
    };
  }

  private tokenize(query: string): Token[] {
    const tokens: Token[] = [];
    const regex = /(?:"([^"]+)"|(\S+))/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(query)) !== null) {
      const quoted = match[1];
      const unquoted = match[2];

      if (quoted) {
        // Quoted phrase - always treat as text
        tokens.push({ type: 'text', raw: quoted });
        continue;
      }

      const token = unquoted;
      const colonIndex = token.indexOf(':');

      if (colonIndex > 0 && colonIndex < token.length - 1) {
        // Potential filter: prop:value
        const propertyName = token.slice(0, colonIndex);
        const value = token.slice(colonIndex + 1);
        tokens.push({
          type: 'filter',
          raw: token,
          propertyName,
          value,
        });
      } else if (colonIndex === token.length - 1) {
        // Trailing colon (prop:) - treat as text
        tokens.push({ type: 'text', raw: token });
      } else {
        // Regular word
        tokens.push({ type: 'text', raw: token });
      }
    }

    return tokens;
  }

  private buildPropertyLookup(): Map<string, EntityClassPropertyConfig> {
    const lookup = new Map<string, EntityClassPropertyConfig>();

    for (const config of this.propertyConfigs) {
      // Add aliases (highest priority - added first, checked last due to Map behavior)
      if (config.aliases) {
        for (const alias of config.aliases) {
          const key = alias.toLowerCase();
          if (!lookup.has(key)) {
            lookup.set(key, config);
          }
        }
      }

      // Add name (case-insensitive)
      const nameKey = config.name.toLowerCase().replace(/\s+/g, '');
      if (!lookup.has(nameKey)) {
        lookup.set(nameKey, config);
      }

      // Add last segment of ID
      const lastSegment = config.id.split('.').pop()?.toLowerCase();
      if (lastSegment && !lookup.has(lastSegment)) {
        lookup.set(lastSegment, config);
      }
    }

    return lookup;
  }

  private resolveProperty(name: string): EntityClassPropertyConfig | null {
    const key = name.toLowerCase().replace(/\s+/g, '');

    // Direct lookup
    const direct = this.propertyLookup.get(key);
    if (direct) {
      return direct;
    }

    // Partial match on last segment (if unambiguous)
    const partialMatches: EntityClassPropertyConfig[] = [];
    for (const config of this.propertyConfigs) {
      const lastSegment = config.id.split('.').pop()?.toLowerCase() ?? '';
      if (lastSegment.startsWith(key) && key.length >= 2) {
        partialMatches.push(config);
      }
    }

    if (partialMatches.length === 1) {
      return partialMatches[0];
    }

    // Ambiguous or no match
    return null;
  }

  private parseNumberValue(value: string): NumberRangeFilter | null {
    // Exact match with = prefix: =5
    if (value.startsWith('=')) {
      const num = parseFloat(value.slice(1));
      if (!isNaN(num)) {
        return { exact: [num] };
      }
      return null;
    }

    // Comparison operators: >=5, <=5, >5, <5
    const comparisonMatch = value.match(/^(>=|<=|>|<)(-?\d+(?:\.\d+)?)$/);
    if (comparisonMatch) {
      const op = comparisonMatch[1];
      const num = parseFloat(comparisonMatch[2]);
      if (!isNaN(num)) {
        switch (op) {
          case '>':
            return { min: num + 0.001 }; // Exclusive
          case '>=':
            return { min: num };
          case '<':
            return { max: num - 0.001 }; // Exclusive
          case '<=':
            return { max: num };
        }
      }
      return null;
    }

    // Range: 3-7
    const rangeMatch = value.match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      if (!isNaN(min) && !isNaN(max)) {
        return { min, max };
      }
      return null;
    }

    // List of exact values: 1,3,5
    if (value.includes(',')) {
      const values = value.split(',').map((v) => parseFloat(v.trim()));
      if (values.every((v) => !isNaN(v))) {
        return { exact: values };
      }
      return null;
    }

    // Single number (exact match)
    const singleNum = parseFloat(value);
    if (!isNaN(singleNum)) {
      return { exact: [singleNum] };
    }

    return null;
  }

  private parseStringValue(value: string): string | string[] {
    // Multi-value: a,b,c
    if (value.includes(',')) {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return value;
  }
}

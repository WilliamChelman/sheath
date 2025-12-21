import type {
  MarkedExtension,
  TokenizerAndRendererExtension,
  Tokens,
} from 'marked';

interface ComponentToken extends Tokens.Generic {
  type: 'component';
  raw: string;
  selector: string;
  inputs: Record<string, unknown>;
}

/**
 * Parse a simple YAML-like key-value block into an object.
 * Supports:
 * - key: value (string)
 * - key: 123 (number)
 * - key: true/false (boolean)
 * - key: "quoted string" (explicit string)
 */
function parseInputs(content: string): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: unknown = trimmed.slice(colonIndex + 1).trim();

    if (typeof value === 'string') {
      // Check for quoted strings
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      // Check for booleans
      else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      // Check for numbers
      else if (!isNaN(Number(value)) && value !== '') {
        value = Number(value);
      }
    }

    inputs[key] = value;
  }

  return inputs;
}

/**
 * Escape HTML special characters to prevent XSS.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Creates a marked extension for parsing component blocks.
 *
 * Syntax:
 * ```component:selector
 * key: value
 * key2: 123
 * ```
 *
 * Renders a placeholder div that will be hydrated into an Angular component:
 * <div data-md-component="selector" data-md-inputs="{...}"></div>
 */
export function createComponentExtension(): MarkedExtension {
  const componentExtension: TokenizerAndRendererExtension = {
    name: 'component',
    level: 'block',
    start(src: string) {
      return src.indexOf('```component:');
    },
    tokenizer(src: string): ComponentToken | undefined {
      // Match ```component:selector followed by optional content and closing ```
      const rule = /^```component:([a-zA-Z0-9_.-]+)\n([\s\S]*?)```(?:\n|$)/;
      const match = rule.exec(src);

      if (match) {
        const selector = match[1].trim();
        const content = match[2];
        const inputs = parseInputs(content);

        return {
          type: 'component',
          raw: match[0],
          selector,
          inputs,
        };
      }

      return undefined;
    },
    renderer(token: Tokens.Generic): string {
      const componentToken = token as ComponentToken;
      const { selector, inputs } = componentToken;

      // Encode inputs as JSON for the data attribute
      const inputsJson = escapeHtml(JSON.stringify(inputs));

      // Render a placeholder div that will be hydrated by the directive
      return `<div data-md-component="${escapeHtml(selector)}" data-md-inputs="${inputsJson}" class="md-component-placeholder"></div>\n`;
    },
  };

  return {
    extensions: [componentExtension],
  };
}

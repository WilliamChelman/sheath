import type {
  MarkedExtension,
  TokenizerAndRendererExtension,
  Tokens,
} from 'marked';
import { firstValueFrom } from 'rxjs';
import { EntityService } from '../../../services/entity.service';
import { Entity } from '../../../models';

export interface EmbedMarkedServices {
  entityService: EntityService;
  basePath: string;
}

interface EmbedToken extends Tokens.Generic {
  type: 'embed';
  raw: string;
  entityId: string;
  label: string | null;
  entity?: Entity;
}

export function createEmbedExtension(
  services: EmbedMarkedServices,
): MarkedExtension {
  const embedExtension: TokenizerAndRendererExtension = {
    name: 'embed',
    level: 'block',
    start(src: string) {
      return src.indexOf('![');
    },
    tokenizer(src: string): EmbedToken | undefined {
      // Match ![[entity-id]] or ![[entity-id|Custom Label]]
      // Must be on its own line (block-level) - check for start of line or after newline
      const rule = /^!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\n?/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'embed',
          raw: match[0],
          entityId: match[1].trim(),
          label: match[2]?.trim() || null,
        };
      }
      return undefined;
    },
    renderer(token: Tokens.Generic): string {
      const embedToken = token as EmbedToken;
      const entity = embedToken.entity;
      const entityId = embedToken.entityId;
      const label = embedToken.label;
      const isBroken = !entity;

      // Escape HTML attributes
      const escapedEntityId = entityId
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const escapedLabel = label
        ? label
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
        : '';

      // Render a placeholder div that will be hydrated with the embedded content
      const classes = ['md-embed', isBroken ? 'md-embed-broken' : '']
        .filter(Boolean)
        .join(' ');

      return `<div data-md-embed="${escapedEntityId}" data-md-embed-label="${escapedLabel}" class="${classes}"></div>\n`;
    },
  };

  return {
    extensions: [embedExtension],
    async: true,
    async walkTokens(token: Tokens.Generic): Promise<void> {
      if (token.type === 'embed') {
        const embedToken = token as EmbedToken;
        const entity$ = services.entityService.getById(embedToken.entityId);
        embedToken.entity = await firstValueFrom(entity$);
      }
    },
  };
}

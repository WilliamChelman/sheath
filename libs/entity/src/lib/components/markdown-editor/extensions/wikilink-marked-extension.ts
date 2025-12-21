import type {
  MarkedExtension,
  TokenizerAndRendererExtension,
  Tokens,
} from 'marked';
import { firstValueFrom } from 'rxjs';
import { type Entity, type EntityService } from '@/entity';

export interface WikilinkMarkedServices {
  entityService: EntityService;
  basePath: string;
}

interface WikilinkToken extends Tokens.Generic {
  type: 'wikilink';
  raw: string;
  entityId: string;
  label: string | null;
  entity?: Entity;
}

export function createWikilinkExtension(
  services: WikilinkMarkedServices,
): MarkedExtension {
  const wikilinkExtension: TokenizerAndRendererExtension = {
    name: 'wikilink',
    level: 'inline',
    start(src: string) {
      return src.indexOf('[[');
    },
    tokenizer(src: string): WikilinkToken | undefined {
      // Match [[entity-id]] or [[entity-id|Custom Label]]
      const rule = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'wikilink',
          raw: match[0],
          entityId: match[1].trim(),
          label: match[2]?.trim() || null,
        };
      }
      return undefined;
    },
    renderer(token: Tokens.Generic): string {
      const wikilinkToken = token as WikilinkToken;
      const entity = wikilinkToken.entity;
      const label =
        wikilinkToken.label || entity?.name || wikilinkToken.entityId;
      const href = `${services.basePath}/${wikilinkToken.entityId}`;
      const isBroken = !entity;

      const classes = ['wikilink', isBroken ? 'wikilink-broken' : '']
        .filter(Boolean)
        .join(' ');

      const escapedLabel = label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const escapedHref = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

      return `<a href="${escapedHref}" class="${classes}" data-entity-id="${wikilinkToken.entityId}">${escapedLabel}</a>`;
    },
  };

  return {
    extensions: [wikilinkExtension],
    async: true,
    async walkTokens(token: Tokens.Generic): Promise<void> {
      if (token.type === 'wikilink') {
        const wikilinkToken = token as WikilinkToken;
        const entity$ = services.entityService.getById(wikilinkToken.entityId);
        wikilinkToken.entity = await firstValueFrom(entity$);
      }
    },
  };
}

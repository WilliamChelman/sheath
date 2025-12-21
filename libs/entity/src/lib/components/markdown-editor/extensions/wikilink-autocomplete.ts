import { type DomainService, EntitySearchService } from '@/entity';
import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { firstValueFrom } from 'rxjs';

export interface WikilinkAutocompleteServices {
  entityService: EntitySearchService;
  domainService: DomainService;
}

function getTypeDisplayName(
  domainService: DomainService,
  typeId: string,
): string {
  const classConfig = domainService.allClassConfigs.find(
    (c) => c.id === typeId,
  );
  return classConfig?.name ?? typeId;
}

function wikilinkCompletionSource(
  services: WikilinkAutocompleteServices,
): (context: CompletionContext) => Promise<CompletionResult | null> {
  return async (
    context: CompletionContext,
  ): Promise<CompletionResult | null> => {
    // Match [[ followed by any characters except ] and |
    const word = context.matchBefore(/\[\[([^\]|]*)$/);
    if (!word) return null;

    // Extract the query (text after [[)
    const query = word.text.slice(2).toLowerCase();

    // Don't show autocomplete for empty query immediately after [[
    // unless user explicitly triggered it
    if (query === '' && !context.explicit) return null;

    // Fetch entities asynchronously
    // services.entityService.sea
    const entities = await firstValueFrom(
      services.entityService.search({ text: query }, 10),
    );

    const options: Completion[] = entities.map((e) => ({
      label: `${e.name} (${getTypeDisplayName(services.domainService, e.type)})`,
      apply: e.id,
      type: 'variable',
      detail: e.id,
      boost: e.name.toLowerCase().startsWith(query) ? 1 : 0,
    }));

    if (options.length === 0) return null;

    return {
      from: word.from + 2, // Position after [[
      options,
      filter: false, // We handle filtering ourselves
    };
  };
}

export function wikilinkAutocomplete(services: WikilinkAutocompleteServices) {
  return autocompletion({
    override: [wikilinkCompletionSource(services)],
    defaultKeymap: true,
    icons: false,
  });
}

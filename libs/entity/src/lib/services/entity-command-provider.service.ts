import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Command, CommandProvider } from '@/command-palette';
import { EntitySearchService } from './entity-search.service';

/**
 * Command provider that searches entities and creates navigation commands.
 * Automatically registers with the CommandRegistryService on construction.
 */
@Injectable({ providedIn: 'root' })
export class EntityCommandProviderService implements CommandProvider {
  readonly id = 'entity-search';
  readonly name = 'Compendium';

  private readonly entitySearch = inject(EntitySearchService);
  private readonly router = inject(Router);

  search(query: string): Observable<Command[]> {
    if (!query.trim()) {
      return new Observable((subscriber) => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    return this.entitySearch.search({ text: query }, 15).pipe(
      map((entities) =>
        entities.map((entity) => ({
          id: `entity-${entity.id}`,
          label: entity.name,
          description: entity.description ?? this.formatType(entity.type),
          icon: this.getIconForType(entity.type),
          category: this.formatType(entity.type),
          callback: (event: MouseEvent | KeyboardEvent) => {
            const commands = [`/compendium/${entity.id}`];
            // Check if Cmd (metaKey) is pressed - open in new tab
            if (event.metaKey || event.ctrlKey) {
              const urlTree = this.router.createUrlTree(commands);
              window.open(urlTree.toString(), '_blank');
            } else {
              this.router.navigate(commands);
            }
          },
        })),
      ),
    );
  }

  private formatType(type: string): string {
    // Extract the last part after dots (e.g., "Sheath.ds.monster" -> "monster")
    const lastPart = type.split('.').pop() ?? type;
    // Convert camelCase/PascalCase/kebab-case to Title Case with spaces
    return lastPart
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (str) => str.toUpperCase());
  }

  private getIconForType(type: string): string {
    // Return appropriate phosphor icon based on entity type
    const iconMap: Record<string, string> = {
      monster: 'phosphorSkull',
      ancestry: 'phosphorUsers',
      class: 'phosphorSword',
      ability: 'phosphorLightning',
      'common ability': 'phosphorLightning',
      kit: 'phosphorBackpack',
      culture: 'phosphorGlobe',
      'culture benefit': 'phosphorGlobe',
      career: 'phosphorBriefcase',
      skill: 'phosphorStar',
      perk: 'phosphorSparkle',
      title: 'phosphorCrown',
      treasure: 'phosphorTreasureChest',
      feature: 'phosphorPuzzlePiece',
      'monster feature': 'phosphorPuzzlePiece',
      condition: 'phosphorWarning',
      complication: 'phosphorWarningCircle',
      negotiation: 'phosphorHandshake',
      'motivation or pitfall': 'phosphorTarget',
      movement: 'phosphorArrowsOutCardinal',
      chapter: 'phosphorBook',
      'monster section': 'phosphorSkull',
      keywords: 'phosphorTag',
      'dynamic terrain': 'phosphorMountains',
      retainer: 'phosphorUserCircle',
    };

    // Extract the last part after dots (e.g., "Sheath.ds.monster" -> "monster")
    const lastPart = (type.split('.').pop() ?? type).toLowerCase();
    // Also try with spaces instead of camelCase
    const spacedType = lastPart
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase();

    return iconMap[lastPart] ?? iconMap[spacedType] ?? 'phosphorFile';
  }
}

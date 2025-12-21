import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Entity } from '../models/entity';
import { EntityClassPropertyConfig } from '../models/entity-class-property-config';
import { DomainService } from '../services/domain.service';

type EntityWithProperties = Entity & Record<string, unknown>;

@Component({
  selector: 'app-entity-displayed-properties',
  template: `
    @if (displayedProperties().length > 0) {
      <div class="flex flex-wrap gap-1">
        @for (prop of displayedProperties(); track prop.config.id) {
          <span class="badge badge-sm badge-outline">
            {{ prop.config.name }}: {{ prop.formattedValue }}
          </span>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDisplayedPropertiesComponent {
  private readonly domainService = inject(DomainService);

  readonly entity = input.required<Entity>();

  protected readonly displayedProperties = computed(() => {
    const entityType = this.entity().type;
    const classConfig = this.domainService.allClassConfigs.find(
      (c) => c.id === entityType,
    );
    if (!classConfig || !classConfig.displayedProperties) {
      return [];
    }

    const entityWithProps = this.entity() as EntityWithProperties;
    const properties: Array<{
      config: EntityClassPropertyConfig;
      formattedValue: string;
    }> = [];

    for (const propId of classConfig.displayedProperties) {
      const propConfig = this.domainService.allPropertyConfigs.find(
        (p) => p.id === propId,
      );
      if (!propConfig) continue;

      const value = entityWithProps[propId];
      const formattedValue = this.formatPropertyValue(propConfig, value);
      if (formattedValue !== null) {
        properties.push({ config: propConfig, formattedValue });
      }
    }

    return properties;
  });

  private formatPropertyValue(
    config: EntityClassPropertyConfig,
    value: unknown,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (config.datatype === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (config.datatype === 'number') {
      return typeof value === 'number' ? String(value) : null;
    }

    if (config.isMulti) {
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : null;
      }
      return null;
    }

    return typeof value === 'string' ? value : String(value);
  }
}

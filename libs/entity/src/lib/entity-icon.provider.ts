import { inject, provideAppInitializer } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { DomainService } from './services/domain.service';
import { entityIconRegistry } from './entity-icon.registry';

/**
 * Provides all entity icons globally from the icon registry.
 * This ensures that icons referenced in EntityClassConfig.icon are available
 * throughout the application.
 *
 * The registry should be updated whenever a new icon is added to a classConfig.
 * Icons are provided upfront from the registry, ensuring they're available
 * when components need them.
 *
 * @returns Array of providers including provideIcons with all entity icons
 */
export function provideEntityIcons() {
  return [
    // Validate that icons referenced in classConfigs exist in the registry
    provideAppInitializer(() => {
      const domainService = inject(DomainService);

      // Collect all unique icon names from classConfigs
      const iconNames = new Set<string>(['phosphorFileText']); // Always include fallback

      for (const classConfig of domainService.allClassConfigs) {
        if (classConfig.icon) {
          iconNames.add(classConfig.icon);
        }
      }

      // Validate icons exist in registry
      for (const iconName of iconNames) {
        if (!entityIconRegistry[iconName]) {
          console.warn(
            `Entity icon "${iconName}" is referenced in a classConfig but not found in entityIconRegistry. Add it to libs/entity/src/lib/entity-icon.registry.ts`,
          );
        }
      }

      return Promise.resolve();
    }),
    // Provide all icons from registry - components will select the right one
    provideIcons(entityIconRegistry as any),
  ];
}

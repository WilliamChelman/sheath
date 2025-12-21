import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorFileText } from '@ng-icons/phosphor-icons/regular';
import { DomainService } from '../services/domain.service';
import { Entity } from '../models/entity';

type IconSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-entity-icon',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorFileText })],
  template: `
    @if (entity().image) {
      <img
        [src]="entity().image"
        [alt]="entity().name"
        [class]="imageClasses()"
      />
    } @else {
      <div [class]="containerClasses()">
        <ng-icon [name]="iconName()" [class]="iconClasses()" />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityIconComponent {
  private readonly domainService = inject(DomainService);

  readonly entity = input.required<Entity>();
  readonly size = input<IconSize>('md');
  readonly containerClass = input<string>('');
  readonly iconClass = input<string>('');

  protected readonly iconName = computed(() => {
    const entityType = this.entity().type;
    const classConfig = this.domainService.allClassConfigs.find(
      (c) => c.id === entityType,
    );
    return classConfig?.icon ?? 'phosphorFileText';
  });

  protected readonly imageClasses = computed(() => {
    const sizeClasses = {
      sm: 'w-12 h-12 rounded-lg object-cover',
      md: 'w-14 h-14 rounded-lg object-cover',
      lg: 'w-16 h-16 rounded-xl object-cover',
    };
    return sizeClasses[this.size()];
  });

  protected readonly containerClasses = computed(() => {
    const sizeClasses = {
      sm: 'w-12 h-12 rounded-lg bg-base-200 flex items-center justify-center',
      md: 'w-14 h-14 rounded-lg bg-base-200 flex items-center justify-center',
      lg: 'w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center',
    };
    const baseClasses = sizeClasses[this.size()];
    const additionalClasses = this.containerClass();
    return additionalClasses
      ? `${baseClasses} ${additionalClasses}`
      : baseClasses;
  });

  protected readonly iconClasses = computed(() => {
    const sizeClasses = {
      sm: 'text-2xl text-base-content/40',
      md: 'text-3xl text-base-content/40',
      lg: 'text-4xl text-primary',
    };
    const baseClasses = sizeClasses[this.size()];
    const additionalClasses = this.iconClass();
    return additionalClasses
      ? `${baseClasses} ${additionalClasses}`
      : baseClasses;
  });
}


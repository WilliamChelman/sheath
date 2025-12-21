import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  DomainService,
  type Entity,
  type EntityClassPropertyConfig,
} from '@/entity';
import { I18nService } from '@/i18n';
import {
  MarkdownEditorComponent,
  NumberInputComponent,
  TagInputComponent,
  TextareaComponent,
  TextInputComponent,
  ToggleComponent,
} from '@/ui/forms';
import { compendiumBundle } from '../compendium.i18n';

type EntityWithProperties = Entity & Record<string, unknown>;

type FieldType = 'string' | 'number' | 'boolean' | 'multi-string';

interface PropertyField {
  config: EntityClassPropertyConfig;
  fieldType: FieldType;
  stringSignal?: WritableSignal<string>;
  numberSignal?: WritableSignal<number | null>;
  booleanSignal?: WritableSignal<boolean>;
  arraySignal?: WritableSignal<string[]>;
}

@Component({
  selector: 'app-entity-edit-form',
  imports: [
    TextInputComponent,
    TextareaComponent,
    TagInputComponent,
    MarkdownEditorComponent,
    NumberInputComponent,
    ToggleComponent,
  ],
  template: `
    <form class="space-y-6" (ngSubmit)="onSubmit($event)">
      <!-- Core Entity Fields -->
      <div class="space-y-4">
        <h3 class="font-semibold text-lg">{{ t('edit.coreFields') }}</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-text-input
            [label]="t('edit.nameLabel')"
            [(value)]="formName"
            [disabled]="isSaving()"
          />
          <app-text-input
            [label]="t('edit.typeLabel')"
            [value]="entity().type"
            [disabled]="true"
          />
        </div>

        <app-textarea
          [label]="t('edit.descriptionLabel')"
          [(value)]="formDescription"
          [rows]="3"
          [disabled]="isSaving()"
        />

        <app-tag-input
          [label]="t('edit.tagsLabel')"
          [(values)]="formTags"
          [placeholder]="t('edit.tagsPlaceholder')"
          [disabled]="isSaving()"
        />
      </div>

      <!-- Dynamic Properties Section -->
      @if (propertyFields().length > 0) {
        <div class="space-y-4">
          <div class="divider">{{ t('edit.propertiesSection') }}</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (field of propertyFields(); track field.config.id) {
              @switch (field.fieldType) {
                @case ('number') {
                  <app-number-input
                    [label]="field.config.name"
                    [helperText]="field.config.description ?? null"
                    [disabled]="isSaving()"
                    [(value)]="field.numberSignal!"
                  />
                }
                @case ('boolean') {
                  <app-toggle
                    [label]="field.config.name"
                    [disabled]="isSaving()"
                    [(checked)]="field.booleanSignal!"
                  />
                }
                @case ('multi-string') {
                  <app-tag-input
                    [label]="field.config.name"
                    [helperText]="field.config.description ?? null"
                    [disabled]="isSaving()"
                    [(values)]="field.arraySignal!"
                  />
                }
                @default {
                  <app-text-input
                    [label]="field.config.name"
                    [helperText]="field.config.description ?? null"
                    [disabled]="isSaving()"
                    [(value)]="field.stringSignal!"
                  />
                }
              }
            }
          </div>
        </div>
      }

      <!-- Content Markdown Editor -->
      <div class="space-y-4">
        <div class="divider">{{ t('edit.contentSection') }}</div>
        <app-markdown-editor
          [label]="t('edit.contentLabel')"
          [(value)]="formContent"
          [disabled]="isSaving()"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 pt-4 border-t border-base-300">
        <button
          type="button"
          class="btn btn-ghost"
          (click)="onCancel()"
          [disabled]="isSaving()"
        >
          {{ t('edit.cancelButton') }}
        </button>
        <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
          @if (isSaving()) {
            <span class="loading loading-spinner loading-sm"></span>
          }
          {{ t('edit.saveButton') }}
        </button>
      </div>
    </form>
  `,
})
export class EntityEditFormComponent implements OnInit {
  private readonly domainService = inject(DomainService);
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  entity = input.required<Entity>();
  isSaving = input(false);

  save = output<Partial<Entity>>();
  cancel = output<void>();

  // Form state signals
  protected formName = signal('');
  protected formDescription = signal('');
  protected formTags = signal<string[]>([]);
  protected formContent = signal('');

  // Property fields with their signals
  protected propertyFields = signal<PropertyField[]>([]);

  private propertyConfigs = computed(() => {
    const entityType = this.entity().type;
    const classConfig = this.domainService.allClassConfigs.find(
      (c) => c.id === entityType,
    );
    if (!classConfig) return [];

    return classConfig.properties
      .map((propId) =>
        this.domainService.allPropertyConfigs.find((p) => p.id === propId),
      )
      .filter((p): p is EntityClassPropertyConfig => p !== undefined);
  });

  constructor() {
    // Initialize form when entity changes
    effect(() => {
      this.initFormData(this.entity());
    });
  }

  ngOnInit(): void {
    this.initFormData(this.entity());
  }

  private initFormData(e: Entity): void {
    const entityWithProps = e as EntityWithProperties;

    this.formName.set(e.name);
    this.formDescription.set(e.description ?? '');
    this.formTags.set([...(e.tags ?? [])]);
    this.formContent.set(e.content ?? '');

    // Build property fields with signals
    const fields: PropertyField[] = [];

    for (const config of this.propertyConfigs()) {
      const value = entityWithProps[config.id];
      const fieldType = this.getPropertyFieldType(config);

      const field: PropertyField = { config, fieldType };

      switch (fieldType) {
        case 'number': {
          const numValue = typeof value === 'number' ? value : null;
          field.numberSignal = signal(numValue);
          break;
        }
        case 'boolean': {
          const boolValue = Boolean(value);
          field.booleanSignal = signal(boolValue);
          break;
        }
        case 'multi-string': {
          const arrValue = Array.isArray(value) ? [...value] : [];
          field.arraySignal = signal(arrValue);
          break;
        }
        default: {
          const strValue = typeof value === 'string' ? value : '';
          field.stringSignal = signal(strValue);
          break;
        }
      }

      fields.push(field);
    }

    this.propertyFields.set(fields);
  }

  private getPropertyFieldType(config: EntityClassPropertyConfig): FieldType {
    if (config.datatype === 'boolean') return 'boolean';
    if (config.datatype === 'number') return 'number';
    if (config.isMulti) return 'multi-string';
    return 'string';
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const updates: Partial<Entity> & Record<string, unknown> = {
      name: this.formName(),
      description: this.formDescription() || undefined,
      tags: this.formTags().length > 0 ? this.formTags() : undefined,
      content: this.formContent() || undefined,
    };

    // Add property values from signals
    for (const field of this.propertyFields()) {
      let value: unknown;

      switch (field.fieldType) {
        case 'number':
          value = field.numberSignal?.();
          break;
        case 'boolean':
          value = field.booleanSignal?.();
          break;
        case 'multi-string':
          value = field.arraySignal?.();
          break;
        default:
          value = field.stringSignal?.();
          break;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) {
          continue;
        }
        updates[field.config.id] = value;
      }
    }

    this.save.emit(updates);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

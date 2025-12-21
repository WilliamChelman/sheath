import {
  DomainService,
  type Entity,
  type EntityClassPropertyConfig,
} from '@/entity';
import { I18nService } from '@/i18n';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretDown,
  phosphorCaretUp,
  phosphorListBullets,
  phosphorGridFour,
  phosphorTable,
} from '@ng-icons/phosphor-icons/regular';
import { compendiumBundle } from '../../compendium.i18n';
import { EditorModeService } from '../../services/editor-mode.service';
import {
  CodeMirrorEditorComponent,
  type SelectionInfo,
} from './codemirror-editor.component';
import { EditorTocComponent } from './editor-toc.component';
import { FloatingToolbarComponent } from './floating-toolbar.component';
import { InlineMetadataComponent } from './inline-metadata.component';
import { MarkdownPreviewComponent } from './markdown-preview.component';
import {
  PropertiesPanelComponent,
  type PropertyField,
} from './properties-panel.component';

type EntityWithProperties = Entity & Record<string, unknown>;
type FieldType = 'string' | 'number' | 'boolean' | 'multi-string';

@Component({
  selector: 'app-markdown-editor',
  imports: [
    NgIcon,
    CodeMirrorEditorComponent,
    InlineMetadataComponent,
    FloatingToolbarComponent,
    MarkdownPreviewComponent,
    EditorTocComponent,
    PropertiesPanelComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorGridFour,
      phosphorTable,
      phosphorListBullets,
      phosphorCaretDown,
      phosphorCaretUp,
    }),
  ],
  template: `
    <div class="markdown-editor flex flex-col h-full min-h-[600px]">
      <!-- Top Bar: Mode Toggle + Actions -->
      <header
        class="editor-toolbar flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50"
      >
        <div class="flex items-center gap-2">
          <!-- Mode Toggle -->
          <div class="join">
            <button
              type="button"
              class="join-item btn btn-sm"
              [class.btn-active]="editorModeService.mode() === 'live-preview'"
              (click)="editorModeService.setMode('live-preview')"
              [title]="t('editor.livePreview')"
            >
              <ng-icon name="phosphorGridFour" class="text-lg" />
            </button>
            <button
              type="button"
              class="join-item btn btn-sm"
              [class.btn-active]="editorModeService.mode() === 'split-view'"
              (click)="editorModeService.setMode('split-view')"
              [title]="t('editor.splitView')"
            >
              <ng-icon name="phosphorTable" class="text-lg" />
            </button>
          </div>

          <!-- TOC Toggle -->
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            [class.btn-active]="editorModeService.tocVisible()"
            (click)="editorModeService.toggleToc()"
            [title]="t('editor.toggleToc')"
          >
            <ng-icon name="phosphorListBullets" class="text-lg" />
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            [disabled]="isSaving()"
            (click)="onCancel()"
          >
            {{ t('edit.cancelButton') }}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            [disabled]="isSaving()"
            (click)="onSave()"
          >
            @if (isSaving()) {
              <span class="loading loading-spinner loading-xs"></span>
            }
            {{ t('edit.saveButton') }}
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="editor-main flex flex-1 overflow-hidden">
        <!-- TOC Sidebar -->
        @if (editorModeService.tocVisible()) {
          <aside
            class="hidden lg:block w-56 shrink-0 border-r border-base-300 overflow-y-auto"
          >
            <app-editor-toc
              [content]="formContent()"
              (navigate)="scrollToHeading($event)"
            />
          </aside>
        }

        <!-- Editor Content -->
        <main class="editor-content flex-1 flex flex-col overflow-hidden">
          <!-- Inline Metadata -->
          <app-inline-metadata
            [entityType]="entity().type"
            [(name)]="formName"
            [(description)]="formDescription"
            [(tags)]="formTags"
          />

          <!-- Properties Panel (Collapsible) -->
          @if (propertyFields().length > 0) {
            <app-properties-panel
              [fields]="propertyFields()"
              [expanded]="editorModeService.propertiesExpanded()"
              (expandedChange)="editorModeService.toggleProperties()"
            />
          }

          <!-- Editor Area -->
          <div class="flex-1 flex overflow-hidden min-h-[400px]">
            @if (editorModeService.mode() === 'split-view') {
              <!-- Split View -->
              <div class="flex-1 overflow-auto border-r border-base-300">
                <app-codemirror-editor
                  #editorRef
                  [(value)]="formContent"
                  [livePreview]="false"
                  [placeholder]="t('editor.placeholder')"
                  (selectionChange)="onSelectionChange($event)"
                />
              </div>
              <div class="flex-1 overflow-auto">
                <app-markdown-preview [content]="formContent()" />
              </div>
            } @else {
              <!-- Live Preview Mode -->
              <div class="flex-1 overflow-auto">
                <app-codemirror-editor
                  #editorRef
                  [(value)]="formContent"
                  [livePreview]="true"
                  [placeholder]="t('editor.placeholder')"
                  (selectionChange)="onSelectionChange($event)"
                />
              </div>
            }
          </div>
        </main>
      </div>

      <!-- Floating Toolbar -->
      <app-floating-toolbar
        [selection]="currentSelection()"
        (format)="applyFormat($event)"
      />
    </div>
  `,
  styles: `
    app-markdown-editor {
      display: block;
      height: 100%;
    }

    .markdown-editor {
      background: var(--color-base-100);
    }

    .editor-toolbar {
      backdrop-filter: blur(8px);
    }

    .editor-content {
      background: var(--color-base-100);
    }
  `,
})
export class MarkdownEditorComponent implements OnInit {
  protected readonly editorModeService = inject(EditorModeService);
  private readonly domainService = inject(DomainService);
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  entity = input.required<Entity>();
  isSaving = input(false);

  save = output<Partial<Entity>>();
  cancelEdit = output<void>();

  // Form state signals
  protected formName = signal('');
  protected formDescription = signal('');
  protected formTags = signal<string[]>([]);
  protected formContent = signal('');

  // Selection for floating toolbar
  protected currentSelection = signal<SelectionInfo | null>(null);

  // Property fields with their signals
  protected propertyFields = signal<PropertyField[]>([]);

  private editorRef = viewChild<CodeMirrorEditorComponent>('editorRef');

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

  protected onSelectionChange(selection: SelectionInfo | null): void {
    this.currentSelection.set(selection);
  }

  protected applyFormat(
    format: 'bold' | 'italic' | 'heading' | 'link' | 'code' | 'quote',
  ): void {
    this.editorRef()?.applyFormat(format);
  }

  protected scrollToHeading(id: string): void {
    // For live preview mode, we need to scroll within the editor
    // This is a simplified implementation - full sync would require more work
    const content = this.formContent();
    const lines = content.split('\n');
    let targetLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^#+\s+(.+)$/);
      if (match) {
        const headingId = match[1]
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
        if (headingId === id) {
          targetLine = i;
          break;
        }
      }
    }

    // TODO: Implement scrolling to line in CodeMirror
    console.log('Scroll to heading:', id, 'at line:', targetLine);
  }

  protected onSave(): void {
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

  protected onCancel(): void {
    this.cancelEdit.emit();
  }
}

import { EntityService, type Entity } from '@/entity';
import { I18nService } from '@/i18n';
import { ToastService } from '@/ui/toast';
import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft } from '@ng-icons/heroicons/outline';
import { Subscription } from 'rxjs';
import { compendiumBundle } from './compendium.i18n';
import { CompendiumEmptyStateComponent } from './components/compendium-empty-state.component';
import { CompendiumTocComponent } from './components/compendium-toc.component';
import { EntityDetailHeaderComponent } from './components/entity-detail-header.component';
import { EntityMetadataComponent } from './components/entity-metadata.component';
import { EntityTagsComponent } from './components/entity-tags.component';
import { MarkdownPreviewComponent } from './components/obsidian-editor/markdown-preview.component';
import { ObsidianEditorComponent } from './components/obsidian-editor/obsidian-editor.component';
import { EntityRendererService } from './services/entity-renderer.service';

@Component({
  selector: 'app-compendium-detail-view',
  imports: [
    NgComponentOutlet,
    NgIcon,
    RouterLink,
    CompendiumTocComponent,
    CompendiumEmptyStateComponent,
    EntityDetailHeaderComponent,
    EntityMetadataComponent,
    EntityTagsComponent,
    MarkdownPreviewComponent,
    ObsidianEditorComponent,
  ],
  viewProviders: [provideIcons({ heroArrowLeft })],
  template: `
    @if (isEditing() && entity(); as entity) {
      <!-- Full-screen Edit Mode -->
      <div class="h-screen flex flex-col bg-base-100">
        <!-- Minimal back link -->
        <div class="px-4 py-2 border-b border-base-300 bg-base-200/50">
          <a
            routerLink=".."
            class="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors group"
          >
            <ng-icon
              name="heroArrowLeft"
              class="text-base group-hover:-translate-x-1 transition-transform"
            />
            <span>{{ t('detail.backToList') }}</span>
          </a>
        </div>

        <!-- Custom or Default Editor -->
        <div class="flex-1 overflow-hidden">
          @if (customEditorComponent(); as editorComponent) {
            <ng-container
              *ngComponentOutlet="editorComponent; inputs: editorInputs()"
            />
          } @else {
            <app-obsidian-editor
              [entity]="entity"
              [isSaving]="isSaving()"
              (save)="handleSave($event)"
              (cancel)="handleCancel()"
            />
          }
        </div>
      </div>
    } @else {
      <!-- View Mode -->
      <div
        class="min-h-screen bg-linear-to-br from-base-300 via-base-100 to-base-200"
      >
        <div class="container mx-auto px-4 py-8 max-w-7xl">
          <!-- Back Link -->
          <a
            routerLink=".."
            class="inline-flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors mb-6 group"
          >
            <ng-icon
              name="heroArrowLeft"
              class="text-lg group-hover:-translate-x-1 transition-transform"
            />
            <span>{{ t('detail.backToList') }}</span>
          </a>

          @if (isLoading()) {
            <div class="flex flex-col items-center justify-center py-16">
              <span
                class="loading loading-spinner loading-lg text-primary"
              ></span>
              <p class="mt-4 text-base-content/60">{{ t('detail.loading') }}</p>
            </div>
          } @else {
            @if (entity(); as entity) {
              <div class="flex gap-8">
                <!-- Main Content -->
                <article
                  class="flex-1 min-w-0 bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-2xl overflow-hidden"
                >
                  <!-- Header -->
                  <app-entity-detail-header
                    [entity]="entity"
                    [isEditing]="isEditing()"
                    (editClick)="toggleEdit()"
                    (deleteClick)="showDeleteConfirm()"
                  />

                  <!-- Description -->
                  @if (entity.description) {
                    <div class="px-6 pt-4">
                      <p class="text-base-content/70">
                        {{ entity.description }}
                      </p>
                    </div>
                  }

                  <!-- Tags -->
                  @if (entity.tags && entity.tags.length > 0) {
                    <app-entity-tags [tags]="entity.tags" />
                  }

                  <!-- Rendered Content -->
                  @if (customViewerComponent(); as viewerComponent) {
                    <div class="divider px-6"></div>
                    <div class="px-6 pb-6">
                      <ng-container
                        *ngComponentOutlet="
                          viewerComponent;
                          inputs: viewerInputs()
                        "
                      />
                    </div>
                  } @else if (entity.content) {
                    <div class="divider px-6"></div>
                    <app-markdown-preview
                      #contentPreview
                      [content]="entity.content"
                      [displayName]="entity.name"
                      [entity]="entity"
                      [showPlaceholder]="false"
                    />
                  }

                  <!-- Metadata -->
                  <div class="divider px-6"></div>
                  <app-entity-metadata
                    [createdAt]="entity.createdAt"
                    [updatedAt]="entity.updatedAt"
                  />
                </article>

                <!-- Floating TOC (visible on xl screens) -->
                @if (tocEntries().length > 1) {
                  <aside class="hidden xl:block w-64 shrink-0">
                    <app-compendium-toc
                      [entries]="tocEntries()"
                      [title]="t('detail.tableOfContents')"
                    />
                  </aside>
                }
              </div>
            } @else {
              <app-compendium-empty-state
                icon="heroDocument"
                [title]="t('detail.notFound')"
                [description]="t('detail.notFoundDescription')"
              />
            }
          }
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <dialog #deleteDialog class="modal">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg">{{ t('delete.confirmTitle') }}</h3>
        <p class="py-4 text-base-content/70">
          {{ t('delete.confirmMessage', { name: entity()?.name ?? '' }) }}
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" (click)="cancelDelete()">
            {{ t('delete.cancelButton') }}
          </button>
          <button
            class="btn btn-error"
            [disabled]="isDeleting()"
            (click)="confirmDelete()"
          >
            @if (isDeleting()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            {{ t('delete.confirmButton') }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="cancelDelete()">close</button>
      </form>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumDetailView implements OnInit, OnDestroy {
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly entityService = inject(EntityService);
  private readonly toastService = inject(ToastService);
  private readonly rendererService = inject(EntityRendererService);

  protected readonly t = this.i18n.useBundleT(compendiumBundle);
  protected readonly isLoading = signal(false);
  protected readonly isEditing = signal(
    this.route.snapshot.queryParamMap.get('edit') === 'true',
  );
  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);

  private readonly entityId = signal(this.route.snapshot.paramMap.get('id'));

  private readonly entitiesMap = toSignal(this.entityService.entitiesMap$, {
    initialValue: new Map(),
  });

  private readonly contentPreview =
    viewChild<MarkdownPreviewComponent>('contentPreview');
  private readonly deleteDialog =
    viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  private subscription?: Subscription;

  /** Custom renderer for the current entity type, if registered */
  private readonly customRenderer = computed(() => {
    const ent = this.entity();
    return ent ? this.rendererService.getRenderer(ent.type) : undefined;
  });

  /** Custom viewer component, if a renderer is registered for this entity type */
  protected readonly customViewerComponent = computed(
    () => this.customRenderer()?.viewerComponent,
  );

  /** Custom editor component, if a renderer is registered for this entity type */
  protected readonly customEditorComponent = computed(
    () => this.customRenderer()?.editorComponent,
  );

  /** Inputs for the custom viewer component */
  protected readonly viewerInputs = computed(() => ({
    entity: this.entity(),
  }));

  /** Inputs for the custom editor component */
  protected readonly editorInputs = computed(() => ({
    entity: this.entity(),
    isSaving: this.isSaving(),
    save: (updates: Partial<Entity>) => this.handleSave(updates),
    cancel: () => this.handleCancel(),
  }));

  ngOnInit(): void {
    // Subscribe to query param changes to sync edit state
    this.subscription = this.route.queryParamMap.subscribe((params) => {
      const editParam = params.get('edit') === 'true';
      if (this.isEditing() !== editParam) {
        this.isEditing.set(editParam);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected readonly entity = computed(() => {
    const id = this.entityId();
    if (!id) return undefined;
    return this.entitiesMap().get(id);
  });

  /** TOC entries from the markdown preview component */
  protected readonly tocEntries = computed(() => {
    return this.contentPreview()?.tocEntries() ?? [];
  });

  protected toggleEdit(): void {
    const newEditState = !this.isEditing();
    this.updateEditQueryParam(newEditState);
  }

  protected handleSave(updates: Partial<Entity>): void {
    const entity = this.entity();
    if (!entity) return;

    this.isSaving.set(true);

    this.entityService.update(entity.id, updates).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.updateEditQueryParam(false);
        this.toastService.success(this.t('edit.saveSuccess'));
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error(this.t('edit.saveError'));
        console.error('Failed to save entity:', err);
      },
    });
  }

  protected handleCancel(): void {
    this.updateEditQueryParam(false);
  }

  private updateEditQueryParam(edit: boolean): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: edit ? { edit: 'true' } : {},
      queryParamsHandling: edit ? 'merge' : '',
      replaceUrl: true,
    });
  }

  protected showDeleteConfirm(): void {
    this.deleteDialog()?.nativeElement.showModal();
  }

  protected cancelDelete(): void {
    this.deleteDialog()?.nativeElement.close();
  }

  protected confirmDelete(): void {
    const entity = this.entity();
    if (!entity) return;

    this.isDeleting.set(true);

    this.entityService.delete(entity.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialog()?.nativeElement.close();
        this.toastService.success(this.t('delete.success'));
        this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toastService.error(this.t('delete.error'));
        console.error('Failed to delete entity:', err);
      },
    });
  }
}

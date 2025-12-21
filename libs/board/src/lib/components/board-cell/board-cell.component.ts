import { Entity, EntityService, MarkdownRenderer } from '@/entity';
import { I18nService } from '@/i18n';
import {
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretDown,
  phosphorCaretLeft,
  phosphorCaretRight,
  phosphorCaretUp,
  phosphorPencilSimple,
  phosphorTrashSimple,
} from '@ng-icons/phosphor-icons/regular';
import { of, switchMap } from 'rxjs';
import { boardBundle } from '../../board.i18n';
import { BoardCell } from '../../models/board.model';

@Component({
  selector: 'lib-board-cell',
  imports: [NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      phosphorPencilSimple,
      phosphorTrashSimple,
      phosphorCaretUp,
      phosphorCaretDown,
      phosphorCaretLeft,
      phosphorCaretRight,
    }),
  ],
  template: `
    <div
      class="board-cell card bg-base-100 h-full relative"
      [class.shadow-sm]="!readonly()"
      [class.hover:shadow-md]="!readonly()"
      [class.border]="!readonly()"
      [class.border-base-300]="!readonly()"
      [class.border-primary]="!readonly() && isHovered()"
      (mouseenter)="isHovered.set(true)"
      (mouseleave)="isHovered.set(false)"
    >
      <div class="card-body p-3">
        @if (cell().entityRef) {
          @if (resolvedEntity(); as entity) {
            <div class="entity-content">
              @if (entity.image) {
                <img
                  [src]="entity.image"
                  [alt]="entity.name"
                  class="w-full h-32 object-cover rounded-lg mb-2"
                />
              }
              <a
                [routerLink]="['/compendium', entity.id]"
                class="link link-secondary text-sm font-medium"
              >
                {{ entity.name }}
              </a>
              @if (entity.description) {
                <p class="text-base-content/70 text-xs mt-1">
                  {{ entity.description }}
                </p>
              }
              @if (entity.content) {
                <div
                  #entityContentContainer
                  class="markdown-content markdown-content-compact mt-2"
                ></div>
              }
            </div>
          } @else {
            <span class="text-error text-sm">[[{{ cell().entityRef }}]]</span>
          }
        }

        @if (cell().content) {
          <div
            #cellContentContainer
            class="markdown-content markdown-content-compact"
          ></div>
        }

        @if (!cell().content && !cell().entityRef) {
          <div class="text-base-content/30 text-sm italic">{{ t('emptyCell') }}</div>
        }

        @if (!readonly() && isHovered()) {
          <div class="absolute top-1 right-1 flex gap-1">
            <button
              class="btn btn-ghost btn-xs"
              (click)="edit.emit(); $event.stopPropagation()"
            >
              <ng-icon name="phosphorPencilSimple" class="text-sm" />
            </button>
            <button
              class="btn btn-ghost btn-xs text-error"
              (click)="deleteCell.emit(); $event.stopPropagation()"
            >
              <ng-icon name="phosphorTrashSimple" class="text-sm" />
            </button>
          </div>

          <div class="absolute bottom-1 right-1 flex gap-1">
            <div class="join join-vertical">
              <button
                class="btn btn-ghost btn-xs join-item"
                [title]="t('expandRowSpan')"
                (click)="expandRowSpan(); $event.stopPropagation()"
              >
                <ng-icon name="phosphorCaretDown" class="text-xs" />
              </button>
              <button
                class="btn btn-ghost btn-xs join-item"
                [title]="t('shrinkRowSpan')"
                [disabled]="cell().rowSpan <= 1"
                (click)="shrinkRowSpan(); $event.stopPropagation()"
              >
                <ng-icon name="phosphorCaretUp" class="text-xs" />
              </button>
            </div>
            <div class="join">
              <button
                class="btn btn-ghost btn-xs join-item"
                [title]="t('shrinkColSpan')"
                [disabled]="cell().colSpan <= 1"
                (click)="shrinkColSpan(); $event.stopPropagation()"
              >
                <ng-icon name="phosphorCaretLeft" class="text-xs" />
              </button>
              <button
                class="btn btn-ghost btn-xs join-item"
                [title]="t('expandColSpan')"
                (click)="expandColSpan(); $event.stopPropagation()"
              >
                <ng-icon name="phosphorCaretRight" class="text-xs" />
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    @reference '../../../../../ui/src/tailwind.css';

    lib-board-cell {
      display: block;
      height: 100%;
    }

    lib-board-cell .board-cell {
      transition: all 0.15s ease-in-out;
    }

    /* Compact variant for board cells */
    lib-board-cell .markdown-content-compact {
      @apply text-sm;
    }

    lib-board-cell .markdown-content-compact p {
      @apply my-1;
    }

    lib-board-cell .markdown-content-compact h1,
    lib-board-cell .markdown-content-compact h2,
    lib-board-cell .markdown-content-compact h3,
    lib-board-cell .markdown-content-compact h4,
    lib-board-cell .markdown-content-compact h5,
    lib-board-cell .markdown-content-compact h6 {
      @apply mt-2 mb-1;
    }
  `,
})
export class BoardCellComponent {
  private readonly entityService = inject(EntityService);
  private readonly renderer = inject(MarkdownRenderer);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(boardBundle);

  // Use signal-based viewChild queries - they're reactive and update when elements appear
  private readonly cellContentContainer = viewChild<ElementRef<HTMLElement>>(
    'cellContentContainer',
  );
  private readonly entityContentContainer = viewChild<ElementRef<HTMLElement>>(
    'entityContentContainer',
  );

  cell = input.required<BoardCell>();
  readonly = input(true);

  edit = output<void>();
  deleteCell = output<void>();
  spanChange = output<{ rowSpan: number; colSpan: number }>();

  protected isHovered = signal(false);

  private entityRef$ = toObservable(computed(() => this.cell().entityRef));

  protected resolvedEntity = toSignal<Entity | undefined>(
    this.entityRef$.pipe(
      switchMap((entityId) =>
        entityId ? this.entityService.getById(entityId) : of(undefined),
      ),
    ),
  );

  // Track component refs for cleanup
  private cellContentRefs: ComponentRef<unknown>[] = [];
  private entityContentRefs: ComponentRef<unknown>[] = [];
  private cellCleanupHoverHandlers?: () => void;
  private entityCleanupHoverHandlers?: () => void;

  constructor() {
    // Register cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.cleanupCellContent();
      this.cleanupEntityContent();
    });

    // Effect to render cell content when it changes
    // Uses signal-based viewChild which is reactive
    effect(() => {
      const content = this.cell().content;
      const container = this.cellContentContainer();

      if (content && container) {
        this.renderCellContent(content, container.nativeElement);
      } else {
        this.cleanupCellContent();
      }
    });

    // Effect to render entity content when it changes
    effect(() => {
      const entity = this.resolvedEntity();
      const content = entity?.content;
      const container = this.entityContentContainer();

      if (content && container) {
        this.renderEntityContent(content, container.nativeElement, entity);
      } else {
        this.cleanupEntityContent();
      }
    });
  }

  private async renderCellContent(
    content: string,
    element: HTMLElement,
  ): Promise<void> {
    // Cleanup previous components before re-rendering
    this.cleanupCellContent();

    const result = await this.renderer.renderContent(
      content,
      element,
      this.viewContainerRef,
    );

    this.cellContentRefs = result.componentRefs;
    this.cellCleanupHoverHandlers = result.cleanupHoverHandlers;
  }

  private async renderEntityContent(
    content: string,
    element: HTMLElement,
    entity?: Entity,
  ): Promise<void> {
    // Cleanup previous components before re-rendering
    this.cleanupEntityContent();

    const result = await this.renderer.renderContent(
      content,
      element,
      this.viewContainerRef,
      entity,
    );

    this.entityContentRefs = result.componentRefs;
    this.entityCleanupHoverHandlers = result.cleanupHoverHandlers;
  }

  private cleanupCellContent(): void {
    this.cellCleanupHoverHandlers?.();
    this.cellCleanupHoverHandlers = undefined;
    this.cellContentRefs.forEach((ref) => ref.destroy());
    this.cellContentRefs = [];
  }

  private cleanupEntityContent(): void {
    this.entityCleanupHoverHandlers?.();
    this.entityCleanupHoverHandlers = undefined;
    this.entityContentRefs.forEach((ref) => ref.destroy());
    this.entityContentRefs = [];
  }

  protected expandRowSpan(): void {
    const c = this.cell();
    this.spanChange.emit({ rowSpan: c.rowSpan + 1, colSpan: c.colSpan });
  }

  protected shrinkRowSpan(): void {
    const c = this.cell();
    if (c.rowSpan > 1) {
      this.spanChange.emit({ rowSpan: c.rowSpan - 1, colSpan: c.colSpan });
    }
  }

  protected expandColSpan(): void {
    const c = this.cell();
    this.spanChange.emit({ rowSpan: c.rowSpan, colSpan: c.colSpan + 1 });
  }

  protected shrinkColSpan(): void {
    const c = this.cell();
    if (c.colSpan > 1) {
      this.spanChange.emit({ rowSpan: c.rowSpan, colSpan: c.colSpan - 1 });
    }
  }
}

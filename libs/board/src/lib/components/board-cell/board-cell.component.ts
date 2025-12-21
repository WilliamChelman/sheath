import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPencil,
  heroTrash,
  heroChevronUp,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
} from '@ng-icons/heroicons/outline';
import { Entity, EntityService, MarkdownService } from '@/entity';
import { of, switchMap } from 'rxjs';
import { BoardCell } from '../../models/board.model';

@Component({
  selector: 'lib-board-cell',
  imports: [NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      heroPencil,
      heroTrash,
      heroChevronUp,
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
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
                  class="markdown-content markdown-content-compact mt-2"
                  [innerHTML]="renderedEntityContent()"
                ></div>
              }
            </div>
          } @else {
            <span class="text-error text-sm">[[{{ cell().entityRef }}]]</span>
          }
        }

        @if (cell().content) {
          <div
            class="markdown-content markdown-content-compact"
            [innerHTML]="renderedContent()"
          ></div>
        }

        @if (!cell().content && !cell().entityRef) {
          <div class="text-base-content/30 text-sm italic">Empty cell</div>
        }

        @if (!readonly() && isHovered()) {
          <div class="absolute top-1 right-1 flex gap-1">
            <button
              class="btn btn-ghost btn-xs"
              (click)="edit.emit(); $event.stopPropagation()"
            >
              <ng-icon name="heroPencil" class="text-sm" />
            </button>
            <button
              class="btn btn-ghost btn-xs text-error"
              (click)="deleteCell.emit(); $event.stopPropagation()"
            >
              <ng-icon name="heroTrash" class="text-sm" />
            </button>
          </div>

          <div class="absolute bottom-1 right-1 flex gap-1">
            <div class="join join-vertical">
              <button
                class="btn btn-ghost btn-xs join-item"
                title="Expand row span"
                (click)="expandRowSpan(); $event.stopPropagation()"
              >
                <ng-icon name="heroChevronDown" class="text-xs" />
              </button>
              <button
                class="btn btn-ghost btn-xs join-item"
                title="Shrink row span"
                [disabled]="cell().rowSpan <= 1"
                (click)="shrinkRowSpan(); $event.stopPropagation()"
              >
                <ng-icon name="heroChevronUp" class="text-xs" />
              </button>
            </div>
            <div class="join">
              <button
                class="btn btn-ghost btn-xs join-item"
                title="Shrink column span"
                [disabled]="cell().colSpan <= 1"
                (click)="shrinkColSpan(); $event.stopPropagation()"
              >
                <ng-icon name="heroChevronLeft" class="text-xs" />
              </button>
              <button
                class="btn btn-ghost btn-xs join-item"
                title="Expand column span"
                (click)="expandColSpan(); $event.stopPropagation()"
              >
                <ng-icon name="heroChevronRight" class="text-xs" />
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
  private readonly sanitizer = inject(DomSanitizer);
  private readonly markdownService = inject(MarkdownService);

  cell = input.required<BoardCell>();
  readonly = input(true);

  edit = output<void>();
  deleteCell = output<void>();
  spanChange = output<{ rowSpan: number; colSpan: number }>();

  protected isHovered = signal(false);
  private renderedHtml = signal('');

  private entityRef$ = toObservable(computed(() => this.cell().entityRef));

  protected resolvedEntity = toSignal<Entity | undefined>(
    this.entityRef$.pipe(
      switchMap((entityId) =>
        entityId ? this.entityService.getById(entityId) : of(undefined),
      ),
    ),
  );

  protected renderedContent = computed((): SafeHtml => {
    return this.sanitizer.bypassSecurityTrustHtml(this.renderedHtml());
  });

  protected renderedEntityContent = computed((): SafeHtml => {
    return this.sanitizer.bypassSecurityTrustHtml(this.renderedEntityHtml());
  });

  private renderedEntityHtml = signal('');

  constructor() {
    effect(() => {
      const content = this.cell().content;
      if (content) {
        this.renderMarkdown(content);
      } else {
        this.renderedHtml.set('');
      }
    });

    effect(() => {
      const entity = this.resolvedEntity();
      if (entity?.content) {
        this.renderEntityMarkdown(entity.content);
      } else {
        this.renderedEntityHtml.set('');
      }
    });
  }

  private async renderMarkdown(content: string): Promise<void> {
    const html = await this.markdownService.render(content);
    this.renderedHtml.set(html);
  }

  private async renderEntityMarkdown(content: string): Promise<void> {
    const html = await this.markdownService.render(content);
    this.renderedEntityHtml.set(html);
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

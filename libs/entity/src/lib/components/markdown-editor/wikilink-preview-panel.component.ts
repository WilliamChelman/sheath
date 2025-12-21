import {
  Component,
  ComponentRef,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { Entity } from '../../models/entity';
import { MarkdownRenderer } from '../../services/markdown-renderer.service';

@Component({
  selector: 'app-wikilink-preview-panel',
  template: `
    <div
      class="fixed bg-base-100 rounded-lg shadow-xl border border-base-300 z-[60] max-w-md max-h-[60vh] overflow-hidden flex flex-col animate-fade-in"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      @if (entity()) {
        <!-- Header -->
        <div
          class="px-4 py-2 border-b border-base-300 bg-base-200/50 flex-shrink-0"
        >
          <h3 class="font-semibold text-sm truncate">{{ entity()?.name }}</h3>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto p-4 flex-1 relative">
          @if (isLoading()) {
            <div class="flex items-center justify-center py-4">
              <span class="loading loading-spinner loading-sm"></span>
            </div>
          }
          <div
            #contentContainer
            class="markdown-content text-sm prose prose-sm max-w-none"
            [class.invisible]="isLoading()"
          ></div>
        </div>
      } @else {
        <!-- Broken link state -->
        <div class="px-4 py-3 text-error/70 text-sm italic">
          Entity not found
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      pointer-events: auto;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.15s ease-out;
    }
  `,
})
export class WikilinkPreviewPanelComponent {
  private readonly renderer = inject(MarkdownRenderer);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly contentContainer =
    viewChild<ElementRef<HTMLElement>>('contentContainer');

  /** The entity to preview */
  entity = input<Entity | null>(null);

  /** Position of the panel */
  position = input<{ x: number; y: number }>({ x: 0, y: 0 });

  /** Emitted when mouse enters the panel */
  mouseEnter = output<void>();

  /** Emitted when mouse leaves the panel */
  mouseLeave = output<void>();

  protected isLoading = signal(true);

  private componentRefs: ComponentRef<unknown>[] = [];
  private cleanupHoverHandlers?: () => void;
  private renderedEntityId: string | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cleanupComponents();
    });

    effect(() => {
      const entity = this.entity();
      const container = this.contentContainer();

      if (!entity || !container) {
        return;
      }

      // Prevent re-rendering the same entity
      if (this.renderedEntityId === entity.id) {
        return;
      }

      this.renderedEntityId = entity.id;
      this.renderContent(entity, container.nativeElement);
    });
  }

  private async renderContent(
    entity: Entity,
    element: HTMLElement,
  ): Promise<void> {
    this.isLoading.set(true);
    this.cleanupComponents();

    const content = entity.content ?? '';
    if (!content) {
      this.isLoading.set(false);
      element.innerHTML = `
        <div class="text-base-content/50 text-sm italic">
          No content
        </div>
      `;
      return;
    }

    const result = await this.renderer.renderContent(
      content,
      element,
      this.viewContainerRef,
      entity,
      entity.name,
    );

    this.componentRefs = result.componentRefs;
    this.cleanupHoverHandlers = result.cleanupHoverHandlers;
    this.isLoading.set(false);
  }

  private cleanupComponents(): void {
    this.cleanupHoverHandlers?.();
    this.cleanupHoverHandlers = undefined;
    this.componentRefs.forEach((ref) => ref.destroy());
    this.componentRefs = [];
  }

  protected onMouseEnter(): void {
    this.mouseEnter.emit();
  }

  protected onMouseLeave(): void {
    this.mouseLeave.emit();
  }
}

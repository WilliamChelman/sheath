import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBold,
  heroCodeBracket,
  heroChatBubbleLeft,
  heroHashtag,
  heroItalic,
  heroLink,
} from '@ng-icons/heroicons/outline';
import type { SelectionInfo } from './codemirror-editor.component';

export type FormatType = 'bold' | 'italic' | 'heading' | 'link' | 'code' | 'quote';

@Component({
  selector: 'app-floating-toolbar',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      heroBold,
      heroItalic,
      heroHashtag,
      heroLink,
      heroCodeBracket,
      heroChatBubbleLeft,
    }),
  ],
  template: `
    @if (isVisible()) {
      <div
        class="floating-toolbar fixed z-50 bg-base-100 shadow-xl rounded-lg border border-base-300 p-1 flex gap-0.5 animate-fade-in"
        [style.left.px]="position().x"
        [style.top.px]="position().y"
        [style.transform]="'translateX(-50%)'"
      >
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('bold')"
          title="Bold (Ctrl+B)"
        >
          <ng-icon name="heroBold" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('italic')"
          title="Italic (Ctrl+I)"
        >
          <ng-icon name="heroItalic" class="text-base" />
        </button>
        <div class="divider divider-horizontal mx-0 w-px"></div>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('heading')"
          title="Heading"
        >
          <ng-icon name="heroHashtag" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('link')"
          title="Link (Ctrl+K)"
        >
          <ng-icon name="heroLink" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('code')"
          title="Code (Ctrl+\`)"
        >
          <ng-icon name="heroCodeBracket" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('quote')"
          title="Quote (Ctrl+Shift+.)"
        >
          <ng-icon name="heroChatBubbleLeft" class="text-base" />
        </button>
      </div>
    }
  `,
  styles: `
    app-floating-toolbar {
      pointer-events: none;
    }

    .floating-toolbar {
      pointer-events: auto;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.15s ease-out;
    }
  `,
})
export class FloatingToolbarComponent {
  selection = input<SelectionInfo | null>(null);
  format = output<FormatType>();

  protected readonly isVisible = computed(() => {
    const sel = this.selection();
    return sel !== null && sel.text.length > 0;
  });

  protected readonly position = computed(() => {
    const sel = this.selection();
    if (!sel) return { x: 0, y: 0 };

    // Position above the selection
    return {
      x: sel.coords.left,
      y: sel.coords.top - 40, // 40px above selection
    };
  });
}

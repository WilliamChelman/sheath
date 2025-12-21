import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCode,
  phosphorQuotes,
  phosphorHash,
  phosphorTextItalic,
  phosphorLink,
  phosphorTextB,
} from '@ng-icons/phosphor-icons/regular';
import { I18nService } from '@/i18n';
import { compendiumBundle } from '../../compendium.i18n';
import type { SelectionInfo } from './codemirror-editor.component';

export type FormatType =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'link'
  | 'code'
  | 'quote';

@Component({
  selector: 'app-floating-toolbar',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorTextB,
      phosphorTextItalic,
      phosphorHash,
      phosphorLink,
      phosphorCode,
      phosphorQuotes,
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
          [title]="t('toolbar.bold')"
        >
          <ng-icon name="phosphorTextB" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('italic')"
          [title]="t('toolbar.italic')"
        >
          <ng-icon name="phosphorTextItalic" class="text-base" />
        </button>
        <div class="divider divider-horizontal mx-0 w-px"></div>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('heading')"
          [title]="t('toolbar.heading')"
        >
          <ng-icon name="phosphorHash" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('link')"
          [title]="t('toolbar.link')"
        >
          <ng-icon name="phosphorLink" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('code')"
          [title]="t('toolbar.code')"
        >
          <ng-icon name="phosphorCode" class="text-base" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          (click)="format.emit('quote')"
          [title]="t('toolbar.quote')"
        >
          <ng-icon name="phosphorQuotes" class="text-base" />
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
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(compendiumBundle);

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

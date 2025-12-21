import { Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '@/i18n';
import { compendiumBundle } from '../../compendium.i18n';
import { TocEntry } from '../../models/toc-entry';

@Component({
  selector: 'app-editor-toc',
  template: `
    <div class="editor-toc p-4">
      <h3
        class="font-semibold text-sm text-base-content/60 uppercase tracking-wide mb-3"
      >
        {{ t('detail.tableOfContents') }}
      </h3>

      @if (entries().length === 0) {
        <p class="text-sm text-base-content/40 italic">
          Add headings to see outline...
        </p>
      } @else {
        <nav class="space-y-1">
          @for (entry of entries(); track entry.id) {
            <button
              type="button"
              class="block w-full text-left text-sm hover:text-primary transition-colors truncate"
              [class]="getLevelClass(entry.level)"
              (click)="navigate.emit(entry.id)"
              [title]="entry.text"
            >
              {{ entry.text }}
            </button>
          }
        </nav>
      }
    </div>
  `,
  styles: `
    app-editor-toc {
      display: block;
    }

    .editor-toc nav button {
      color: color-mix(in oklch, var(--color-base-content) 70%, transparent);
    }

    .editor-toc nav button:hover {
      color: var(--color-primary);
    }
  `,
})
export class EditorTocComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  content = input('');
  navigate = output<string>();

  protected readonly entries = computed((): TocEntry[] => {
    const c = this.content();
    if (!c) return [];

    const lines = c.split('\n');
    const entries: TocEntry[] = [];
    const usedIds = new Set<string>();

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const baseId = this.generateSlug(text);

        let id = baseId;
        let counter = 1;
        while (usedIds.has(id)) {
          id = `${baseId}-${counter}`;
          counter++;
        }
        usedIds.add(id);

        entries.push({ id, text, level });
      }
    }

    return entries;
  });

  protected getLevelClass(level: number): string {
    const paddingClasses: Record<number, string> = {
      1: 'pl-0 font-semibold',
      2: 'pl-0 font-medium',
      3: 'pl-3',
      4: 'pl-6',
      5: 'pl-9',
      6: 'pl-12',
    };
    return paddingClasses[level] ?? 'pl-0';
  }

  private generateSlug(text: string): string {
    return (
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'section'
    );
  }
}

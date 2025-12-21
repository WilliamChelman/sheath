import { Injectable } from '@angular/core';
import { TocEntry } from '../models/toc-entry';

/**
 * Result of processing HTML content.
 */
export interface ProcessedContent {
  html: string;
  toc: TocEntry[];
}

/**
 * Service to transform raw compendium HTML into styled, structured content.
 * Uses DOM manipulation to add Tailwind/DaisyUI classes and restructure elements.
 */
@Injectable({ providedIn: 'root' })
export class EntityHtmlProcessorService {
  /**
   * Process raw HTML content and return styled HTML.
   * @param html Raw HTML from markdown conversion
   * @param displayName The entry's display name (used to remove duplicate titles)
   */
  process(html: string, displayName: string): string {
    return this.processWithToc(html, displayName).html;
  }

  /**
   * Process raw HTML content and return styled HTML along with TOC entries.
   * @param html Raw HTML from markdown conversion
   * @param displayName The entry's display name (used to remove duplicate titles)
   */
  processWithToc(html: string, displayName: string): ProcessedContent {
    if (!html) return { html: '', toc: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Process in order
    this.removeDuplicateTitle(doc, displayName);
    this.normalizeHeadingDepth(doc);
    this.processStatTables(doc);
    this.processAbilityBlockquotes(doc);
    this.processGenericTables(doc);
    this.addHeadingIds(doc);
    const toc = this.extractToc(doc);
    this.processHeadings(doc);
    this.processParagraphs(doc);
    this.processLists(doc);
    this.processHorizontalRules(doc);

    return { html: doc.body.innerHTML, toc };
  }

  /**
   * Add unique IDs to all headings for TOC linking.
   */
  private addHeadingIds(doc: Document): void {
    const headings = doc.body.querySelectorAll('h2, h3, h4, h5, h6');
    const usedIds = new Set<string>();

    headings.forEach((heading) => {
      const text = heading.textContent?.trim() ?? '';
      const baseId = this.generateSlug(text);
      let id = baseId;
      let counter = 1;

      // Ensure unique ID
      while (usedIds.has(id)) {
        id = `${baseId}-${counter}`;
        counter++;
      }

      usedIds.add(id);
      heading.setAttribute('id', id);
    });
  }

  /**
   * Generate a URL-friendly slug from text.
   */
  private generateSlug(text: string): string {
    return (
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single
        .replace(/^-|-$/g, '') || // Remove leading/trailing dashes
      'section'
    );
  }

  /**
   * Extract TOC entries from headings.
   */
  private extractToc(doc: Document): TocEntry[] {
    const headings = doc.body.querySelectorAll('h2, h3, h4, h5, h6');
    const toc: TocEntry[] = [];

    headings.forEach((heading) => {
      const id = heading.getAttribute('id');
      const text = heading.textContent?.trim() ?? '';
      const level = parseInt(heading.tagName.charAt(1), 10);

      if (id && text) {
        toc.push({ id, text, level });
      }
    });

    return toc;
  }

  /**
   * Remove the first heading if it matches the display name (already shown in header).
   */
  private removeDuplicateTitle(doc: Document, displayName: string): void {
    const firstHeading = doc.body.querySelector('h1, h2, h3, h4, h5, h6');
    if (firstHeading) {
      const headingText = firstHeading.textContent?.trim().toLowerCase();
      const displayLower = displayName.toLowerCase();
      if (headingText === displayLower) {
        firstHeading.remove();
      }
    }
  }

  /**
   * Normalize heading depths so the minimum heading level becomes h2.
   * Also corrects encoding errors where headings skip levels (e.g., h3 → h6 becomes h3 → h4).
   * This preserves the heading hierarchy while ensuring no h1 elements exist.
   */
  private normalizeHeadingDepth(doc: Document): void {
    // First pass: correct encoding errors where headings skip levels
    this.correctHeadingEncodingErrors(doc);

    // Re-query headings after encoding error corrections
    const headings = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return;

    // Find the minimum heading level
    let minLevel = 6;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1), 10);
      if (level < minLevel) minLevel = level;
    });

    // Calculate shift to make minLevel become 2
    const shift = 2 - minLevel;
    if (shift === 0) return; // Already normalized

    // Replace headings with shifted levels
    headings.forEach((heading) => {
      const currentLevel = parseInt(heading.tagName.charAt(1), 10);
      // Clamp to valid heading levels (2-6, never h1)
      const newLevel = Math.max(2, Math.min(6, currentLevel + shift));

      // Create new heading element
      const newHeading = doc.createElement(`h${newLevel}`);
      newHeading.innerHTML = heading.innerHTML;

      // Copy attributes and classes
      Array.from(heading.attributes).forEach((attr) => {
        newHeading.setAttribute(attr.name, attr.value);
      });

      // Replace the old heading
      heading.parentNode?.replaceChild(newHeading, heading);
    });
  }

  /**
   * Correct encoding errors where headings skip levels.
   * If a heading is more than 1 level deeper than the previous, it's an encoding error
   * and should be set to the same level as the previous heading.
   * Traverses from last to first to prevent gaps created by incremental fixes.
   * Example: h3 → h6 is corrected to h3 → h3
   */
  private correctHeadingEncodingErrors(doc: Document): void {
    const headings = Array.from(
      doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    );
    if (headings.length < 2) return;

    // Process in reverse order (last to first)
    // When we find a gap, cascade fixes forward from that point
    for (let i = headings.length - 2; i >= 0; i--) {
      const currentLevel = parseInt(headings[i].tagName.charAt(1), 10);
      const nextLevel = parseInt(headings[i + 1].tagName.charAt(1), 10);

      if (nextLevel > currentLevel + 1) {
        // The next heading and potentially subsequent ones need fixing
        // Cascade forward from i+1 and fix all headings that skip levels
        let prevLevel = currentLevel;

        for (let j = i + 1; j < headings.length; j++) {
          const heading = headings[j];
          const headingLevel = parseInt(heading.tagName.charAt(1), 10);

          if (headingLevel > prevLevel + 1) {
            // Fix this heading to same level as previous
            const correctedLevel = prevLevel;
            const newHeading = doc.createElement(`h${correctedLevel}`);
            newHeading.innerHTML = heading.innerHTML;

            // Copy attributes
            Array.from(heading.attributes).forEach((attr) => {
              newHeading.setAttribute(attr.name, attr.value);
            });

            // Replace the old heading
            heading.parentNode?.replaceChild(newHeading, heading);
            headings[j] = newHeading;
            // prevLevel stays the same since we corrected to it
          } else {
            // Heading is valid relative to previous, update prevLevel
            prevLevel = headingLevel;
          }
        }
      }
    }
  }

  /**
   * Process tables - detect stat block tables vs generic tables.
   * Stat block tables have specific patterns (stats like Might, Agility, Size, Speed, etc.)
   */
  private processStatTables(doc: Document): void {
    const tables = doc.body.querySelectorAll('table');

    tables.forEach((table) => {
      if (this.isStatBlockTable(table)) {
        this.transformStatBlockTable(table);
      }
    });
  }

  /**
   * Check if a table is a monster/creature stat block table.
   * Stat blocks typically have cells containing characteristic names.
   */
  private isStatBlockTable(table: Element): boolean {
    const text = table.textContent?.toLowerCase() ?? '';
    const statKeywords = [
      'might',
      'agility',
      'reason',
      'intuition',
      'presence',
      'stamina',
      'speed',
      'stability',
      'size',
      'free strike',
    ];
    const matchCount = statKeywords.filter((kw) => text.includes(kw)).length;
    return matchCount >= 4;
  }

  /**
   * Transform a stat block table into a styled card layout.
   */
  private transformStatBlockTable(table: Element): void {
    table.classList.add(
      'stat-block-table',
      'w-full',
      'border-collapse',
      'mb-4',
    );

    // Style header row (first row often has ancestry, level, role, EV)
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('th, td');
      cells.forEach((cell) => {
        // Add base cell styling
        cell.classList.add(
          'stat-block-cell',
          'px-2',
          'py-1',
          'text-center',
          'border',
          'border-base-300',
        );

        // Process cells with value/label pattern (e.g., "**7**<br/>Speed")
        this.processStatCell(cell);
      });

      // First row is typically the header info row
      if (rowIndex === 0) {
        row.classList.add('stat-block-header-row', 'bg-primary/10');
      }
    });
  }

  /**
   * Process individual stat cells to style value/label pairs.
   */
  private processStatCell(cell: Element): void {
    const html = cell.innerHTML;

    // Pattern: **value**<br/>Label or **value**<br/> Label
    // Also handles: **+2**<br/> Agility
    const valuePattern = /<strong>([^<]+)<\/strong>\s*<br\s*\/?>\s*(.+)/i;
    const match = html.match(valuePattern);

    if (match) {
      const value = match[1].trim();
      const label = match[2].trim();
      cell.innerHTML = `
        <div class="stat-cell-content flex flex-col items-center">
          <span class="stat-value text-lg font-bold text-primary">${value}</span>
          <span class="stat-label text-xs text-base-content/60 uppercase tracking-wide">${label}</span>
        </div>
      `;
    }
  }

  /**
   * Process blockquotes - these are typically ability cards.
   * Look for patterns like "🗡 **Ability Name**" or "⭐️ **Feature Name**"
   */
  private processAbilityBlockquotes(doc: Document): void {
    const blockquotes = doc.body.querySelectorAll('blockquote');

    blockquotes.forEach((bq) => {
      const abilityType = this.detectAbilityType(bq);
      this.transformAbilityCard(bq, abilityType);
    });
  }

  /**
   * Detect the type of ability based on emoji or content patterns.
   */
  private detectAbilityType(
    bq: Element,
  ): 'attack' | 'action' | 'trait' | 'triggered' | 'default' {
    const text = bq.textContent ?? '';
    const html = bq.innerHTML;

    // Check for emoji patterns
    if (html.includes('🗡') || text.includes('🗡')) {
      return 'attack';
    }
    if (
      html.includes('⬥') ||
      text.includes('⬥') ||
      html.includes('◆') ||
      text.includes('◆')
    ) {
      return 'action';
    }
    if (
      html.includes('⭐') ||
      text.includes('⭐') ||
      html.includes('⭐️') ||
      text.includes('⭐️')
    ) {
      return 'trait';
    }
    if (html.includes('⚡') || text.includes('⚡') || text.includes('↻')) {
      return 'triggered';
    }

    // Check for signature ability pattern
    if (text.toLowerCase().includes('signature ability')) {
      return 'attack';
    }

    return 'default';
  }

  /**
   * Transform a blockquote into a styled ability card.
   */
  private transformAbilityCard(
    bq: Element,
    type: 'attack' | 'action' | 'trait' | 'triggered' | 'default',
  ): void {
    const borderColorClass = {
      attack: 'border-l-primary',
      action: 'border-l-info',
      trait: 'border-l-secondary',
      triggered: 'border-l-success',
      default: 'border-l-primary',
    }[type];

    const bgColorClass = {
      attack: 'bg-primary/5',
      action: 'bg-info/5',
      trait: 'bg-secondary/5',
      triggered: 'bg-success/5',
      default: 'bg-primary/5',
    }[type];

    bq.classList.add(
      'ability-card',
      'border-l-4',
      borderColorClass,
      bgColorClass,
      'rounded-r-lg',
      'p-4',
      'my-4',
      'not-prose',
    );

    // Process internal content
    this.processAbilityCardContent(bq);
  }

  /**
   * Process the content inside an ability card.
   */
  private processAbilityCardContent(bq: Element): void {
    // Style the ability name (first strong element or first paragraph with strong)
    const firstP = bq.querySelector('p');
    if (firstP) {
      const strong = firstP.querySelector('strong');
      if (strong) {
        strong.classList.add('text-lg', 'font-bold', 'text-base-content');
      }
      firstP.classList.add(
        'ability-card-title',
        'mb-2',
        'text-base-content/90',
      );
    }

    // Style internal tables (often used for action type / range)
    const tables = bq.querySelectorAll('table');
    tables.forEach((table) => {
      table.classList.add(
        'ability-info-table',
        'w-full',
        'text-sm',
        'mb-2',
        'border-none',
      );
      const cells = table.querySelectorAll('th, td');
      cells.forEach((cell) => {
        cell.classList.add('px-2', 'py-1', 'text-base-content/70', 'border-0');
      });
    });

    // Style power roll results
    const lists = bq.querySelectorAll('ul, ol');
    lists.forEach((list) => {
      list.classList.add('power-roll-list', 'space-y-1', 'mt-2');
      const items = list.querySelectorAll('li');
      items.forEach((item) => {
        this.stylePowerRollItem(item);
      });
    });

    // Style paragraphs (effects, flavor text)
    const paragraphs = bq.querySelectorAll('p');
    paragraphs.forEach((p, index) => {
      if (index > 0) {
        // Skip the title paragraph
        p.classList.add('ability-text', 'text-sm', 'text-base-content/80');

        // Highlight "Effect:" prefix
        if (p.innerHTML.startsWith('<strong>Effect')) {
          p.classList.add('ability-effect', 'mt-2');
        }
      }
    });
  }

  /**
   * Style power roll list items (e.g., "≤11: 1 damage", "17+: 5 damage").
   */
  private stylePowerRollItem(item: Element): void {
    const text = item.textContent ?? '';
    item.classList.add('power-roll-item', 'text-sm', 'text-base-content/80');

    // Check for tier patterns and add appropriate styling
    if (text.match(/≤\s*11|≤11/)) {
      item.classList.add('power-roll-tier-1');
    } else if (text.match(/12[-–]16/)) {
      item.classList.add('power-roll-tier-2');
    } else if (text.match(/17\+/)) {
      item.classList.add('power-roll-tier-3');
    }
  }

  /**
   * Process generic tables that aren't stat blocks.
   */
  private processGenericTables(doc: Document): void {
    const tables = doc.body.querySelectorAll(
      'table:not(.stat-block-table):not(.ability-info-table)',
    );

    tables.forEach((table) => {
      table.classList.add('table', 'table-zebra', 'w-full', 'my-4');

      // Style header cells
      const headerCells = table.querySelectorAll('th');
      headerCells.forEach((th) => {
        th.classList.add('bg-base-200', 'text-base-content', 'font-semibold');
      });

      // Style data cells
      const dataCells = table.querySelectorAll('td');
      dataCells.forEach((td) => {
        td.classList.add('text-base-content/80');
      });
    });
  }

  /**
   * Process headings with appropriate styling.
   * Note: After normalizeHeadingDepth, headings start at h2 (no h1 expected).
   */
  private processHeadings(doc: Document): void {
    const headings = doc.body.querySelectorAll('h2, h3, h4, h5, h6');

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1), 10);

      heading.classList.add('text-base-content', 'font-bold', 'mt-4', 'mb-2');

      switch (level) {
        case 2:
          heading.classList.add('text-2xl');
          break;
        case 3:
          heading.classList.add('text-xl');
          break;
        case 4:
          heading.classList.add('text-lg');
          break;
        case 5:
        case 6:
          heading.classList.add('text-base');
          break;
      }
    });
  }

  /**
   * Process paragraphs with appropriate styling.
   */
  private processParagraphs(doc: Document): void {
    // Only process paragraphs not inside ability cards or other processed containers
    const paragraphs = doc.body.querySelectorAll(
      'p:not(.ability-card-title):not(.ability-text):not(.ability-effect)',
    );

    paragraphs.forEach((p) => {
      // Skip if already has classes (processed elsewhere)
      if (p.classList.length === 0) {
        p.classList.add('text-base-content/80', 'my-2', 'leading-relaxed');
      }

      // Style italic text (often flavor text)
      const emElements = p.querySelectorAll('em');
      emElements.forEach((em) => {
        em.classList.add('text-base-content/60', 'italic');
      });

      // Style inline keywords
      this.styleKeywords(p);
    });
  }

  /**
   * Style keyword patterns like "Keywords: X, Y, Z".
   */
  private styleKeywords(element: Element): void {
    const html = element.innerHTML;
    if (html.startsWith('<strong>Keywords')) {
      element.classList.add(
        'keywords-line',
        'text-sm',
        'text-base-content/70',
        'bg-base-200/50',
        'px-2',
        'py-1',
        'rounded',
      );
    }
  }

  /**
   * Process lists (ul, ol) with styling.
   */
  private processLists(doc: Document): void {
    const lists = doc.body.querySelectorAll(
      'ul:not(.power-roll-list), ol:not(.power-roll-list)',
    );

    lists.forEach((list) => {
      list.classList.add(
        'my-2',
        'pl-4',
        'text-base-content/80',
        'leading-relaxed',
      );

      if (list.tagName === 'UL') {
        list.classList.add('list-disc');
      } else {
        list.classList.add('list-decimal');
      }

      const items = list.querySelectorAll('li');
      items.forEach((item) => {
        item.classList.add('my-1');
      });
    });
  }

  /**
   * Process horizontal rules (often used as dividers).
   */
  private processHorizontalRules(doc: Document): void {
    const hrs = doc.body.querySelectorAll('hr');

    hrs.forEach((hr) => {
      hr.classList.add('my-6', 'border-t', 'border-base-300', 'opacity-50');
    });
  }
}

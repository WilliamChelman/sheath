import { DomainService } from '../../services/domain.service';
import { EntitySearchService } from '../../services/entity-search.service';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language';
import { EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  placeholder as placeholderExt,
  ViewUpdate,
} from '@codemirror/view';
import { wikilinkAutocomplete } from './extensions/wikilink-autocomplete';

export interface SelectionInfo {
  from: number;
  to: number;
  text: string;
  coords: { left: number; top: number; bottom: number };
}

@Component({
  selector: 'app-codemirror-editor',
  template: `<div #editorContainer class="codemirror-container"></div>`,
  encapsulation: ViewEncapsulation.None,
  styles: `
    app-codemirror-editor {
      display: block;
      height: 100%;
    }

    .codemirror-container {
      height: 100%;
    }

    .codemirror-container .cm-editor {
      height: 100%;
      font-family:
        ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas,
        'Liberation Mono', 'Courier New', monospace;
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .codemirror-container .cm-editor.cm-focused {
      outline: none;
    }

    .codemirror-container .cm-scroller {
      overflow: auto;
      padding: 1rem;
    }

    .codemirror-container .cm-content {
      caret-color: var(--color-base-content);
    }

    .codemirror-container .cm-cursor {
      border-left-color: var(--color-base-content);
    }

    .codemirror-container .cm-selectionBackground {
      background-color: color-mix(
        in oklch,
        var(--color-primary) 20%,
        transparent
      ) !important;
    }

    .codemirror-container .cm-activeLine {
      background-color: color-mix(
        in oklch,
        var(--color-base-content) 5%,
        transparent
      );
    }

    .codemirror-container .cm-gutters {
      background-color: var(--color-base-200);
      border-right: 1px solid
        color-mix(in oklch, var(--color-base-content) 10%, transparent);
      color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
    }

    /* Markdown syntax highlighting */
    .codemirror-container .tok-heading {
      color: var(--color-primary);
      font-weight: bold;
    }

    .codemirror-container .tok-emphasis {
      font-style: italic;
    }

    .codemirror-container .tok-strong {
      font-weight: bold;
    }

    .codemirror-container .tok-link {
      color: var(--color-secondary);
    }

    .codemirror-container .tok-url {
      color: var(--color-accent);
    }

    .codemirror-container .tok-meta {
      color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
    }

    .codemirror-container .tok-keyword {
      color: var(--color-primary);
    }

    .codemirror-container .tok-string {
      color: var(--color-success);
    }

    .codemirror-container .tok-comment {
      color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
      font-style: italic;
    }

    /* Live preview mode styles */
    .codemirror-container.live-preview .cm-header-1 {
      font-size: 2em;
      font-weight: 800;
    }

    .codemirror-container.live-preview .cm-header-2 {
      font-size: 1.5em;
      font-weight: 700;
    }

    .codemirror-container.live-preview .cm-header-3 {
      font-size: 1.25em;
      font-weight: 600;
    }

    .codemirror-container.live-preview .cm-header-4,
    .codemirror-container.live-preview .cm-header-5,
    .codemirror-container.live-preview .cm-header-6 {
      font-size: 1.1em;
      font-weight: 600;
    }

    .codemirror-container.live-preview .cm-formatting {
      opacity: 0.4;
      font-size: 0.85em;
    }

    /* Placeholder */
    .codemirror-container .cm-placeholder {
      color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
      font-style: italic;
    }

    /* Autocomplete dropdown */
    .cm-tooltip-autocomplete {
      background-color: var(--color-base-100) !important;
      border: 1px solid
        color-mix(in oklch, var(--color-base-content) 20%, transparent) !important;
      border-radius: 0.5rem;
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    .cm-tooltip-autocomplete ul {
      font-family: inherit;
    }

    .cm-tooltip-autocomplete ul li {
      color: var(--color-base-content) !important;
      padding: 0.375rem 0.75rem;
    }

    .cm-tooltip-autocomplete ul li[aria-selected='true'],
    .cm-tooltip-autocomplete ul li:hover {
      background-color: var(--color-primary) !important;
      color: var(--color-primary-content) !important;
    }

    .cm-completionLabel {
      color: inherit !important;
    }

    .cm-completionDetail {
      color: color-mix(
        in oklch,
        var(--color-base-content) 60%,
        transparent
      ) !important;
      font-style: italic;
      margin-left: 0.5rem;
    }

    .cm-tooltip-autocomplete ul li[aria-selected='true'] .cm-completionDetail,
    .cm-tooltip-autocomplete ul li:hover .cm-completionDetail {
      color: color-mix(
        in oklch,
        var(--color-primary-content) 80%,
        transparent
      ) !important;
    }
  `,
})
export class CodeMirrorEditorComponent implements AfterViewInit, OnDestroy {
  livePreview = input(false);
  placeholder = input('');
  value = model('');
  selectionChange = output<SelectionInfo | null>();

  private editorContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('editorContainer');
  private editorView?: EditorView;
  private isUpdatingFromModel = false;
  private isInitialized = signal(false);
  #entitySearchService = inject(EntitySearchService);
  #domainService = inject(DomainService);

  constructor() {
    // Sync external value changes to the editor
    effect(() => {
      const val = this.value();
      if (
        this.editorView &&
        this.isInitialized() &&
        !this.isUpdatingFromModel
      ) {
        const currentValue = this.editorView.state.doc.toString();
        if (currentValue !== val) {
          this.editorView.dispatch({
            changes: {
              from: 0,
              to: this.editorView.state.doc.length,
              insert: val,
            },
          });
        }
      }
    });

    // Handle live preview mode changes
    effect(() => {
      const lp = this.livePreview();
      const container = this.editorContainer();
      if (container) {
        container.nativeElement.classList.toggle('live-preview', lp);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initEditor();
  }

  ngOnDestroy(): void {
    this.editorView?.destroy();
  }

  focus(): void {
    this.editorView?.focus();
  }

  applyFormat(
    format: 'bold' | 'italic' | 'heading' | 'link' | 'code' | 'quote',
  ): void {
    if (!this.editorView) return;

    const { state } = this.editorView;
    const selection = state.selection.main;
    const selectedText = state.sliceDoc(selection.from, selection.to);

    let replacement: string;
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'heading':
        // Add or cycle heading level
        if (selectedText.startsWith('### ')) {
          replacement = selectedText.slice(4);
        } else if (selectedText.startsWith('## ')) {
          replacement = `### ${selectedText.slice(3)}`;
        } else if (selectedText.startsWith('# ')) {
          replacement = `## ${selectedText.slice(2)}`;
        } else {
          replacement = `# ${selectedText}`;
        }
        break;
      case 'link':
        replacement = `[${selectedText || 'text'}](url)`;
        cursorOffset = selectedText ? replacement.length - 4 : 1;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          replacement = `\`\`\`\n${selectedText}\n\`\`\``;
        } else {
          replacement = `\`${selectedText}\``;
          cursorOffset = selectedText ? 0 : 1;
        }
        break;
      case 'quote':
        replacement = selectedText
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n');
        break;
      default:
        return;
    }

    this.editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: replacement,
      },
      selection: {
        anchor:
          selection.from +
          (cursorOffset ||
            replacement.length - (selectedText ? 0 : cursorOffset)),
      },
    });

    this.editorView.focus();
  }

  private initEditor(): void {
    const container = this.editorContainer().nativeElement;

    const extensions: Extension[] = [
      history(),
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap, ...historyKeymap, ...this.customKeymap()]),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          this.isUpdatingFromModel = true;
          this.value.set(update.state.doc.toString());
          this.isUpdatingFromModel = false;
        }
        if (update.selectionSet || update.docChanged) {
          this.emitSelectionChange(update);
        }
      }),
      EditorView.lineWrapping,
    ];

    if (this.placeholder()) {
      extensions.push(placeholderExt(this.placeholder()));
    }

    extensions.push(
      wikilinkAutocomplete({
        entityService: this.#entitySearchService,
        domainService: this.#domainService,
      }),
    );

    this.editorView = new EditorView({
      state: EditorState.create({
        doc: this.value(),
        extensions,
      }),
      parent: container,
    });

    if (this.livePreview()) {
      container.classList.add('live-preview');
    }

    this.isInitialized.set(true);
  }

  private customKeymap() {
    return [
      {
        key: 'Mod-b',
        run: () => {
          this.applyFormat('bold');
          return true;
        },
      },
      {
        key: 'Mod-i',
        run: () => {
          this.applyFormat('italic');
          return true;
        },
      },
      {
        key: 'Mod-k',
        run: () => {
          this.applyFormat('link');
          return true;
        },
      },
      {
        key: 'Mod-`',
        run: () => {
          this.applyFormat('code');
          return true;
        },
      },
      {
        key: 'Mod-Shift-.',
        run: () => {
          this.applyFormat('quote');
          return true;
        },
      },
    ];
  }

  private emitSelectionChange(update: ViewUpdate): void {
    const selection = update.state.selection.main;

    if (selection.empty) {
      this.selectionChange.emit(null);
      return;
    }

    const text = update.state.sliceDoc(selection.from, selection.to);
    const coords = this.editorView?.coordsAtPos(selection.from);

    if (coords) {
      this.selectionChange.emit({
        from: selection.from,
        to: selection.to,
        text,
        coords: {
          left: coords.left,
          top: coords.top,
          bottom: coords.bottom,
        },
      });
    }
  }
}

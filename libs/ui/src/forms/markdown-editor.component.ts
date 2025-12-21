import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import EasyMDE from 'easymde';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-markdown-editor',
  template: `
    <fieldset class="fieldset">
      <label class="fieldset-legend" [attr.for]="inputId()">
        {{ label() }}
      </label>
      <div class="markdown-editor-container">
        <textarea #editorRef [id]="inputId()"></textarea>
      </div>
      @if (helperText()) {
        <p class="label whitespace-normal" [id]="helperTextId()">
          {{ helperText() }}
        </p>
      }
    </fieldset>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      @import 'easymde/dist/easymde.min.css';

      app-markdown-editor {
        display: block;
      }

      .markdown-editor-container button.table {
        width: unset;
        font-size: 0.75rem;
      }

      .markdown-editor-container .EasyMDEContainer {
        background: transparent;
      }

      .markdown-editor-container .CodeMirror {
        border-radius: 0.5rem;
        border-color: color-mix(in oklch, var(--color-base-content) 20%, transparent);
        min-height: 300px;
      }

      .markdown-editor-container .editor-toolbar {
        border-color: color-mix(in oklch, var(--color-base-content) 20%, transparent);
        border-radius: 0.5rem 0.5rem 0 0;
      }

      .markdown-editor-container .editor-toolbar button {
        color: var(--color-base-content);
      }

      .markdown-editor-container .editor-toolbar button:hover {
        background: color-mix(in oklch, var(--color-base-content) 10%, transparent);
      }

      .markdown-editor-container .editor-toolbar button.active {
        background: color-mix(in oklch, var(--color-primary) 20%, transparent);
      }

      .markdown-editor-container .editor-preview {
        background: var(--color-base-200);
      }

      .markdown-editor-container .editor-preview-side {
        border-color: color-mix(in oklch, var(--color-base-content) 20%, transparent);
      }

      .markdown-editor-container .CodeMirror-cursor {
        border-color: var(--color-base-content);
      }

      .markdown-editor-container .cm-s-easymde .cm-header {
        color: var(--color-primary);
      }

      .markdown-editor-container .cm-s-easymde .cm-link {
        color: var(--color-secondary);
      }

      .markdown-editor-container .cm-s-easymde .cm-url {
        color: var(--color-accent);
      }
    `,
  ],
})
export class MarkdownEditorComponent implements AfterViewInit, OnDestroy {
  private formId = inject(FormIdService);
  private editorRef =
    viewChild.required<ElementRef<HTMLTextAreaElement>>('editorRef');
  private editor?: EasyMDE;
  private isUpdatingFromEditor = false;
  private isInitialized = signal(false);

  id = input<string | null>(null);
  label = input.required<string>();
  helperText = input<string | null>(null);
  disabled = input(false);
  value = model('');

  protected autoId = this.formId.next('markdown');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);

  constructor() {
    // Sync external value changes to the editor
    effect(() => {
      const val = this.value();
      if (this.editor && this.isInitialized() && !this.isUpdatingFromEditor) {
        const currentValue = this.editor.value();
        if (currentValue !== val) {
          this.editor.value(val);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initEditor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = undefined;
    }
  }

  private initEditor(): void {
    const element = this.editorRef().nativeElement;

    this.editor = new EasyMDE({
      element,
      initialValue: this.value(),
      spellChecker: false,
      autofocus: false,
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        'table',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ],
      minHeight: '200px',
    });

    this.editor.codemirror.on('change', () => {
      if (this.editor) {
        this.isUpdatingFromEditor = true;
        this.value.set(this.editor.value());
        this.isUpdatingFromEditor = false;
      }
    });

    this.isInitialized.set(true);
  }
}

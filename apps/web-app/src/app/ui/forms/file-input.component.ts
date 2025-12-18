import { Component, computed, inject, input, output } from '@angular/core';
import { FormIdService } from './form-id.service';

type FileInputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-file-input',
  template: `
    <div class="form-control">
      <label class="label" [attr.for]="inputId()">
        <span class="label-text font-medium">{{ label() }}</span>
        @if (helperText()) {
          <span
            class="label-text-alt text-base-content/50"
            [id]="helperTextId()"
          >
            {{ helperText() }}
          </span>
        }
      </label>

      <input
        [id]="inputId()"
        type="file"
        class="file-input file-input-bordered w-full"
        [class.file-input-sm]="size() === 'sm'"
        [class.file-input-md]="size() === 'md'"
        [class.file-input-lg]="size() === 'lg'"
        [accept]="accept()"
        [disabled]="disabled()"
        [attr.aria-describedby]="helperText() ? helperTextId() : null"
        (change)="onChange($event)"
      />
    </div>
  `,
})
export class FileInputComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  helperText = input<string | null>(null);

  accept = input<string>('');
  size = input<FileInputSize>('sm');
  disabled = input(false);
  resetOnSelect = input(true);

  fileSelected = output<File | null>();

  protected autoId = this.formId.next('file');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);

  protected onChange(event: Event): void {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0] ?? null;

    this.fileSelected.emit(file);

    // Reset input so re-selecting the same file triggers change
    if (this.resetOnSelect()) {
      el.value = '';
    }
  }
}

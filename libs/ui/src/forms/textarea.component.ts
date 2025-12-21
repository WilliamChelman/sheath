import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-textarea',
  imports: [FormsModule],
  template: `
    <fieldset class="fieldset">
      <label class="fieldset-legend" [attr.for]="inputId()">
        {{ label() }}
      </label>
      <textarea
        [id]="inputId()"
        class="textarea textarea-bordered w-full"
        [class.textarea-disabled]="disabled()"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        [placeholder]="placeholder()"
        [maxlength]="maxLength()"
        [disabled]="disabled()"
        [rows]="rows()"
        [attr.aria-describedby]="helperText() ? helperTextId() : null"
      ></textarea>
      @if (helperText()) {
        <p class="label whitespace-normal" [id]="helperTextId()">
          {{ helperText() }}
        </p>
      }
    </fieldset>
  `,
  styles: [
    `
      textarea::placeholder {
        opacity: 0.5;
        color: inherit;
      }
    `,
  ],
})
export class TextareaComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  placeholder = input('');
  maxLength = input<number | null>(null);
  helperText = input<string | null>(null);
  disabled = input(false);
  rows = input(3);

  value = model('');

  protected autoId = this.formId.next('textarea');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);
}

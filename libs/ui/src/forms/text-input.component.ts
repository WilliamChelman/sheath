import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-text-input',
  imports: [FormsModule],
  template: `
    <fieldset class="fieldset">
      <label class="fieldset-legend" [attr.for]="inputId()">
        {{ label() }}
      </label>
      <input
        [id]="inputId()"
        type="text"
        class="input input-bordered w-full"
        [class.input-disabled]="disabled()"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        [placeholder]="placeholder()"
        [maxlength]="maxLength()"
        [disabled]="disabled()"
        [attr.aria-describedby]="helperText() ? helperTextId() : null"
      />
      @if (helperText()) {
        <p class="label whitespace-normal" [id]="helperTextId()">
          {{ helperText() }}
        </p>
      }
    </fieldset>
  `,
  styles: [
    `
      input::placeholder {
        opacity: 0.5;
        color: inherit;
      }
    `,
  ],
})
export class TextInputComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  placeholder = input('');
  maxLength = input<number | null>(null);
  helperText = input<string | null>(null);
  disabled = input(false);

  value = model('');

  protected autoId = this.formId.next('text');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);
}

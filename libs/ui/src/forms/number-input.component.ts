import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-number-input',
  imports: [FormsModule],
  template: `
    <fieldset class="fieldset">
      <label class="fieldset-legend" [attr.for]="inputId()">
        {{ label() }}
      </label>
      <input
        [id]="inputId()"
        type="number"
        class="input input-bordered w-full"
        [class.input-disabled]="disabled()"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        [placeholder]="placeholder()"
        [min]="min()"
        [max]="max()"
        [step]="step()"
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
export class NumberInputComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  placeholder = input('');
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number>(1);
  helperText = input<string | null>(null);
  disabled = input(false);

  value = model<number | null>(null);

  protected autoId = this.formId.next('number');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);
}

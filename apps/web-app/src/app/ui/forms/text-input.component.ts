import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-text-input',
  imports: [FormsModule],
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
        type="text"
        class="input input-bordered w-full"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        [placeholder]="placeholder()"
        [maxlength]="maxLength()"
        [attr.aria-describedby]="helperText() ? helperTextId() : null"
      />
    </div>
  `,
  styles: [`
    input::placeholder {
      opacity: 0.5;
      color: inherit;
    }
  `],
})
export class TextInputComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  placeholder = input('');
  maxLength = input<number | null>(null);
  helperText = input<string | null>(null);

  value = model('');

  protected autoId = this.formId.next('text');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);
}

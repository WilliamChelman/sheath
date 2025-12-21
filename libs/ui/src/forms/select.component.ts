import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [FormsModule],
  template: `
    <fieldset class="fieldset">
      <label class="fieldset-legend" [attr.for]="inputId()">
        {{ label() }}
      </label>
      <select
        [id]="inputId()"
        class="select select-bordered w-full"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </fieldset>
  `,
})
export class SelectComponent<T = string> {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  options = input.required<SelectOption<T>[]>();

  value = model<T>();

  protected autoId = this.formId.next('select');
  protected inputId = computed(() => this.id() ?? this.autoId);
}

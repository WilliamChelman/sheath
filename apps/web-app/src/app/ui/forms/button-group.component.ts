import { Component, computed, inject, input, model } from '@angular/core';
import { FormIdService } from './form-id.service';

export interface ButtonGroupOption<T = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-button-group',
  template: `
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium" [id]="labelId()">{{
          label()
        }}</span>
      </label>
      <div
        class="flex gap-2"
        role="radiogroup"
        [attr.aria-labelledby]="labelId()"
        [class.flex-wrap]="!fullWidth()"
      >
        @for (option of options(); track option.value) {
          <button
            type="button"
            class="btn btn-sm"
            role="radio"
            [attr.aria-checked]="value() === option.value"
            [class.btn-primary]="value() === option.value"
            [class.btn-outline]="value() !== option.value"
            [class.flex-1]="fullWidth()"
            (click)="value.set(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
})
export class ButtonGroupComponent<T = string> {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  options = input.required<ButtonGroupOption<T>[]>();
  fullWidth = input(false);

  value = model<T>();

  protected autoLabelId = this.formId.next('btn-group-label');
  protected labelId = computed(() => this.id() ?? this.autoLabelId);
}

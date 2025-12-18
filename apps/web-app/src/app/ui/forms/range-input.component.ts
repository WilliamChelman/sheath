import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

type RangeInputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-range-input',
  imports: [FormsModule],
  template: `
    <div class="form-control">
      <label class="label" [attr.for]="inputId()">
        <span class="label-text font-medium">{{ label() }}</span>

        @if (showValue()) {
          <span class="label-text-alt text-base-content/50">
            {{ formatValue(value()) }}
          </span>
        }
      </label>

      @if (helperText()) {
        <div class="text-xs text-base-content/50" [id]="helperTextId()">
          {{ helperText() }}
        </div>
      }

      <input
        [id]="inputId()"
        type="range"
        class="range w-full"
        [class.range-sm]="size() === 'sm'"
        [class.range-md]="size() === 'md'"
        [class.range-lg]="size() === 'lg'"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [disabled]="disabled()"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        [attr.aria-describedby]="helperText() ? helperTextId() : null"
      />
    </div>
  `,
})
export class RangeInputComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  helperText = input<string | null>(null);

  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  size = input<RangeInputSize>('sm');
  disabled = input(false);

  showValue = input(true);
  valueFormatter = input<((value: number) => string) | null>(null);

  value = model(0);

  protected autoId = this.formId.next('range');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);

  protected formatValue(value: number): string {
    const formatter = this.valueFormatter();
    if (formatter) return formatter(value);
    return String(value);
  }
}

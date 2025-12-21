import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-color-picker',
  imports: [FormsModule],
  template: `
    <fieldset class="fieldset">
      <label class="fieldset-legend" [attr.for]="inputId()">
        {{ label() }}
      </label>
      <input
        [id]="inputId()"
        type="color"
        class="w-full h-10 rounded-lg cursor-pointer border border-base-300"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
      />
    </fieldset>
  `,
})
export class ColorPickerComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();

  value = model('#000000');

  protected autoId = this.formId.next('color');
  protected inputId = computed(() => this.id() ?? this.autoId);
}

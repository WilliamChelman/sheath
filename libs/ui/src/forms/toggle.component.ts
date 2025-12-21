import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-toggle',
  imports: [FormsModule],
  template: `
    <label class="label" [attr.for]="inputId()">
      <input
        [id]="inputId()"
        type="checkbox"
        class="toggle toggle-primary"
        [class.toggle-disabled]="disabled()"
        [ngModel]="checked()"
        (ngModelChange)="checked.set($event)"
        [disabled]="disabled()"
      />
      {{ label() }}
    </label>
  `,
})
export class ToggleComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  disabled = input(false);

  checked = model(false);

  protected autoId = this.formId.next('toggle');
  protected inputId = computed(() => this.id() ?? this.autoId);
}

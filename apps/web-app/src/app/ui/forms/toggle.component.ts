import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-toggle',
  imports: [FormsModule],
  template: `
    <div class="form-control">
      <label
        class="label cursor-pointer justify-start gap-3"
        [attr.for]="inputId()"
      >
        <input
          [id]="inputId()"
          type="checkbox"
          class="toggle toggle-primary"
          [ngModel]="checked()"
          (ngModelChange)="checked.set($event)"
        />
        <span class="label-text">{{ label() }}</span>
      </label>
    </div>
  `,
})
export class ToggleComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();

  checked = model(false);

  protected autoId = this.formId.next('toggle');
  protected inputId = computed(() => this.id() ?? this.autoId);
}

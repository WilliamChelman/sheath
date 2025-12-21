import { Component, computed, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorX } from '@ng-icons/phosphor-icons/regular';
import { FormIdService } from './form-id.service';

@Component({
  selector: 'app-tag-input',
  imports: [FormsModule, NgIcon],
  viewProviders: [provideIcons({ phosphorX })],
  template: `
    <fieldset class="fieldset">
      <label class="fieldset-legend" [attr.for]="inputId()">
        {{ label() }}
      </label>
      @if (values().length > 0) {
        <div class="flex flex-wrap gap-2 mb-2">
          @for (tag of values(); track tag; let i = $index) {
            <span class="badge badge-primary gap-1">
              {{ tag }}
              <button
                type="button"
                (click)="removeTag(i)"
                class="hover:text-error transition-colors"
                [disabled]="disabled()"
              >
                <ng-icon name="phosphorX" class="text-xs" />
              </button>
            </span>
          }
        </div>
      }
      <div class="flex gap-2">
        <input
          [id]="inputId()"
          type="text"
          class="input input-bordered flex-1"
          [class.input-disabled]="disabled()"
          [ngModel]="newTag()"
          (ngModelChange)="newTag.set($event)"
          (keydown.enter)="addTag(); $event.preventDefault()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-describedby]="helperText() ? helperTextId() : null"
        />
        <button
          type="button"
          class="btn btn-outline btn-sm"
          (click)="addTag()"
          [disabled]="disabled() || !newTag().trim()"
        >
          Add
        </button>
      </div>
      @if (helperText()) {
        <p class="label whitespace-normal" [id]="helperTextId()">
          {{ helperText() }}
        </p>
      }
    </fieldset>
  `,
})
export class TagInputComponent {
  private formId = inject(FormIdService);

  id = input<string | null>(null);
  label = input.required<string>();
  placeholder = input('Add a value...');
  helperText = input<string | null>(null);
  disabled = input(false);

  values = model<string[]>([]);

  protected newTag = signal('');
  protected autoId = this.formId.next('tag');
  protected inputId = computed(() => this.id() ?? this.autoId);
  protected helperTextId = computed(() => `${this.inputId()}-help`);

  addTag(): void {
    const tag = this.newTag().trim();
    if (!tag || this.disabled()) return;

    const currentValues = this.values();
    if (!currentValues.includes(tag)) {
      this.values.set([...currentValues, tag]);
    }
    this.newTag.set('');
  }

  removeTag(index: number): void {
    if (this.disabled()) return;
    const currentValues = [...this.values()];
    currentValues.splice(index, 1);
    this.values.set(currentValues);
  }
}

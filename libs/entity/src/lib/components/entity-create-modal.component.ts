import { I18nService } from '@/i18n';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { compendiumBundle } from '../compendium.i18n';

export interface EntityTypeOption {
  id: string;
  name: string;
}

export interface EntityCreateData {
  name: string;
  type: string;
}

@Component({
  selector: 'app-entity-create-modal',
  imports: [FormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-6">{{ t('create.title') }}</h3>

        <!-- Entity Type -->
        <div class="form-control mb-4">
          <label class="label" for="entityType">
            <span class="label-text">{{ t('create.typeLabel') }}</span>
          </label>
          <select
            id="entityType"
            class="select select-bordered w-full"
            [ngModel]="selectedType()"
            (ngModelChange)="selectedType.set($event)"
          >
            <option value="" disabled>{{ t('create.selectType') }}</option>
            @for (type of entityTypes(); track type.id) {
              <option [value]="type.id">{{ type.name }}</option>
            }
          </select>
        </div>

        <!-- Entity Name -->
        <div class="form-control mb-4">
          <label class="label" for="entityName">
            <span class="label-text">{{ t('create.nameLabel') }}</span>
          </label>
          <input
            id="entityName"
            type="text"
            class="input input-bordered w-full"
            [placeholder]="t('create.namePlaceholder')"
            [ngModel]="entityName()"
            (ngModelChange)="entityName.set($event)"
          />
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button class="btn btn-ghost" (click)="cancel()">
            {{ t('create.cancelButton') }}
          </button>
          <button
            class="btn btn-primary"
            [disabled]="!isValid()"
            (click)="create()"
          >
            {{ t('create.createButton') }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="cancel()">close</button>
      </form>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityCreateModalComponent {
  private readonly i18n = inject(I18nService);
  private readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  entityTypes = input.required<EntityTypeOption[]>();
  created = output<EntityCreateData>();
  cancelled = output<void>();

  protected readonly selectedType = signal('');
  protected readonly entityName = signal('');

  protected isValid(): boolean {
    return (
      this.selectedType().length > 0 && this.entityName().trim().length > 0
    );
  }

  open(): void {
    this.selectedType.set('');
    this.entityName.set('');
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected create(): void {
    if (!this.isValid()) return;

    this.created.emit({
      name: this.entityName().trim(),
      type: this.selectedType(),
    });
    this.close();
  }

  protected cancel(): void {
    this.cancelled.emit();
    this.close();
  }
}

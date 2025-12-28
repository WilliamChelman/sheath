import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '@/i18n';
import { boardEditorBundle } from '../../board-editor.i18n';
import { BoardCell } from '../../models/board.model';
import { BoardCellComponent } from '../board-cell/board-cell.component';

@Component({
  selector: 'lib-board-cell-editor',
  imports: [FormsModule, BoardCellComponent],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">{{ t('editCell') }}</h3>

        <div class="form-control mb-4">
          <label class="label" for="entityRef">
            <span class="label-text">{{ t('entityReference') }}</span>
          </label>
          <input
            id="entityRef"
            type="text"
            class="input input-bordered"
            [ngModel]="entityRef()"
            (ngModelChange)="entityRef.set($event)"
            [placeholder]="t('entityReferencePlaceholder')"
          />
          <div class="label">
            <span class="label-text-alt text-base-content/60">
              {{ t('entityReferenceHint') }}
            </span>
          </div>
        </div>

        <div class="form-control mb-4">
          <label class="label" for="content">
            <span class="label-text">{{ t('content') }}</span>
          </label>
          <textarea
            id="content"
            class="textarea textarea-bordered h-32"
            [ngModel]="content()"
            (ngModelChange)="content.set($event)"
            [placeholder]="t('contentPlaceholder')"
          ></textarea>
          <div class="label">
            <span class="label-text-alt text-base-content/60">
              {{ t('contentHint') }}
            </span>
          </div>
        </div>

        <div class="divider">{{ t('preview') }}</div>
        <div class="border border-base-300 rounded-lg p-4 min-h-24 bg-base-200/30">
          <lib-board-cell [cell]="previewCell()" [readonly]="true" />
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost" (click)="cancel()">{{ t('cancel') }}</button>
          <button class="btn btn-primary" (click)="save()">{{ t('save') }}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="cancel()">close</button>
      </form>
    </dialog>
  `,
})
export class BoardCellEditorComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(boardEditorBundle);

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  cell = input.required<BoardCell>();

  saved = output<BoardCell>();
  cancelled = output<void>();

  protected entityRef = signal('');
  protected content = signal('');

  protected previewCell = computed((): BoardCell => ({
    ...this.cell(),
    entityRef: this.entityRef().trim() || undefined,
    content: this.content().trim() || undefined,
  }));

  constructor() {
    effect(() => {
      const c = this.cell();
      this.entityRef.set(c.entityRef ?? '');
      this.content.set(c.content ?? '');
    });
  }

  open(): void {
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected save(): void {
    this.saved.emit(this.previewCell());
    this.close();
  }

  protected cancel(): void {
    this.cancelled.emit();
    this.close();
  }
}

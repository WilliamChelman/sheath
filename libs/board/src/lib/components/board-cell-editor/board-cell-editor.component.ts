import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardCell } from '../../models/board.model';
import { BoardCellComponent } from '../board-cell/board-cell.component';

@Component({
  selector: 'lib-board-cell-editor',
  imports: [FormsModule, BoardCellComponent],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Edit Cell</h3>

        <div class="form-control mb-4">
          <label class="label" for="entityRef">
            <span class="label-text">Entity Reference</span>
          </label>
          <input
            id="entityRef"
            type="text"
            class="input input-bordered"
            [ngModel]="entityRef()"
            (ngModelChange)="entityRef.set($event)"
            placeholder="Entity ID (e.g., monster-goblin)"
          />
          <div class="label">
            <span class="label-text-alt text-base-content/60">
              Enter the ID of an entity to reference
            </span>
          </div>
        </div>

        <div class="form-control mb-4">
          <label class="label" for="content">
            <span class="label-text">Content (Markdown)</span>
          </label>
          <textarea
            id="content"
            class="textarea textarea-bordered h-32"
            [ngModel]="content()"
            (ngModelChange)="content.set($event)"
            placeholder="Custom markdown content..."
          ></textarea>
          <div class="label">
            <span class="label-text-alt text-base-content/60">
              Supports markdown formatting
            </span>
          </div>
        </div>

        <div class="divider">Preview</div>
        <div class="border border-base-300 rounded-lg p-4 min-h-24 bg-base-200/30">
          <lib-board-cell [cell]="previewCell()" [readonly]="true" />
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost" (click)="cancel()">Cancel</button>
          <button class="btn btn-primary" (click)="save()">Save</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="cancel()">close</button>
      </form>
    </dialog>
  `,
})
export class BoardCellEditorComponent {
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

import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import {
  Component,
  computed,
  inject,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorList,
  phosphorMinus,
  phosphorPlus,
} from '@ng-icons/phosphor-icons/regular';
import { BoardCell, BoardData, CellPosition } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { BoardCellEditorComponent } from '../board-cell-editor/board-cell-editor.component';
import { BoardCellComponent } from '../board-cell/board-cell.component';

@Component({
  selector: 'lib-board-editor',
  imports: [
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    NgIcon,
    BoardCellComponent,
    BoardCellEditorComponent,
  ],
  viewProviders: [provideIcons({ phosphorPlus, phosphorMinus, phosphorList })],
  template: `
    <div class="board-editor">
      <!-- Toolbar -->
      <div class="board-toolbar flex flex-wrap gap-2 mb-4">
        <div class="join">
          <button class="btn btn-sm join-item" (click)="addColumn()">
            <ng-icon name="phosphorPlus" class="text-sm" />
            Column
          </button>
          <button
            class="btn btn-sm join-item"
            (click)="removeColumn()"
            [disabled]="board().cols <= 1"
          >
            <ng-icon name="phosphorMinus" class="text-sm" />
            Column
          </button>
        </div>
        <div class="join">
          <button class="btn btn-sm join-item" (click)="addRow()">
            <ng-icon name="phosphorPlus" class="text-sm" />
            Row
          </button>
          <button
            class="btn btn-sm join-item"
            (click)="removeRow()"
            [disabled]="board().rows <= 1"
          >
            <ng-icon name="phosphorMinus" class="text-sm" />
            Row
          </button>
        </div>
        <div class="text-sm text-base-content/60 flex items-center ml-2">
          {{ board().cols }} x {{ board().rows }}
        </div>
      </div>

      <!-- Grid with Drop Zones -->
      <div
        cdkDropListGroup
        class="board-grid"
        [style.display]="'grid'"
        [style.gridTemplateColumns]="gridTemplateCols()"
        [style.gridTemplateRows]="gridTemplateRows()"
        [style.gap]="'0.5rem'"
      >
        @for (
          position of gridPositions();
          track position.row + '-' + position.col
        ) {
          @if (!isPositionCoveredBySpan(position)) {
            <div
              cdkDropList
              [cdkDropListData]="position"
              (cdkDropListDropped)="onDrop($event)"
              [style.gridColumn]="getGridColumnStyle(position)"
              [style.gridRow]="getGridRowStyle(position)"
              class="drop-zone min-h-20 border-2 border-dashed border-base-300 rounded-lg transition-colors"
              [class.border-primary]="isDropTarget(position)"
              [class.bg-primary-content]="isDropTarget(position)"
            >
              @if (getCellAt(position); as cell) {
                <div
                  cdkDrag
                  [cdkDragData]="cell"
                  (cdkDragStarted)="onDragStarted(cell)"
                  (cdkDragEnded)="onDragEnded()"
                  class="cell-wrapper h-full"
                >
                  <ng-template cdkDragPreview>
                    <div
                      class="bg-base-100 shadow-xl rounded-lg p-2 border border-primary max-w-xs"
                    >
                      {{
                        cell.content?.slice(0, 50) || cell.entityRef || 'Cell'
                      }}
                    </div>
                  </ng-template>

                  <div class="relative h-full group">
                    <div
                      cdkDragHandle
                      class="absolute top-1 left-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-base-100 rounded p-0.5"
                    >
                      <ng-icon
                        name="phosphorList"
                        class="text-base-content/60"
                      />
                    </div>
                    <lib-board-cell
                      [cell]="cell"
                      [readonly]="false"
                      (edit)="openCellEditor(cell)"
                      (deleteCell)="deleteCell(cell)"
                      (spanChange)="updateCellSpan(cell, $event)"
                    />
                  </div>
                </div>
              } @else {
                <button
                  class="btn btn-ghost btn-sm w-full h-full min-h-20 opacity-30 hover:opacity-100 transition-opacity"
                  (click)="addCellAt(position)"
                >
                  <ng-icon name="phPlus" class="text-lg" />
                </button>
              }
            </div>
          }
        }
      </div>
    </div>

    @if (editingCell()) {
      <lib-board-cell-editor
        #cellEditor
        [cell]="editingCell()!"
        (saved)="onCellSaved($event)"
        (cancelled)="editingCell.set(null)"
      />
    }
  `,
  styles: `
    lib-board-editor {
      display: block;
    }

    lib-board-editor .board-grid {
      min-height: 200px;
    }

    lib-board-editor .drop-zone {
      position: relative;
    }

    lib-board-editor .cdk-drag-preview {
      z-index: 1000;
    }

    lib-board-editor .cdk-drag-placeholder {
      opacity: 0.3;
    }

    lib-board-editor .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    lib-board-editor
      .cdk-drop-list-dragging
      .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
})
export class BoardEditorComponent {
  protected readonly boardService = inject(BoardService);

  private readonly cellEditorRef =
    viewChild<BoardCellEditorComponent>('cellEditor');

  board = model.required<BoardData>();

  protected editingCell = signal<BoardCell | null>(null);
  protected draggingCell = signal<BoardCell | null>(null);
  protected dropTargetPosition = signal<CellPosition | null>(null);

  protected gridPositions = computed(() =>
    this.boardService.getGridPositions(this.board()),
  );

  protected gridTemplateCols = computed(() =>
    this.boardService.getGridTemplateCols(this.board()),
  );

  protected gridTemplateRows = computed(() =>
    this.boardService.getGridTemplateRows(this.board()),
  );

  protected getCellAt(position: CellPosition): BoardCell | undefined {
    return this.board().cells.find(
      (c) => c.row === position.row && c.col === position.col,
    );
  }

  protected getGridColumnStyle(position: CellPosition): string {
    const cell = this.getCellAt(position);
    if (cell && cell.colSpan > 1) {
      return `${position.col + 1} / span ${cell.colSpan}`;
    }
    return `${position.col + 1}`;
  }

  protected getGridRowStyle(position: CellPosition): string {
    const cell = this.getCellAt(position);
    if (cell && cell.rowSpan > 1) {
      return `${position.row + 1} / span ${cell.rowSpan}`;
    }
    return `${position.row + 1}`;
  }

  protected isPositionCoveredBySpan(position: CellPosition): boolean {
    const cell = this.boardService.getCellAt(
      this.board(),
      position.row,
      position.col,
    );
    if (!cell) return false;
    // If the cell exists but doesn't start at this position, it's covered by a span
    return cell.row !== position.row || cell.col !== position.col;
  }

  protected isDropTarget(position: CellPosition): boolean {
    const target = this.dropTargetPosition();
    return (
      target !== null &&
      target.row === position.row &&
      target.col === position.col
    );
  }

  protected onDragStarted(cell: BoardCell): void {
    this.draggingCell.set(cell);
  }

  protected onDragEnded(): void {
    this.draggingCell.set(null);
    this.dropTargetPosition.set(null);
  }

  protected onDrop(
    event: CdkDragDrop<CellPosition, CellPosition, BoardCell>,
  ): void {
    const draggedCell = event.item.data;
    const targetPosition = event.container.data;

    if (!draggedCell || !targetPosition) return;

    // Same position, do nothing
    if (
      draggedCell.row === targetPosition.row &&
      draggedCell.col === targetPosition.col
    ) {
      return;
    }

    const targetCell = this.getCellAt(targetPosition);

    if (targetCell && targetCell.id !== draggedCell.id) {
      // Swap positions
      this.board.update((b) =>
        this.boardService.swapCells(b, draggedCell, targetCell),
      );
    } else if (!targetCell) {
      // Move to empty position
      this.board.update((b) =>
        this.boardService.moveCell(b, draggedCell, targetPosition),
      );
    }
  }

  protected addColumn(): void {
    this.board.update((b) => this.boardService.addColumn(b));
  }

  protected removeColumn(): void {
    this.board.update((b) => this.boardService.removeColumn(b));
  }

  protected addRow(): void {
    this.board.update((b) => this.boardService.addRow(b));
  }

  protected removeRow(): void {
    this.board.update((b) => this.boardService.removeRow(b));
  }

  protected addCellAt(position: CellPosition): void {
    const newCell = this.boardService.createCell(position.row, position.col);
    this.board.update((b) => this.boardService.addCell(b, newCell));
    this.openCellEditor(newCell);
  }

  protected deleteCell(cell: BoardCell): void {
    this.board.update((b) => this.boardService.removeCell(b, cell.id));
  }

  protected updateCellSpan(
    cell: BoardCell,
    span: { rowSpan: number; colSpan: number },
  ): void {
    this.board.update((b) =>
      this.boardService.updateCellSpan(b, cell.id, span.rowSpan, span.colSpan),
    );
  }

  protected openCellEditor(cell: BoardCell): void {
    this.editingCell.set(cell);
    // Use setTimeout to ensure the component is rendered
    setTimeout(() => {
      this.cellEditorRef()?.open();
    });
  }

  protected onCellSaved(updatedCell: BoardCell): void {
    this.board.update((b) =>
      this.boardService.updateCell(b, updatedCell.id, {
        content: updatedCell.content,
        entityRef: updatedCell.entityRef,
      }),
    );
    this.editingCell.set(null);
  }
}

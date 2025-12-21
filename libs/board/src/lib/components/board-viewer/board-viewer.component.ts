import { Component, computed, inject, input } from '@angular/core';
import { BoardData } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { BoardCellComponent } from '../board-cell/board-cell.component';

@Component({
  selector: 'lib-board-viewer',
  imports: [BoardCellComponent],
  template: `
    <div
      class="board-grid"
      [style.display]="'grid'"
      [style.gridTemplateColumns]="gridTemplateCols()"
      [style.gridTemplateRows]="gridTemplateRows()"
      [style.gap]="gap()"
    >
      @for (cell of sortedCells(); track cell.id) {
        <lib-board-cell
          [cell]="cell"
          [readonly]="true"
          [style.gridColumn]="boardService.getCellGridColumn(cell)"
          [style.gridRow]="boardService.getCellGridRow(cell)"
        />
      }
    </div>
  `,
  styles: `
    lib-board-viewer {
      display: block;
    }

    lib-board-viewer .board-grid {
      min-height: 200px;
    }
  `,
})
export class BoardViewerComponent {
  protected readonly boardService = inject(BoardService);

  board = input.required<BoardData>();
  gap = input('0.5rem');

  protected sortedCells = computed(() =>
    this.boardService.sortCells(this.board().cells)
  );

  protected gridTemplateCols = computed(() =>
    this.boardService.getGridTemplateCols(this.board())
  );

  protected gridTemplateRows = computed(() =>
    this.boardService.getGridTemplateRows(this.board())
  );
}

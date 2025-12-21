import { Component, computed, inject, input } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { BoardViewerComponent } from '../board-viewer/board-viewer.component';

/**
 * Entity-aware wrapper for BoardViewerComponent.
 * Parses the entity content (JSON string) into BoardData for display.
 *
 * This component implements the EntityViewerInputs interface expected
 * by the EntityRendererService.
 */
@Component({
  selector: 'lib-board-entity-viewer',
  imports: [BoardViewerComponent],
  template: `
    <lib-board-viewer [board]="boardData()" />
  `,
})
export class BoardEntityViewerComponent {
  private readonly boardService = inject(BoardService);

  /** Entity object containing board data in the content field */
  entity = input.required<{ content?: string }>();

  protected readonly boardData = computed(() =>
    this.boardService.parseFromEntity(this.entity().content)
  );
}

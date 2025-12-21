import { Entity } from '@/entity';
import { I18nService } from '@/i18n';
import { Component, effect, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheck, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { boardBundle } from '../../board.i18n';
import { BoardData } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { BoardEditorComponent } from '../board-editor/board-editor.component';

/**
 * Entity-aware wrapper for BoardEditorComponent.
 * Handles parsing entity content and emitting save/cancel events
 * in the format expected by the compendium detail view.
 *
 * This component implements the EntityEditorInputs/Outputs interfaces
 * expected by the EntityRendererService.
 */
@Component({
  selector: 'lib-board-entity-editor',
  imports: [NgIcon, BoardEditorComponent],
  viewProviders: [provideIcons({ phosphorCheck, phosphorX })],
  template: `
    <div class="h-full flex flex-col">
      <!-- Toolbar -->
      <div
        class="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50"
      >
        <span class="text-sm font-medium">{{ t('editBoard') }}</span>
        <div class="flex gap-2">
          <button
            class="btn btn-ghost btn-sm"
            (click)="handleCancel()"
            [disabled]="isSaving()"
          >
            <ng-icon name="phosphorX" class="text-base" />
            {{ t('cancel') }}
          </button>
          <button
            class="btn btn-primary btn-sm"
            (click)="handleSave()"
            [disabled]="isSaving()"
          >
            @if (isSaving()) {
              <span class="loading loading-spinner loading-xs"></span>
            } @else {
              <ng-icon name="phosphorCheck" class="text-base" />
            }
            {{ t('save') }}
          </button>
        </div>
      </div>

      <!-- Board Editor -->
      <div class="flex-1 overflow-auto p-4">
        <lib-board-editor [(board)]="boardData" />
      </div>
    </div>
  `,
})
export class BoardEntityEditorComponent {
  private readonly boardService = inject(BoardService);
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(boardBundle);

  /** Entity object containing board data in the content field */
  entity = input.required<Entity>();

  /** Whether a save operation is in progress */
  isSaving = input(false);

  /** Save handler function passed as input (for NgComponentOutlet compatibility) */
  save = input.required<(updates: Partial<Entity>) => void>();

  /** Cancel handler function passed as input (for NgComponentOutlet compatibility) */
  cancel = input.required<() => void>();

  /** Working copy of the board data */
  protected boardData = signal<BoardData>(this.boardService.createEmptyBoard());

  constructor() {
    // Initialize board data from entity when it changes
    effect(() => {
      const content = this.entity().content;
      this.boardData.set(this.boardService.parseFromEntity(content));
    });
  }

  protected handleSave(): void {
    const serialized = this.boardService.serializeToEntity(this.boardData());
    this.save()({ content: serialized });
  }

  protected handleCancel(): void {
    this.cancel()();
  }
}

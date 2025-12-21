import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorCaretRight } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-compendium-pagination',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorCaretRight })],
  template: `
    @if (totalPages() > 1) {
      <div class="flex justify-center items-center gap-2 mt-8">
        <button
          class="btn btn-sm btn-ghost"
          [disabled]="currentPage() === 1"
          (click)="goToPage(currentPage() - 1)"
        >
          <ng-icon name="phosphorCaretLeft" />
        </button>

        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-2 text-base-content/40">...</span>
          } @else {
            <button
              class="btn btn-sm"
              [class.btn-primary]="page === currentPage()"
              [class.btn-ghost]="page !== currentPage()"
              (click)="goToPage(page)"
            >
              {{ page }}
            </button>
          }
        }

        <button
          class="btn btn-sm btn-ghost"
          [disabled]="currentPage() === totalPages()"
          (click)="goToPage(currentPage() + 1)"
        >
          <ng-icon name="phosphorCaretRight" />
        </button>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumPaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push(-1);
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push(-1);
      }

      pages.push(totalPages);
    }

    return pages;
  });

  protected goToPage(page: number): void {
    const totalPages = this.totalPages();
    if (page >= 1 && page <= totalPages) {
      this.pageChange.emit(page);
    }
  }
}

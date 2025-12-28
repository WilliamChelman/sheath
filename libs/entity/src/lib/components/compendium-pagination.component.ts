import { I18nService } from '@/i18n';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorCaretRight } from '@ng-icons/phosphor-icons/regular';
import { compendiumBundle } from '../compendium.i18n';

@Component({
  selector: 'app-compendium-pagination',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorCaretRight })],
  template: `
    @if (totalPages() > 1) {
      <nav
        class="flex justify-center items-center gap-1 sm:gap-2 mt-8 py-4"
        role="navigation"
        aria-label="Pagination"
      >
        <!-- Previous button -->
        <button
          class="btn btn-circle btn-sm sm:btn-md btn-ghost"
          [disabled]="currentPage() === 1"
          (click)="goToPage(currentPage() - 1)"
          [attr.aria-label]="t('pagination.previousPage')"
        >
          <ng-icon name="phosphorCaretLeft" class="text-lg" />
        </button>

        <!-- Page numbers -->
        <div class="flex items-center gap-1">
          @for (page of visiblePages(); track $index) {
            @if (page === -1) {
              <span class="px-2 text-base-content/40 select-none" aria-hidden="true">...</span>
            } @else {
              <button
                class="btn btn-sm sm:btn-md min-w-[2.5rem] sm:min-w-[3rem] transition-all duration-200"
                [class.btn-primary]="page === currentPage()"
                [class.shadow-md]="page === currentPage()"
                [class.btn-ghost]="page !== currentPage()"
                [class.hover:btn-primary]="page !== currentPage()"
                [class.hover:btn-outline]="page !== currentPage()"
                (click)="goToPage(page)"
                [attr.aria-label]="t('pagination.goToPage', { page })"
                [attr.aria-current]="page === currentPage() ? 'page' : null"
              >
                {{ page }}
              </button>
            }
          }
        </div>

        <!-- Next button -->
        <button
          class="btn btn-circle btn-sm sm:btn-md btn-ghost"
          [disabled]="currentPage() === totalPages()"
          (click)="goToPage(currentPage() + 1)"
          [attr.aria-label]="t('pagination.nextPage')"
        >
          <ng-icon name="phosphorCaretRight" class="text-lg" />
        </button>
      </nav>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumPaginationComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(compendiumBundle);

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

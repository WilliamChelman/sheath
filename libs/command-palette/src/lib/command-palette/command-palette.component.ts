import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorMagnifyingGlass,
  phosphorCommand,
  phosphorCaretRight,
} from '@ng-icons/phosphor-icons/regular';
import { I18nService } from '@/i18n';
import { CommandRegistryService } from './command-registry.service';
import { commandPaletteBundle } from './command-palette.i18n';
import type { Command } from './models';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [NgIcon, NgClass],
  viewProviders: [
    provideIcons({
      phosphorMagnifyingGlass,
      phosphorCommand,
      phosphorCaretRight,
    }),
  ],
  template: `
    <button
      type="button"
      class="btn btn-ghost btn-sm gap-2 hidden lg:flex"
      (click)="open()"
      [attr.aria-label]="t('openButton')"
    >
      <ng-icon name="phosphorMagnifyingGlass" class="text-base"></ng-icon>
      <span class="text-base-content/60 text-xs">{{ t('searchLabel') }}</span>
      <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">⌘K</kbd>
    </button>

    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialogRef
      class="modal modal-top"
      (click)="onBackdropClick($event)"
      (cancel)="close()"
    >
      <div
        class="modal-box max-w-2xl mt-[10vh] mx-auto bg-base-100 shadow-2xl border border-base-300 p-0 overflow-hidden"
      >
        <!-- Search input -->
        <div class="flex items-center gap-3 px-4 py-3 border-b border-base-300">
          <ng-icon
            name="phosphorMagnifyingGlass"
            class="text-xl text-base-content/50"
          ></ng-icon>
          <input
            #searchInput
            type="text"
            class="flex-1 bg-transparent outline-none text-lg placeholder:text-base-content/40"
            [placeholder]="t('searchPlaceholder')"
            [value]="query()"
            (input)="onSearchInput($event)"
            (keydown)="onInputKeydown($event)"
            autocomplete="off"
            spellcheck="false"
          />
          <kbd class="kbd kbd-sm bg-base-200 border-base-content/20 text-xs"
            >ESC</kbd
          >
        </div>

        <!-- Results -->
        <div #resultsContainer class="max-h-[60vh] overflow-y-auto">
          @if (commands().length > 0) {
            <ul class="p-2">
              @for (command of commands(); track command.id; let i = $index) {
                <li>
                  <button
                    type="button"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full"
                    [ngClass]="{
                      'bg-primary text-primary-content': selectedIndex() === i,
                      'hover:bg-base-200': selectedIndex() !== i,
                    }"
                    (click)="executeCommand(command, $event)"
                    (mouseenter)="setSelectedIndex(i)"
                  >
                    @if (command.icon) {
                      <ng-icon
                        [name]="command.icon"
                        class="text-lg shrink-0"
                      ></ng-icon>
                    } @else {
                      <ng-icon
                        name="phosphorCaretRight"
                        class="text-lg shrink-0"
                        [ngClass]="
                          selectedIndex() === i
                            ? 'text-primary-content/70'
                            : 'text-base-content/50'
                        "
                      ></ng-icon>
                    }
                    <div class="flex-1 text-left min-w-0">
                      <div class="font-medium truncate">
                        {{ command.label }}
                      </div>
                      @if (command.description) {
                        <div
                          class="text-sm truncate"
                          [ngClass]="
                            selectedIndex() === i
                              ? 'text-primary-content/70'
                              : 'text-base-content/60'
                          "
                        >
                          {{ command.description }}
                        </div>
                      }
                    </div>
                    @if (command.category) {
                      <span
                        class="badge badge-sm"
                        [ngClass]="
                          selectedIndex() === i
                            ? 'badge-primary'
                            : 'badge-ghost'
                        "
                      >
                        {{ command.category }}
                      </span>
                    }
                  </button>
                </li>
              }
            </ul>
          } @else if (query().trim()) {
            <div class="p-8 text-center text-base-content/50">
              <ng-icon
                name="phosphorMagnifyingGlass"
                class="text-4xl mb-2 opacity-50"
              ></ng-icon>
              <p>{{ t('noResults', { query: query() }) }}</p>
            </div>
          } @else {
            <div class="p-8 text-center text-base-content/50">
              <ng-icon
                name="phosphorCommand"
                class="text-4xl mb-2 opacity-50"
              ></ng-icon>
              <p>{{ t('emptyState') }}</p>
            </div>
          }
        </div>

        <!-- Footer hint -->
        <div
          class="flex items-center justify-between px-4 py-2 border-t border-base-300 text-xs text-base-content/50 bg-base-200/50"
        >
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1">
              <kbd class="kbd kbd-xs">↑</kbd>
              <kbd class="kbd kbd-xs">↓</kbd>
              {{ t('hints.navigate') }}
            </span>
            <span class="flex items-center gap-1">
              <kbd class="kbd kbd-xs">↵</kbd>
              {{ t('hints.select') }}
            </span>
          </div>
          <span class="flex items-center gap-1">
            <kbd class="kbd kbd-xs">ESC</kbd>
            {{ t('hints.close') }}
          </span>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop bg-black/50">
        <button type="button" (click)="close()">close</button>
      </form>
    </dialog>
  `,
  styles: `
    :host {
      display: contents;
    }

    dialog {
      transition: none !important;
    }

    dialog::backdrop {
      transition: none !important;
    }

    .modal-box {
      animation: slideDown 0.15s ease-out;
      transition: none !important;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `,
})
export class CommandPaletteComponent {
  private readonly registry = inject(CommandRegistryService);
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(commandPaletteBundle);

  private readonly dialogRef =
    viewChild<ElementRef<HTMLDialogElement>>('dialogRef');
  private readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly resultsContainerRef =
    viewChild<ElementRef<HTMLDivElement>>('resultsContainer');

  /** Current search query */
  readonly query = signal<string>('');

  /** Currently selected command index */
  readonly selectedIndex = signal<number>(0);

  /** Whether the dialog is open */
  readonly isOpen = signal<boolean>(false);

  /** Commands from search */
  private readonly query$ = toObservable(this.query);
  private readonly searchResults = toSignal(
    this.query$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((q) => this.registry.search(q)),
    ),
    { initialValue: [] as Command[] },
  );

  readonly commands = computed(() => this.searchResults());

  constructor() {
    // Reset selection when commands change
    effect(() => {
      const cmds = this.commands();
      if (cmds.length > 0) {
        this.selectedIndex.set(0);
      }
    });

    // Scroll selected item into view
    effect(() => {
      const index = this.selectedIndex();
      const container = this.resultsContainerRef()?.nativeElement;
      if (container && this.commands().length > 0) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          const buttons = container.querySelectorAll<HTMLButtonElement>(
            'button[type="button"]',
          );
          const selectedButton = buttons[index];
          if (selectedButton) {
            selectedButton.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }, 0);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    // Ctrl+K or Cmd+K to open
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    }
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (dialog) {
      dialog.showModal();
      this.isOpen.set(true);
      this.query.set('');
      this.selectedIndex.set(0);
      // Focus the input after dialog opens
      setTimeout(() => {
        this.searchInputRef()?.nativeElement.focus();
      }, 0);
    }
  }

  close(): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (dialog) {
      dialog.close();
      this.isOpen.set(false);
      this.query.set('');
    }
  }

  onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (event.target === dialog) {
      this.close();
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.query.set(input.value);
  }

  onInputKeydown(event: KeyboardEvent): void {
    const commands = this.commands();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (commands.length > 0) {
          this.selectedIndex.update((i) => (i + 1) % commands.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (commands.length > 0) {
          this.selectedIndex.update(
            (i) => (i - 1 + commands.length) % commands.length,
          );
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const selected = commands[this.selectedIndex()];
        if (selected) {
          this.executeCommand(selected, event);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  executeCommand(command: Command, event: MouseEvent | KeyboardEvent): void {
    this.close();
    command.callback(event);
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex.set(index);
  }
}

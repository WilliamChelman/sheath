import {
  Component,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPlus, phosphorTag, phosphorX } from '@ng-icons/phosphor-icons/regular';
import { I18nService } from '@/i18n';
import { compendiumDetailBundle } from '../../compendium-detail.i18n';

@Component({
  selector: 'app-inline-metadata',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorTag, phosphorX, phosphorPlus })],
  template: `
    <div class="inline-metadata p-6 border-b border-base-300">
      <!-- Entity Type Badge -->
      <div class="mb-2">
        <span class="badge badge-primary badge-outline font-medium">
          {{ entityType() }}
        </span>
      </div>

      <!-- Editable Name as H1 -->
      <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
      <h1
        #nameRef
        contenteditable="true"
        spellcheck="false"
        class="text-3xl md:text-4xl font-black tracking-tight text-base-content outline-none focus:ring-2 focus:ring-primary/30 rounded px-1 -mx-1"
        [textContent]="name()"
        (input)="onNameChange()"
        (keydown.enter)="$event.preventDefault(); descriptionRef.focus()"
        (blur)="onNameBlur()"
      ></h1>

      <!-- Editable Description -->
      <p
        #descriptionRef
        contenteditable="true"
        spellcheck="false"
        class="mt-2 text-base-content/70 outline-none focus:ring-2 focus:ring-primary/30 rounded min-h-[1.5em] px-1 -mx-1 empty:before:content-[attr(data-placeholder)] empty:before:text-base-content/40 empty:before:italic"
        [attr.data-placeholder]="t('edit.descriptionLabel') + '...'"
        [textContent]="description()"
        (input)="onDescriptionChange()"
        (blur)="onDescriptionBlur()"
      ></p>

      <!-- Inline Tags -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <ng-icon name="phosphorTag" class="text-base-content/50" />
        @for (tag of tags(); track tag; let i = $index) {
          <span
            class="badge badge-outline gap-1 group hover:border-error hover:text-error transition-colors cursor-default"
          >
            {{ tag }}
            <button
              type="button"
              class="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              (click)="removeTag(i)"
              [attr.aria-label]="'Remove tag: ' + tag"
            >
              <ng-icon name="phosphorX" class="text-xs" />
            </button>
          </span>
        }

        <!-- Add Tag Input -->
        @if (isAddingTag()) {
          <input
            #newTagInput
            type="text"
            class="input input-bordered input-xs w-24 focus:w-32 transition-all"
            [placeholder]="t('edit.tagsPlaceholder')"
            (keydown.enter)="addTag(newTagInput.value); newTagInput.value = ''"
            (keydown.escape)="isAddingTag.set(false)"
            (blur)="onNewTagBlur(newTagInput)"
          />
        } @else {
          <button
            type="button"
            class="badge badge-ghost hover:badge-primary transition-colors"
            (click)="startAddingTag()"
            [attr.aria-label]="t('edit.tagsPlaceholder')"
          >
            <ng-icon name="phosphorPlus" class="text-xs" />
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    app-inline-metadata {
      display: block;
    }

    [contenteditable='true']:empty:before {
      pointer-events: none;
    }
  `,
})
export class InlineMetadataComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(compendiumDetailBundle);

  entityType = input.required<string>();
  name = model.required<string>();
  description = model('');
  tags = model<string[]>([]);

  protected isAddingTag = signal(false);

  private nameRef = viewChild<ElementRef<HTMLHeadingElement>>('nameRef');
  private newTagInput = viewChild<ElementRef<HTMLInputElement>>('newTagInput');

  protected onNameChange(): void {
    // Don't update model on every keystroke to avoid cursor jumping
    // Only update on blur
  }

  protected onNameBlur(): void {
    const el = this.nameRef()?.nativeElement;
    if (el) {
      const text = el.textContent?.trim() ?? '';
      if (text && text !== this.name()) {
        this.name.set(text);
      } else if (!text) {
        // Restore previous value if empty
        el.textContent = this.name();
      }
    }
  }

  protected onDescriptionChange(): void {
    // Don't update model on every keystroke
  }

  protected onDescriptionBlur(): void {
    const target = document.activeElement;
    if (
      target instanceof HTMLElement &&
      target.hasAttribute('contenteditable')
    ) {
      return;
    }
    const el = document.querySelector(
      'app-inline-metadata [contenteditable]:nth-of-type(2)',
    ) as HTMLElement | null;
    if (el) {
      const text = el.textContent?.trim() ?? '';
      if (text !== this.description()) {
        this.description.set(text);
      }
    }
  }

  protected startAddingTag(): void {
    this.isAddingTag.set(true);
    // Focus the input after it renders
    setTimeout(() => {
      this.newTagInput()?.nativeElement.focus();
    }, 0);
  }

  protected addTag(value: string): void {
    const tag = value.trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update((t) => [...t, tag]);
    }
    this.isAddingTag.set(false);
  }

  protected removeTag(index: number): void {
    this.tags.update((t) => t.filter((_, i) => i !== index));
  }

  protected onNewTagBlur(input: HTMLInputElement): void {
    const value = input.value.trim();
    if (value) {
      this.addTag(value);
    } else {
      this.isAddingTag.set(false);
    }
  }
}

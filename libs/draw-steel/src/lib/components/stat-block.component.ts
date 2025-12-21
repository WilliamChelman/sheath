import { Component, computed, input } from '@angular/core';
import { Entity } from '@/entity';

/**
 * Example markdown component that renders a stat block.
 *
 * Usage in markdown:
 * ```component:stat-block
 * might: 2
 * agility: 1
 * reason: 0
 * intuition: 1
 * presence: -1
 * ```
 */
@Component({
  selector: 'app-stat-block',
  template: `
    <div
      class="stat-block-component rounded-lg border border-base-300 bg-base-200/50 p-4 my-4"
    >
      @if (entity(); as ent) {
        <div class="text-xs text-base-content/50 mb-2">
          Stats for: {{ ent.name }}
        </div>
      }
      <div class="grid grid-cols-5 gap-2 text-center">
        @for (stat of stats(); track stat.name) {
          <div class="flex flex-col items-center">
            <span
              class="text-lg font-bold"
              [class]="stat.value >= 0 ? 'text-success' : 'text-error'"
            >
              {{ stat.value >= 0 ? '+' : '' }}{{ stat.value }}
            </span>
            <span class="text-xs text-base-content/60 uppercase tracking-wide">
              {{ stat.name }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
})
export class StatBlockComponent {
  /** Entity context (auto-injected if available) */
  entity = input<Entity>();

  /** Stat values from markdown inputs */
  might = input<number>(0);
  agility = input<number>(0);
  reason = input<number>(0);
  intuition = input<number>(0);
  presence = input<number>(0);

  protected readonly stats = computed(() => [
    { name: 'Might', value: this.might() },
    { name: 'Agility', value: this.agility() },
    { name: 'Reason', value: this.reason() },
    { name: 'Intuition', value: this.intuition() },
    { name: 'Presence', value: this.presence() },
  ]);
}

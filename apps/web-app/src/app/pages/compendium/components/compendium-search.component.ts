import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-compendium-search',
  standalone: true,
  imports: [FormsModule, NgIcon],
  viewProviders: [provideIcons({ heroMagnifyingGlass })],
  template: `
    <div class="relative mb-6">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10"
      >
        <ng-icon
          name="heroMagnifyingGlass"
          class="text-xl text-base-content/50"
        />
      </div>
      <input
        type="text"
        [ngModel]="query()"
        (ngModelChange)="queryChange.emit($event)"
        [placeholder]="placeholder()"
        class="input input-bordered input-lg w-full pl-12 bg-base-100/80 backdrop-blur-sm border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumSearchComponent {
  readonly query = input<string>('');
  readonly placeholder = input<string>('Search...');
  readonly queryChange = output<string>();
}

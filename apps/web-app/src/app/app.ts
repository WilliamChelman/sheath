import { TourOverlayComponent } from '@/ui/tour';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, TourOverlayComponent],
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-tour-overlay />
  `,
})
export class App {}

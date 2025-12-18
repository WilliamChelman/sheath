import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <h1 class="text-3xl font-bold underline">Hello world!</h1>
    <button class="btn btn-primary">Button</button>
    <router-outlet></router-outlet>
  `,
})
export class App {}

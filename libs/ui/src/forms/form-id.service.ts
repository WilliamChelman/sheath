import { Injectable } from '@angular/core';

let counter = 0;
const session = Math.random().toString(36).slice(2, 8);

@Injectable({ providedIn: 'root' })
export class FormIdService {
  next(prefix = 'field'): string {
    counter += 1;
    return `${prefix}-${session}-${counter}`;
  }
}

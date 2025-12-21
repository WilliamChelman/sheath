import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string): void {
    this.show({ type: 'success', message });
  }

  error(message: string): void {
    this.show({ type: 'error', message });
  }

  info(message: string): void {
    this.show({ type: 'info', message });
  }

  warning(message: string): void {
    this.show({ type: 'warning', message });
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = crypto.randomUUID();
    this._toasts.update((t) => [...t, { ...toast, id }]);

    setTimeout(() => {
      this.dismiss(id);
    }, 5000);
  }

  dismiss(id: string): void {
    this._toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

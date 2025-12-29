import { ErrorHandler, inject, Injectable, Provider } from '@angular/core';
import { ToastService } from '@/ui/toast';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  private readonly toastService = inject(ToastService);

  handleError(error: unknown): void {
    console.error('Uncaught error:', error);

    const message = this.extractErrorMessage(error);
    this.toastService.error(message);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message || 'An unexpected error occurred';
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }
}

export function provideCustomErrorHandler(): Provider {
  return {
    provide: ErrorHandler,
    useClass: CustomErrorHandler,
  };
}

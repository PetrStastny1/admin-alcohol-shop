import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', timeout = 3000) {
    const toast: Toast = { id: ++this.counter, message, type };
    this._toasts.update(list => [...list, toast]);

    setTimeout(() => this.dismiss(toast.id), timeout);
  }

  success(message: string, timeout = 3000) {
    this.show(message, 'success', timeout);
  }

  error(message: string, timeout = 3000) {
    this.show(message, 'error', timeout);
  }

  info(message: string, timeout = 3000) {
    this.show(message, 'info', timeout);
  }

  dismiss(id: number) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}

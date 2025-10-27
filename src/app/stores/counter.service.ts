import { Injectable, signal } from '@angular/core';
import { CounterState, counterStore } from './counter.store';

@Injectable({ providedIn: 'root' })
export class CounterService {
  private store = counterStore;
  private readonly _state = signal(this.store.getState());

  public readonly state = this._state.asReadonly();

  constructor() {
    this.store.subscribe((newState: CounterState) => {
      this._state.set(newState);
    });
  }

  increment() {
    this.store.getState().increment();
  }

  decrement() {
    this.store.getState().decrement();
  }
}

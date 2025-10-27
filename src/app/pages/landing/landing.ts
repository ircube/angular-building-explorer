import { Component, inject } from '@angular/core';
import { CounterService } from '../../stores/counter.service';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  protected readonly counterService = inject(CounterService);
}

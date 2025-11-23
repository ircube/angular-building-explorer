import { Component, inject } from '@angular/core';
import { CounterService } from '../../stores/counter.service';
import { TranslatePipe } from '../../i18n.pipe';

@Component({
  selector: 'app-landing',
  imports: [TranslatePipe],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  protected readonly counterService = inject(CounterService);
}

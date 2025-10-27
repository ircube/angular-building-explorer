import { Component, inject } from '@angular/core';
import { CounterService } from '../../stores/counter.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  protected readonly counterService = inject(CounterService);
}

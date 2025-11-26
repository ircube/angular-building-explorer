import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../i18n.pipe';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, I18nPipe],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  // Any component specific logic
}

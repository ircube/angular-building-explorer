import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../i18n.pipe';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, I18nPipe],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class ContactComponent {
  // Any component specific logic
}

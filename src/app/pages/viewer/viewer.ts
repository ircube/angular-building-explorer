import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../i18n.pipe';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, I18nPipe],
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss']
})
export class ViewerComponent {
  // Any component specific logic
}

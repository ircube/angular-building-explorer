import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../i18n.pipe';

@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [CommonModule, I18nPipe],
  templateUrl: './buildings.html',
  styleUrls: ['./buildings.scss']
})
export class BuildingsComponent {
  // Any component specific logic
}

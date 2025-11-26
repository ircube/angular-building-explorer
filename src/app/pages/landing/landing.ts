import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../i18n.pipe';
import { ThreeDViewerComponent } from '../../three-d/three-d-viewer.component'; // Import the 3D viewer component

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, I18nPipe, ThreeDViewerComponent], // Add ThreeDViewerComponent here
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  // Any component specific logic
}

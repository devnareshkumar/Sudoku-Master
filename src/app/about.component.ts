import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  host: {
    // block layout with a comfortable top margin so it sits below the game safely
    class: 'block w-full mt-16 mb-8 px-4 sm:px-6' 
  }
})
export class AboutComponent {}
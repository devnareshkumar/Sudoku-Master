import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, BookOpen, Lightbulb, HelpCircle, CheckCircle2, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-how-to-play',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './how-to-play.component.html',
  host: {
    class: 'block w-full mt-4 mb-8 px-4 sm:px-6'
  }
})
export class HowToPlayComponent {
    readonly ArrowLeft = ArrowLeft;
    readonly BookOpen = BookOpen;
    readonly Lightbulb = Lightbulb;
    readonly HelpCircle = HelpCircle;
    readonly CheckCircle2 = CheckCircle2;
}
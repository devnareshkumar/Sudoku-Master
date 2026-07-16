import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, RotateCcw } from 'lucide-angular';

@Component({
  selector: 'app-number-pad',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  styleUrl: './number-pad.component.css',
  template: `
    <div class="number-pad-row">
      @for (n of [1,2,3,4,5,6,7,8,9]; track n) {
        <button class="numpad-btn" [class.complete]="isNumberComplete(n)" (click)="numberSelect.emit(n)">
          {{ n }}
        </button>
      }
    </div>
  `
})
export class NumberPadComponent {
  @Input() isNumberComplete!: (n: number) => boolean;
  @Output() numberSelect = new EventEmitter<number>();
  @Output() resetBoard = new EventEmitter<void>();

  readonly RotateCcw = RotateCcw;
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, RotateCcw } from 'lucide-angular';

@Component({
  selector: 'app-number-pad',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-center">
        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Input</span>
        <button (click)="resetBoard.emit()" class="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <lucide-icon [name]="RotateCcw" size="10"></lucide-icon>
          Reset Board
        </button>
      </div>
      <div class="grid grid-cols-3 gap-3">
        @for (n of [1,2,3,4,5,6,7,8,9]; track n) {
          <button
            (click)="numberSelect.emit(n)"
            class="numpad-btn"
            [disabled]="isNumberComplete(n)"
          >
            {{ n }}
          </button>
        }
      </div>
    </div>
  `
})
export class NumberPadComponent {
  @Input() isNumberComplete!: (n: number) => boolean;
  @Output() numberSelect = new EventEmitter<number>();
  @Output() resetBoard = new EventEmitter<void>();

  readonly RotateCcw = RotateCcw;
}

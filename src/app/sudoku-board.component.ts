import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Play } from 'lucide-angular';
import type { SudokuCell } from './models/game-state';

@Component({
  selector: 'app-sudoku-board',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  styleUrl: './sudoku-board.component.css',
  template: `
    <div class="sudoku-grid shadow-2xl rounded-sm overflow-hidden bg-white">
      @for (cell of cells; track $index) {
        <div
          class="sudoku-cell"
          [class]="cellClass?.($index) ?? ''"
          [attr.data-index]="$index"
          (click)="cellSelect.emit($index)"
          tabindex="0"
          role="button"
        >
          @if (cell.value !== null) {
            {{ cell.value }}
          } @else {
            <div class="notes-grid">
              @for (n of [1,2,3,4,5,6,7,8,9]; track n) {
                <div class="note-digit">
                  {{ cell.notes.has(n) ? n : '' }}
                </div>
              }
            </div>
          }

          @if (currentHintIndex === $index && showHintModal) {
            <div class="absolute inset-0 bg-green-500 text-white flex items-center justify-center font-bold z-10 animate-in fade-in duration-300"></div>
          }
        </div>
      }
    </div>

    @if (isPaused) {
      <div class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
        <button (click)="resumeGame.emit()" class="p-6 bg-blue-600 text-white rounded-full shadow-xl hover:scale-110 transition-transform">
          <lucide-icon [name]="Play" size="48"></lucide-icon>
        </button>
        <p class="mt-4 font-bold text-xl text-slate-800">Paused</p>
      </div>
    }
  `
})
export class SudokuBoardComponent {
  @Input() cells: readonly SudokuCell[] = [];
  @Input() selectedCellIndex: number | null = null;
  @Input() currentHintIndex: number | null = null;
  @Input() hintStep = 0;
  @Input() showHintModal = false;
  @Input() isPaused = false;
  @Input() cellClass: ((index: number) => string) | null = null;
  @Output() cellSelect = new EventEmitter<number>();
  @Output() resumeGame = new EventEmitter<void>();

  readonly Play = Play;
}

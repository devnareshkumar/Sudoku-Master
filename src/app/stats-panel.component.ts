import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pause, RotateCcw, ChevronDown, Trophy } from 'lucide-angular';
import type { Difficulty } from './models/game-state';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  styles: [`
    .ios-dropdown {
      transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.15s ease-out;
      -webkit-tap-highlight-color: transparent;
      transform-origin: left center;
    }
    .ios-dropdown:active {
      transform: scale(0.92);
      opacity: 0.6;
    }
    .new-game-btn {
      transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.15s ease-out;
      -webkit-tap-highlight-color: transparent;
    }
    .new-game-btn:active {
      transform: scale(0.92);
      opacity: 0.8;
    }
  `],
  template: `
    <!-- RESTORED: Classic Header Row -->
    <div class="flex items-center justify-between w-full px-1 mb-5 relative">
      <h1 class="text-2xl font-bold tracking-tight text-app-ink">SudokuStudio</h1>
      
      <!-- Restored Custom Dropdown Wrapper -->
      <div>
          <button class="new-game-btn bg-app-accent text-app-surface px-4 py-1.5 rounded-full text-sm font-bold tracking-wider cursor-pointer z-50 relative"
                  (click)="difficultyMenuOpen = !difficultyMenuOpen">
            NEW GAME
          </button>

          <!-- Invisible backdrop to close the menu when clicking outside -->
          @if (difficultyMenuOpen) {
            <div class="fixed inset-0 z-40" (click)="difficultyMenuOpen = false"></div>
          }

          <!-- Custom Difficulty Menu -->
          @if (difficultyMenuOpen) {
            <div class="absolute right-1 top-10 mt-1 w-36 bg-app-surface border border-app-line rounded-xl shadow-lg z-50 py-1 overflow-hidden flex flex-col">
              @for (d of difficulties; track d) {
                <button class="px-4 py-2 text-left text-sm font-semibold capitalize hover:bg-app-line/30 transition-colors text-app-ink cursor-pointer"
                        (click)="selectDifficulty(d)">
                  {{ d }}
                </button>
              }
            </div>
          }
      </div>
    </div>

    <!-- RESTORED: Classic Stats Row (with Score seamlessly integrated) -->
    <div class="flex items-end justify-between w-full px-2 mb-2">
      
      <!-- Difficulty -->
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold text-app-ink/50 tracking-wider uppercase">Difficulty</span>
        <div class="relative ios-dropdown -ml-1">
          <select class="appearance-none bg-transparent pl-1 pr-6 py-0.5 text-app-ink font-semibold focus:outline-none cursor-pointer capitalize"
                  [value]="difficulty"
                  (change)="onDifficultyChange($event)">
              @for (d of difficulties; track d) {
                  <option [value]="d">{{ d }}</option>
              }
          </select>
          <lucide-icon [img]="ChevronDown" class="absolute right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-ink opacity-40 pointer-events-none"></lucide-icon>
        </div>
      </div>

      <!-- Mistakes -->
      <div class="flex flex-col gap-1 items-center">
        <span class="text-[10px] font-bold text-app-ink/50 tracking-wider uppercase">Mistakes</span>
        <span class="font-semibold text-app-ink" [class.text-app-error]="mistakes > 0">{{ mistakes }}/3</span>
      </div>

      <!-- NEW: Score -->
      <div class="flex flex-col gap-1 items-center">
        <span class="text-[10px] font-bold text-app-ink/50 tracking-wider uppercase">Score</span>
        <div class="flex items-center gap-1 font-semibold text-app-accent">
          <lucide-icon [img]="Trophy" class="w-3.5 h-3.5"></lucide-icon>
          <span>{{ score }}</span>
        </div>
      </div>

      <!-- Controls & Timer -->
      <div class="flex items-center gap-3 text-app-ink pb-0.5">
        <button class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" (click)="resetGame.emit()">
          <lucide-icon [img]="RotateCcw" class="w-4 h-4"></lucide-icon>
        </button>
        <button class="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" (click)="pauseGame.emit()">
          <lucide-icon [img]="Pause" class="w-4 h-4"></lucide-icon>
        </button>
        <span class="font-mono font-medium text-lg w-[45px] text-right">{{ formatTime(timerSeconds) }}</span>
      </div>

    </div>
  `
})
export class StatsPanelComponent {
  @Input() score = 0;
  @Input() mistakes = 0;
  @Input() timerSeconds = 0;
  @Input() difficulty: Difficulty = 'easy';

  @Output() pauseGame = new EventEmitter<void>();
  @Output() newGame = new EventEmitter<void>(); 
  @Output() resetGame = new EventEmitter<void>();
  @Output() difficultyChange = new EventEmitter<Difficulty>();

  readonly Pause = Pause;
  readonly RotateCcw = RotateCcw;
  readonly ChevronDown = ChevronDown;
  readonly Trophy = Trophy;

  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  // --- RESTORED: Custom Dropdown State ---
  difficultyMenuOpen = false;

  selectDifficulty(diff: Difficulty) {
    this.difficultyMenuOpen = false;
    this.difficultyChange.emit(diff);
  }
  // ---------------------------------------

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDifficultyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.difficultyChange.emit(select.value as Difficulty);
    select.value = this.difficulty;
  }
}
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Pause, RotateCcw, ChevronDown, Trophy, Info } from 'lucide-angular';
import type { Difficulty } from './models/game-state';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
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
    <!-- Header Row -->
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-app-ink tracking-tight">SudokuStudio</h1>
      
      <!-- App-Level Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <a routerLink="/how-to-play" 
           class="flex items-center justify-center p-2 text-app-ink/60 hover:text-app-accent hover:bg-app-highlight transition-all rounded-full cursor-pointer" 
           title="How to Play & Rules" 
           aria-label="How to Play & Rules">
          <lucide-icon [img]="Info" class="w-6 h-6"></lucide-icon>
        </a>
        <button (click)="newGame.emit()" class="new-game-btn bg-app-accent hover:opacity-90 text-white font-bold py-2 sm:py-2.5 px-4 sm:px-6 rounded-full shadow-sm text-sm sm:text-base">
          NEW GAME
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="flex items-center justify-between text-app-ink/80 text-xs sm:text-sm font-medium px-1">
      
      <!-- Difficulty Selector -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[0.65rem] sm:text-xs font-bold tracking-wider text-app-ink/40 uppercase">DIFFICULTY</span>
        <div class="relative ios-dropdown">
          <select 
            [value]="difficulty" 
            (change)="onDifficultyChange($event)"
            class="appearance-none bg-transparent font-bold text-app-ink text-sm sm:text-base pr-5 outline-none cursor-pointer focus:ring-0">
            @for (d of difficulties; track d) {
              <option [value]="d" class="capitalize">{{ d }}</option>
            }
          </select>
          <lucide-icon [img]="ChevronDown" class="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-app-ink/40"></lucide-icon>
        </div>
      </div>

      <!-- Mistakes -->
      <div class="flex flex-col gap-0.5 items-center">
        <span class="text-[0.65rem] sm:text-xs font-bold tracking-wider text-app-ink/40 uppercase">MISTAKES</span>
        <span class="font-bold text-app-ink text-sm sm:text-base">{{ mistakes }}/3</span>
      </div>

      <!-- Score & Active Game Controls -->
      <div class="flex flex-col gap-0.5 items-end">
        <span class="text-[0.65rem] sm:text-xs font-bold tracking-wider text-app-ink/40 uppercase pr-1">SCORE</span>
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="flex items-center gap-1.5 text-app-accent font-bold">
            <lucide-icon [img]="Trophy" class="w-4 h-4"></lucide-icon>
            {{ score }}
          </div>
          
          <!-- In-Game Controls -->
          <div class="flex items-center gap-1">
            <button (click)="resetGame.emit()" class="flex items-center justify-center p-1.5 text-app-ink/60 hover:text-app-ink transition-colors" title="Reset Game" aria-label="Reset Game">
              <lucide-icon [img]="RotateCcw" class="w-[1.15rem] h-[1.15rem]"></lucide-icon>
            </button>
            <button (click)="pauseGame.emit()" class="flex items-center justify-center p-1.5 text-app-ink/60 hover:text-app-ink transition-colors" title="Pause Game" aria-label="Pause Game">
              <lucide-icon [img]="Pause" class="w-[1.15rem] h-[1.15rem]"></lucide-icon>
            </button>
            <span class="font-mono text-app-ink font-bold ml-1 text-sm sm:text-base w-12 text-right">{{ formatTime(timerSeconds) }}</span>
          </div>
        </div>
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
  readonly Info = Info;

  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  
  difficultyMenuOpen = false;

  selectDifficulty(diff: Difficulty) {
    this.difficultyMenuOpen = false;
    this.difficultyChange.emit(diff);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDifficultyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.difficultyChange.emit(select.value as Difficulty);
    // Reset the select value back to the input property so it behaves as a controlled component
    select.value = this.difficulty;
  }
}
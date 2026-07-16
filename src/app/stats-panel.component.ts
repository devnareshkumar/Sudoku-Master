import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pause, RotateCcw, ChevronDown } from 'lucide-angular';
import type { Difficulty } from './models/game-state';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <div class="flex flex-col w-full px-2 mb-1 gap-3">
      
      <!-- TOP ROW: New Game Button (Aligned Right) -->
      <div class="flex justify-end w-full mt-1">
        <button (click)="newGame.emit()" class="px-6 py-1.5 bg-app-accent text-white rounded-full text-sm font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all">
          New Game
        </button>
      </div>

      <!-- BOTTOM ROW: Difficulty, Mistakes, Controls -->
      <div class="flex items-center justify-between w-full">
        
        <!-- Left: Difficulty Dropdown (Overlay Trick) -->
        <div class="flex flex-col">
          <span class="text-[0.65rem] font-bold tracking-widest uppercase opacity-50 text-app-ink">Difficulty</span>
          <div class="relative flex items-center cursor-pointer">
            <!-- Visual display that shrinks perfectly to the exact word length -->
            <div class="flex items-center gap-1 font-bold text-app-ink opacity-80 text-base pointer-events-none capitalize">
              {{ difficulty }}
              <lucide-icon [name]="ChevronDown" [size]="16" class="opacity-50 mt-0.5"></lucide-icon>
            </div>
            <!-- Invisible actual select box overlaying the text -->
            <select [value]="difficulty" (change)="onDifficultyChange($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        <!-- Middle: Mistakes -->
        <div class="flex flex-col items-center">
          <span class="text-[0.65rem] font-bold tracking-widest uppercase opacity-50 text-app-ink">Mistakes</span>
          <span class="font-mono text-lg font-bold text-app-ink opacity-80">{{ mistakes }}/3</span>
        </div>

        <!-- Right: Controls -->
        <div class="flex items-center gap-3 mt-3">
          <button (click)="resetGame.emit()" class="opacity-50 hover:opacity-100 transition-opacity text-app-ink flex items-center" title="Reset Board">
            <lucide-icon [name]="RotateCcw" [size]="20"></lucide-icon>
          </button>
          
          <button (click)="pauseGame.emit()" class="opacity-50 hover:opacity-100 transition-opacity text-app-ink flex items-center" title="Pause Game">
            <lucide-icon [name]="Pause" [size]="20"></lucide-icon>
          </button>
          
          <span class="font-mono text-xl font-bold tracking-widest text-app-ink opacity-80">{{ formatTime(timerSeconds) }}</span>
        </div>

      </div>
    </div>
  `
})
export class StatsPanelComponent {
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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDifficultyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.difficultyChange.emit(select.value as Difficulty);
  }
}
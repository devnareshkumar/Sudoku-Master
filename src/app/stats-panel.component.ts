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
  styles: [`
    /* Custom bounce for the difficulty wrapper */
    .ios-dropdown {
      transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.15s ease-out;
      -webkit-tap-highlight-color: transparent;
      transform-origin: left center;
    }
    .ios-dropdown:active {
      transform: scale(0.92);
      opacity: 0.6;
    }
    
    /* Button spring animation */
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
    <div class="flex flex-col w-full gap-3 px-2 mb-4">
      
      <!-- Top Row: New Game Button (Aligned Right) -->
      <div class="flex justify-end w-full">
        <button class="new-game-btn bg-app-accent text-app-surface px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[0.7rem] shadow-sm cursor-pointer"
                (click)="newGame.emit()">
          New Game
        </button>
      </div>

      <!-- Bottom Row: Stats -->
      <div class="flex justify-between items-end w-full">
        
        <!-- Difficulty Dropdown (Restored) -->
        <div class="flex flex-col gap-1">
          <span class="text-[0.65rem] font-bold text-app-ink opacity-50 uppercase tracking-widest">Difficulty</span>
          <div class="relative ios-dropdown flex items-center">
            <select class="appearance-none bg-transparent font-semibold text-app-ink capitalize text-sm pr-5 py-0 pl-0 cursor-pointer border-none outline-none focus:ring-0 m-0"
                    [value]="difficulty"
                    (change)="onDifficultyChange($event)">
              @for (d of difficulties; track d) {
                <option [value]="d" class="capitalize bg-app-surface text-app-ink">{{ d }}</option>
              }
            </select>
            <lucide-angular [img]="ChevronDown" class="w-3.5 h-3.5 absolute right-0 pointer-events-none opacity-60"></lucide-angular>
          </div>
        </div>

        <!-- Mistakes -->
        <div class="flex flex-col gap-1 text-center">
          <span class="text-[0.65rem] font-bold text-app-ink opacity-50 uppercase tracking-widest">Mistakes</span>
          <span class="font-semibold text-app-ink text-sm">{{ mistakes }}/3</span>
        </div>

        <!-- Timer & Controls -->
        <div class="flex flex-col gap-1 text-right">
          <span class="text-[0.65rem] font-bold text-app-ink opacity-50 uppercase tracking-widest text-transparent select-none">Time</span>
          <div class="font-semibold text-app-ink text-sm flex items-center justify-end gap-3">
             <button class="opacity-50 hover:opacity-100 transition-opacity active:scale-90 cursor-pointer" (click)="resetGame.emit()">
               <lucide-angular [img]="RotateCcw" class="w-4 h-4"></lucide-angular>
             </button>
             <button class="opacity-50 hover:opacity-100 transition-opacity active:scale-90 cursor-pointer" (click)="pauseGame.emit()">
               <lucide-angular [img]="Pause" class="w-4 h-4"></lucide-angular>
             </button>
             <span class="w-10 text-right font-mono tracking-tighter">{{ formatTime(timerSeconds) }}</span>
          </div>
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
  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDifficultyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.difficultyChange.emit(select.value as Difficulty);
    
    // Visually revert the dropdown immediately so it does not get stuck 
    // on the new value if the user cancels the "Are you sure?" modal.
    select.value = this.difficulty;
  }
}
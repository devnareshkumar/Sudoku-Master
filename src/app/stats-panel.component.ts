import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pause, RotateCcw, ChevronDown, Check } from 'lucide-angular';
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
      transform-origin: left center; /* Anchors the squish to the left side */
    }
    .ios-dropdown:active {
      transform: scale(0.92);
      opacity: 0.6;
    }
  `],
  template: `
    <div class="flex flex-col w-full px-2 mb-1 gap-3">
      
      <!-- TOP ROW: New Game Button (Cleaned up tailwind classes to inherit global CSS) -->
      <div class="flex justify-end w-full mt-1">
        <button (click)="newGame.emit()" class="px-6 py-1.5 bg-app-accent text-white rounded-full text-sm font-bold uppercase tracking-widest shadow-md">
          New Game
        </button>
      </div>

      <!-- BOTTOM ROW: Difficulty, Mistakes, Controls -->
      <div class="flex items-center justify-between w-full">
        
        <!-- Left: Difficulty Dropdown (custom menu, own trigger + panel) -->
        <div class="flex flex-col relative difficulty-dropdown-root">
          <span class="text-[0.65rem] font-bold tracking-widest uppercase opacity-50 text-app-ink">Difficulty</span>
          <button
            type="button"
            class="flex items-center gap-1 font-bold text-app-ink opacity-80 text-base capitalize ios-dropdown"
            [attr.aria-expanded]="difficultyMenuOpen"
            aria-haspopup="listbox"
            (click)="toggleDifficultyMenu()"
          >
            {{ difficulty }}
            <lucide-icon
              [name]="ChevronDown"
              [size]="16"
              class="opacity-50 mt-0.5 transition-transform duration-150"
              [class.rotate-180]="difficultyMenuOpen"
            ></lucide-icon>
          </button>

          @if (difficultyMenuOpen) {
            <div
              role="listbox"
              class="absolute left-0 top-full mt-1 z-20 w-36 rounded-2xl bg-app-surface border border-app-line shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              @for (d of difficulties; track d) {
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="d === difficulty"
                  class="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold capitalize text-app-ink hover:bg-app-bg transition-colors"
                  [class.bg-app-bg]="d === difficulty"
                  (click)="selectDifficulty(d)"
                >
                  {{ d }}
                  @if (d === difficulty) {
                    <lucide-icon [name]="Check" [size]="14" class="opacity-70"></lucide-icon>
                  }
                </button>
              }
            </div>
          }
        </div>

        <!-- Middle: Mistakes -->
        <div class="flex flex-col items-center">
          <span class="text-[0.65rem] font-bold tracking-widest uppercase opacity-50 text-app-ink">Mistakes</span>
          <span class="font-mono text-lg font-bold text-app-ink opacity-80">{{ mistakes }}/3</span>
        </div>

        <!-- Right: Controls -->
        <div class="flex items-center gap-4 mt-3">
          <button (click)="resetGame.emit()" class="opacity-60 hover:opacity-100 text-app-ink flex items-center" title="Reset Board">
            <lucide-icon [name]="RotateCcw" [size]="22"></lucide-icon>
          </button>
          
          <button (click)="pauseGame.emit()" class="opacity-60 hover:opacity-100 text-app-ink flex items-center" title="Pause Game">
            <lucide-icon [name]="Pause" [size]="22"></lucide-icon>
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
  readonly Check = Check;
  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  difficultyMenuOpen = false;

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  toggleDifficultyMenu() {
    this.difficultyMenuOpen = !this.difficultyMenuOpen;
  }

  selectDifficulty(d: Difficulty) {
    this.difficultyMenuOpen = false;
    if (d !== this.difficulty) {
      this.difficultyChange.emit(d);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (this.difficultyMenuOpen && !el?.closest?.('.difficulty-dropdown-root')) {
      this.difficultyMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.difficultyMenuOpen = false;
  }
}
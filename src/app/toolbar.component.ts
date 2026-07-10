import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Undo2, Eraser, Pencil, Lightbulb } from 'lucide-angular';
import type { Difficulty } from './models/game-state';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  styleUrl: './toolbar.component.css',
  template: `
    @if (showDifficultySelector) {
      <div class="w-full max-w-5xl flex justify-start sm:justify-center gap-2 sm:gap-8 mb-8 sm:mb-12 border-b border-slate-100 pb-4 overflow-x-auto no-scrollbar px-2">
        @for (d of difficulties; track d) {
          <button
            (click)="difficultyChange.emit(d)"
            class="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all py-2 px-3 sm:px-4 rounded-lg whitespace-nowrap"
            [class.text-blue-600]="difficulty === d"
            [class.bg-blue-50]="difficulty === d"
            [class.text-slate-400]="difficulty !== d"
          >
            {{ d }}
          </button>
        }
      </div>
    }

    @if (showGameControls) {
    <div class="toolbar-compact flex items-center justify-between gap-2">
      <div class="flex gap-1.5">
        <button (click)="undo.emit()" class="action-btn-circle" aria-label="Undo">
          <lucide-icon [name]="Undo2" size="18"></lucide-icon>
        </button>
        <button (click)="erase.emit()" class="action-btn-circle" aria-label="Erase">
          <lucide-icon [name]="Eraser" size="18"></lucide-icon>
        </button>
        <button (click)="toggleNoteMode.emit()" class="action-btn-circle" [class.active]="noteModeActive" aria-label="Toggle Notes">
          <lucide-icon [name]="Pencil" size="18"></lucide-icon>
        </button>
        <button (click)="requestHint.emit()" class="action-btn-circle relative" aria-label="Get Hint">
          <lucide-icon [name]="Lightbulb" size="18"></lucide-icon>
          <span class="absolute -top-1 -right-1 text-[9px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white"
                [class.bg-blue-600]="hintsRemaining > 0" [class.bg-amber-500]="hintsRemaining <= 0">
            {{ hintsRemaining > 0 ? hintsRemaining : '+' }}
          </span>
        </button>
      </div>

      <button (click)="requestNewGame.emit(difficulty)" class="new-game-btn" aria-label="New Game">
        New
      </button>

      <div class="theme-trigger-wrap">
        <button class="theme-swatch" [style.background-color]="themeColor(theme)"
                (click)="themeMenuOpen = !themeMenuOpen" aria-label="Change theme">
          <span class="sr-only">Change theme</span>
        </button>
        @if (themeMenuOpen) {
          <div class="theme-popover">
            @for (t of themes; track t) {
              <button class="w-7 h-7 rounded-full border-2 shadow-sm"
                      [style.background-color]="themeColor(t)"
                      [class.border-blue-600]="theme === t" [class.border-slate-200]="theme !== t"
                      [attr.aria-label]="'Switch to ' + t + ' theme'"
                      (click)="themeChange.emit(t); themeMenuOpen = false">
                <span class="sr-only">{{ t }}</span>
              </button>
            }
          </div>
        }
      </div>
    </div>
  }
  `
})
export class ToolbarComponent {
  @Input() showDifficultySelector = false;
  @Input() showGameControls = true;
  @Input() difficulty: Difficulty = 'easy';
  @Input() theme = 'classic';
  @Input() noteModeActive = false;
  @Input() hintsRemaining = 0;

  @Output() difficultyChange = new EventEmitter<Difficulty>();
  @Output() undo = new EventEmitter<void>();
  @Output() erase = new EventEmitter<void>();
  @Output() toggleNoteMode = new EventEmitter<void>();
  @Output() requestHint = new EventEmitter<void>();
  @Output() requestNewGame = new EventEmitter<Difficulty>();
  @Output() themeChange = new EventEmitter<string>();

  readonly Undo2 = Undo2;
  readonly Eraser = Eraser;
  readonly Pencil = Pencil;
  readonly Lightbulb = Lightbulb;
  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  readonly themes = ['classic', 'dark', 'ocean', 'sepia'];

    themeMenuOpen = false;

  themeColor(t: string): string {
    return t === 'classic' ? '#ffffff' : t === 'dark' ? '#0f172a' : t === 'ocean' ? '#082f49' : '#f5f2ed';
  }
}

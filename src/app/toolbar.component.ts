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
    <div class="toolbar-container">
      @if (showGameControls) {
        <div class="action-buttons-row">
          <button class="action-btn" (click)="undo.emit()">
            <lucide-icon [name]="Undo2" [size]="30"></lucide-icon>
          </button>
          <button class="action-btn" (click)="erase.emit()">
            <lucide-icon [name]="Eraser" [size]="30"></lucide-icon>
          </button>
          <button class="action-btn" [class.active]="noteModeActive" (click)="toggleNoteMode.emit()">
            <lucide-icon [name]="Pencil" [size]="30"></lucide-icon>
          </button>
          <button class="action-btn hint-btn" (click)="requestHint.emit()">
            <lucide-icon [name]="Lightbulb" [size]="30"></lucide-icon>
            <span class="hint-badge">{{ hintsRemaining > 0 ? hintsRemaining : '+' }}</span>
          </button>
        </div>
      }
    </div>
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

import { ChangeDetectionStrategy, Component, inject, HostListener, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SudokuService, Difficulty } from './sudoku.service';
import { 
  LucideAngularModule, 
  Brain, 
  Trophy, 
  Timer, 
  Settings, 
  Undo2, 
  Eraser, 
  Pencil, 
  Lightbulb,
  RotateCcw,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  ChevronDown,
  Info,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-angular';
import confetti from 'canvas-confetti';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  sudokuService = inject(SudokuService);
  
  readonly Brain = Brain;
  readonly Trophy = Trophy;
  readonly Timer = Timer;
  readonly Settings = Settings;
  readonly Undo2 = Undo2;
  readonly Eraser = Eraser;
  readonly Pencil = Pencil;
  readonly Lightbulb = Lightbulb;
  readonly RotateCcw = RotateCcw;
  readonly Play = Play;
  readonly Pause = Pause;
  readonly XCircle = XCircle;
  readonly CheckCircle2 = CheckCircle2;
  readonly ChevronDown = ChevronDown;
  readonly Info = Info;
  readonly AlertCircle = AlertCircle;
  readonly ArrowRight = ArrowRight;
  readonly ArrowLeft = ArrowLeft;

  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  readonly themes = ['classic', 'dark', 'ocean', 'sepia'];

  showSettings = signal(false);

  constructor() {
    this.sudokuService.newGame();

    // Win effect
    effect(() => {
      if (this.sudokuService.gameStatus() === 'won') {
        this.triggerConfetti();
      }
    });

    // Focus effect for hints
    effect(() => {
      const index = this.sudokuService.selectedCellIndex();
      const showModal = this.sudokuService.showHintModal();
      if (index !== null && showModal) {
        // Small timeout to ensure DOM is ready
        setTimeout(() => {
          const el = document.querySelector(`[data-index="${index}"]`) as HTMLElement;
          el?.focus();
        }, 50);
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    const selected = this.sudokuService.selectedCellIndex();
    if (selected === null) return;

    if (event.key >= '1' && event.key <= '9') {
      this.sudokuService.setCellValue(selected, parseInt(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      this.sudokuService.setCellValue(selected, null);
    } else if (event.key.toLowerCase() === 'n') {
      this.sudokuService.isNoteMode.update(v => !v);
    } else if (event.key.toLowerCase() === 'h') {
      this.sudokuService.useHint();
    } else if (event.key.startsWith('Arrow')) {
      this.moveSelection(event.key);
    }
  }

  moveSelection(key: string) {
    const current = this.sudokuService.selectedCellIndex();
    if (current === null) {
      this.sudokuService.selectedCellIndex.set(0);
      return;
    }

    let next = current;
    if (key === 'ArrowUp') next -= 9;
    if (key === 'ArrowDown') next += 9;
    if (key === 'ArrowLeft') next -= 1;
    if (key === 'ArrowRight') next += 1;

    if (next >= 0 && next < 81) {
      this.sudokuService.selectedCellIndex.set(next);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  triggerConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  getHighlightClass(index: number): string {
    const selected = this.sudokuService.selectedCellIndex();
    if (selected === null) return '';

    const board = this.sudokuService.board();
    const cell = board[index];
    const selectedCell = board[selected];

    let classes = '';
    
    if (index === selected) {
      classes += ' selected';
    } else {
      const related = this.sudokuService.getRelatedIndices(selected);
      if (related.includes(index)) {
        classes += ' highlighted';
      }
      
      if (selectedCell.value !== null && cell.value === selectedCell.value) {
        classes += ' same-number';
      }
    }

    // Hint highlighting
    const currentHint = this.sudokuService.currentHint();
    const hintStep = this.sudokuService.hintStep();
    if (currentHint && this.sudokuService.showHintModal()) {
      if (index === currentHint.index) {
        classes += ' hint-target';
      }
      
      // Only show conflicts in step 1 (Analysis)
      if (hintStep === 1) {
        const isConflict = currentHint.conflictingNumbers.some(c => c.index === index);
        if (isConflict) {
          classes += ' hint-conflict';
        }
      }
    }

    if (cell.initial) classes += ' initial';
    if (cell.error) classes += ' error';
    
    // Box completion highlight
    const boxRow = Math.floor(Math.floor(index / 9) / 3);
    const boxCol = Math.floor((index % 9) / 3);
    const boxIndex = boxRow * 3 + boxCol;
    if (this.sudokuService.isBoxComplete(boxIndex)) {
      classes += ' box-complete';
    }

    if (cell.value !== null && !cell.error && this.sudokuService.isNumberComplete(cell.value)) {
      classes += ' text-app-success';
    }

    return classes;
  }

  toggleNoteMode() {
    this.sudokuService.isNoteMode.update(v => !v);
  }
}

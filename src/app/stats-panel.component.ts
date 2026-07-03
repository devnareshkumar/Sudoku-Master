import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pause } from 'lucide-angular';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <div class="flex justify-between items-end border-b border-slate-100 pb-4">
      <div class="flex flex-col">
        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mistakes</span>
        <div class="px-3 py-1 bg-slate-50 rounded border border-slate-200 font-mono font-bold text-lg">
          {{ mistakes }}/3
        </div>
      </div>

      <div class="flex flex-col items-end">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</span>
          <button (click)="pause.emit()" class="text-slate-400 hover:text-slate-900" aria-label="Pause game">
            <lucide-icon [name]="Pause" size="12"></lucide-icon>
          </button>
        </div>
        <span class="text-2xl font-mono font-bold text-slate-800">{{ formatTime(timerSeconds) }}</span>
      </div>
    </div>
  `
})
export class StatsPanelComponent {
  @Input() mistakes = 0;
  @Input() timerSeconds = 0;
  @Output() pause = new EventEmitter<void>();

  readonly Pause = Pause;

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

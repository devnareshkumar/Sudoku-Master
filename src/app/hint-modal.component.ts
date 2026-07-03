import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-angular';
import type { HintDetails } from './models/game-state';

@Component({
  selector: 'app-hint-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (visible && hint) {
      <div class="absolute -right-4 top-10 w-80 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 z-50 animate-in fade-in zoom-in duration-300 border border-slate-50">
        <div class="min-h-[140px] flex flex-col">
          <h3 class="text-slate-800 font-black text-xl mb-2">
            @switch (step) {
              @case (0) { Last Remaining Cell }
              @case (1) { Analysis }
              @case (2) { Solution Found }
            }
          </h3>

          <div class="flex-1">
            @switch (step) {
              @case (0) {
                <p class="text-slate-500 text-sm leading-relaxed">
                  Pay attention to <span class="text-blue-600 font-bold">this cell</span> and the highlighted areas around it.
                </p>
              }
              @case (1) {
                <p class="text-slate-500 text-sm leading-relaxed">
                  {{ hint.reason }}
                </p>
              }
              @case (2) {
                <div class="flex flex-col items-center gap-3 py-2">
                  <h4 class="text-blue-600 font-bold text-sm uppercase tracking-widest">Ready to Solve</h4>
                  <p class="text-slate-500 text-sm text-center">
                    Click <span class="font-bold text-slate-800">Accept</span> to reveal the solution and fill this cell.
                  </p>
                  <div class="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center text-3xl font-black border-2 border-dashed border-slate-200">
                    ?
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <div class="mt-8 flex items-center justify-between">
          <div class="flex gap-2">
            @for (stepIndex of [0, 1, 2]; track stepIndex) {
              <div
                class="w-2 h-2 rounded-full transition-all duration-300"
                [class.bg-blue-600]="step === stepIndex"
                [class.w-5]="step === stepIndex"
                [class.bg-slate-200]="step !== stepIndex"
              ></div>
            }
          </div>

          <div class="flex gap-2 items-center">
            @if (step === 2) {
              <button
                (click)="confirm.emit()"
                class="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-2 group"
              >
                <lucide-icon [name]="CheckCircle2" size="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
                Accept
              </button>
            } @else {
              @if (step > 0) {
                <button
                  (click)="prevStep.emit()"
                  class="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-200 hover:text-slate-600 transition-all group"
                  aria-label="Previous step"
                >
                  <lucide-icon [name]="ArrowLeft" size="18" class="group-hover:-translate-x-0.5 transition-transform"></lucide-icon>
                </button>
              }

              <button
                (click)="nextStep.emit()"
                class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                aria-label="Next step"
              >
                <lucide-icon [name]="ArrowRight" size="18" class="group-hover:translate-x-0.5 transition-transform"></lucide-icon>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class HintModalComponent {
  @Input() visible = false;
  @Input() hint: HintDetails | null = null;
  @Input() step = 0;
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  readonly ArrowLeft = ArrowLeft;
  readonly ArrowRight = ArrowRight;
  readonly CheckCircle2 = CheckCircle2;
}

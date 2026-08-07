import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- Add this
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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" (click)="prevStep.emit()"></div>
        
        <!-- Modal Container using theme surface and line colors -->
        <div class="bg-app-surface rounded-2xl shadow-xl border border-app-line w-full max-w-sm p-6 transform transition-all relative">
          
          <div class="mb-6">
            <!-- Modal Title -->
            <h3 class="text-xl font-bold text-app-ink mb-2">
              @switch (step) {
                @case (0) { Last Remaining Cell }
                @case (1) { Analysis }
                @case (2) { Solution Found }
              }
            </h3>
            
            @switch (step) {
              @case (0) {
                <!-- Modal Body Text -->
                <p class="text-app-ink/80 text-base leading-relaxed">
                  Pay attention to <span class="font-bold text-app-accent">this cell</span> and the highlighted areas around it.
                </p>
              }
              @case (1) {
                <!-- Highlight Box -->
                <div class="bg-app-highlight rounded-xl p-4 mb-6 border border-app-line">
                  <p class="text-sm text-app-ink leading-relaxed">{{ hint.reason }}</p>
                </div>
              }
              @case (2) {
                <p class="text-app-ink/80 text-base leading-relaxed mb-6">
                  <span class="font-bold text-app-ink">Ready to Solve?</span><br>Click Accept to reveal the solution and fill this cell.
                </p>
              }
            }
          </div>

          <div class="flex items-center justify-between">
            <!-- Dots Indicator -->
            <div class="flex gap-1.5 items-center">
              @for (stepIndex of [0, 1, 2]; track stepIndex) {
                <div class="rounded-full transition-all duration-300"
                     [class]="step === stepIndex ? 'w-6 h-2 bg-app-accent' : 'w-2 h-2 bg-app-line'">
                </div>
              }
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-2">
              @if (step === 2) {
                <!-- Accept Button -->
                <button (click)="confirm.emit()" 
                        class="flex-1 bg-app-accent hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                  <lucide-icon [img]="CheckCircle2" class="w-5 h-5"></lucide-icon>
                  Accept
                </button>
              } @else {
                @if (step > 0) {
                  <!-- Previous Button -->
                  <button (click)="prevStep.emit()" class="p-2 text-app-ink/50 hover:text-app-ink transition-colors">
                    <lucide-icon [img]="ArrowLeft" class="w-5 h-5"></lucide-icon>
                  </button>
                }
                <!-- Next Button -->
                <button (click)="nextStep.emit()" 
                        class="p-2.5 bg-app-highlight text-app-accent hover:opacity-80 rounded-full transition-colors">
                  <lucide-icon [img]="ArrowRight" class="w-5 h-5"></lucide-icon>
                </button>
              }
            </div>
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
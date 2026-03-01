import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
} from '@angular/core';
import {provideRouter} from '@angular/router';
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
  ArrowRight
} from 'lucide-angular';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes),
    importProvidersFrom(
      LucideAngularModule.pick({ 
        Brain, Trophy, Timer, Settings, Undo2, Eraser, Pencil, Lightbulb, RotateCcw, Play, Pause, XCircle, CheckCircle2, ChevronDown, Info, AlertCircle, ArrowRight
      })
    )
  ],
};

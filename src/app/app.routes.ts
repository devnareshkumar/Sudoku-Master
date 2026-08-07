// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { HowToPlayComponent } from './how-to-play.component';
@Component({ standalone: true, template: '' })
export class HomeRouteComponent {}

export const routes: Routes = [
  { path: '', component: HomeRouteComponent, pathMatch: 'full' },
  { path: 'how-to-play', component: HowToPlayComponent },    
  { path: '**', redirectTo: '' }
];
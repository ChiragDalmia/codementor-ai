import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { GeminiService } from '../../core/services/gemini.service';
import { ReviewHistoryService } from '../../core/services/review-history.service';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { ReviewResultsComponent } from './components/review-results/review-results.component';
import { LoadingTimelineComponent, TimelineStep } from '../../shared/components/loading-timeline/loading-timeline.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { SupportedLanguage, CODE_SAMPLES, ReviewState } from '../../models/review.model';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CodeEditorComponent,
    ReviewResultsComponent,
    LoadingTimelineComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent implements OnDestroy {
  geminiService = inject(GeminiService);
  historyService = inject(ReviewHistoryService);

  private destroy$ = new Subject<void>();

  code = signal(CODE_SAMPLES['javascript']);
  language = signal<SupportedLanguage>('javascript');

  reviewState = this.geminiService.reviewState$;

  timelineSteps = signal<TimelineStep[]>([
    { label: 'Parse',       completed: false, active: false },
    { label: 'Analyze',     completed: false, active: false },
    { label: 'Security',    completed: false, active: false },
    { label: 'Performance', completed: false, active: false },
    { label: 'Refactor',    completed: false, active: false },
    { label: 'Finalize',    completed: false, active: false },
  ]);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCodeChange(value: string): void {
    this.code.set(value);
  }

  onLanguageChange(lang: SupportedLanguage): void {
    this.language.set(lang);
    this.geminiService.reset();
  }

  reviewCode(): void {
    const code = this.code().trim();
    if (!code) return;

    this.resetSteps();

    this.geminiService.reviewCode({ language: this.language(), code })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.historyService.add({ language: this.language(), code }, response);
          this.markAllStepsComplete();
        },
        error: () => {
          this.resetSteps();
        }
      });

    this.animateSteps();
  }

  reset(): void {
    this.geminiService.reset();
    this.resetSteps();
  }

  emptyFeatures = [
    { label: 'Bug Detection', color: '#ef4444' },
    { label: 'Security Analysis', color: '#f59e0b' },
    { label: 'Performance Tips', color: '#3b82f6' },
    { label: 'Refactored Code', color: '#10b981' },
  ];

  get canReview(): boolean {
    const state = this.getCurrentState();
    return !!(this.code().trim()) && state.status !== 'loading' && state.status !== 'streaming';
  }

  private getCurrentState(): ReviewState {
    let s: ReviewState = { status: 'idle', progress: 0, currentStep: '', response: null, error: null };
    this.geminiService.reviewState$.subscribe(v => s = v).unsubscribe();
    return s;
  }

  private resetSteps(): void {
    this.timelineSteps.set(this.timelineSteps().map(s => ({ ...s, completed: false, active: false })));
  }

  private markAllStepsComplete(): void {
    this.timelineSteps.set(this.timelineSteps().map(s => ({ ...s, completed: true, active: false })));
  }

  private animateSteps(): void {
    const delays = [400, 900, 1500, 2100, 2700, 3200];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        this.timelineSteps.update(steps => steps.map((s, idx) => ({
          ...s,
          completed: idx < i,
          active: idx === i,
        })));
      }, delay);
    });
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineStep {
  label: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-loading-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline" role="status" aria-live="polite" [attr.aria-label]="currentStep">
      <div class="timeline__header">
        <div class="timeline__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div class="timeline__info">
          <span class="timeline__step-label">{{ currentStep }}</span>
          <span class="timeline__pct">{{ progress }}%</span>
        </div>
      </div>

      <div class="timeline__bar-wrap" role="progressbar" [attr.aria-valuenow]="progress" aria-valuemin="0" aria-valuemax="100">
        <div class="timeline__bar">
          <div class="timeline__fill" [style.width.%]="progress"></div>
          <div class="timeline__glow" [style.left.%]="progress"></div>
        </div>
      </div>

      <div class="timeline__steps">
        @for (step of steps; track step.label) {
          <div class="timeline__step"
               [class.completed]="step.completed"
               [class.active]="step.active">
            <div class="timeline__dot" aria-hidden="true">
              @if (step.completed) {
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
              } @else if (step.active) {
                <div class="timeline__dot-pulse"></div>
              }
            </div>
            <span class="timeline__step-name">{{ step.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      background: rgba(124,58,237,0.05);
      border: 1px solid rgba(124,58,237,0.15);
      border-radius: 16px;
    }

    .timeline__header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .timeline__spinner {
      width: 20px;
      height: 20px;
      color: #a78bfa;
      animation: spin 1.2s linear infinite;
      flex-shrink: 0;
      svg { width: 100%; height: 100%; }
    }

    .timeline__info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .timeline__step-label {
      font-size: 13px;
      color: #a78bfa;
      font-weight: 500;
    }

    .timeline__pct {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      font-variant-numeric: tabular-nums;
    }

    .timeline__bar-wrap { padding: 0 2px; }

    .timeline__bar {
      position: relative;
      height: 4px;
      background: rgba(255,255,255,0.06);
      border-radius: 999px;
      overflow: hidden;
    }

    .timeline__fill {
      height: 100%;
      background: linear-gradient(90deg, #7c3aed, #4f46e5, #06b6d4);
      border-radius: 999px;
      transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
    }

    .timeline__glow {
      position: absolute;
      top: -2px;
      width: 20px;
      height: 8px;
      background: rgba(167,139,250,0.8);
      border-radius: 999px;
      transform: translateX(-50%);
      filter: blur(4px);
      transition: left 0.4s cubic-bezier(0.4,0,0.2,1);
    }

    .timeline__steps {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .timeline__step {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px 4px 6px;
      border-radius: 999px;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      border: 1px solid transparent;
      transition: all 0.2s ease;

      &.completed {
        color: #10b981;
        background: rgba(16,185,129,0.1);
        border-color: rgba(16,185,129,0.2);
      }

      &.active {
        color: #a78bfa;
        background: rgba(124,58,237,0.12);
        border-color: rgba(124,58,237,0.25);
      }
    }

    .timeline__dot {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      svg { width: 12px; height: 12px; }
    }

    .timeline__dot-pulse {
      width: 6px;
      height: 6px;
      background: #a78bfa;
      border-radius: 50%;
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
  `]
})
export class LoadingTimelineComponent {
  @Input() progress = 0;
  @Input() currentStep = 'Initializing...';
  @Input() steps: TimelineStep[] = [
    { label: 'Parse', completed: false, active: false },
    { label: 'Analyze', completed: false, active: false },
    { label: 'Security', completed: false, active: false },
    { label: 'Performance', completed: false, active: false },
    { label: 'Refactor', completed: false, active: false },
    { label: 'Finalize', completed: false, active: false },
  ];
}

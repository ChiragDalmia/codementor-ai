import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewResponse, ReviewIssue, ReviewTab } from '../../../../models/review.model';
import { DiffViewerComponent } from '../../../../shared/components/diff-viewer/diff-viewer.component';

// ── IssueItemComponent must be declared BEFORE ReviewResultsComponent ────────
@Component({
  selector: 'app-issue-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="issue" role="listitem" [class]="'issue--' + issue.severity">
      <div class="issue__header">
        <div class="issue__num" aria-hidden="true">{{ index }}</div>
        <div class="issue__meta">
          <h4 class="issue__title">{{ issue.title }}</h4>
          <div class="issue__tags">
            <span class="badge" [class]="'badge--' + issue.severity">{{ issue.severity }}</span>
            @if (issue.line) {
              <span class="issue__line" [attr.aria-label]="'Line ' + issue.line">Line {{ issue.line }}</span>
            }
          </div>
        </div>
      </div>
      <p class="issue__desc">{{ issue.description }}</p>
    </div>
  `,
  styles: [`
    .issue {
      padding: 16px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      background: var(--bg-card);
      animation: revealLine 0.3s ease forwards;

      &--critical { border-color: rgba(220,38,38,0.2);   background: rgba(220,38,38,0.04); }
      &--high     { border-color: rgba(239,68,68,0.15);  background: rgba(239,68,68,0.03); }
      &--medium   { border-color: rgba(245,158,11,0.12); }
      &--low      { border-color: rgba(59,130,246,0.12); }
    }
    .issue__header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
    .issue__num {
      width: 24px; height: 24px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: var(--text-muted); flex-shrink: 0;
    }
    .issue__meta { flex: 1; }
    .issue__title { font-size: 14px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary); }
    .issue__tags  { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .issue__line  {
      font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);
      background: var(--bg-glass); padding: 1px 6px;
      border-radius: var(--radius-full); border: 1px solid var(--border-subtle);
    }
    .issue__desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; padding-left: 36px; }
    @keyframes revealLine {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class IssueItemComponent {
  @Input({ required: true }) issue!: ReviewIssue;
  @Input() index = 1;
}

// ── ReviewResultsComponent ────────────────────────────────────
@Component({
  selector: 'app-review-results',
  standalone: true,
  imports: [CommonModule, DiffViewerComponent, IssueItemComponent],
  template: `
    <div class="results" role="region" aria-label="Code review results">
      <!-- Summary Bar -->
      <div class="results__summary-bar">
        <div class="results__grade" [class]="'results__grade--' + grade"
             [attr.aria-label]="'Code quality grade: ' + grade">{{ grade }}</div>
        <p class="results__summary-text">{{ response.summary }}</p>
      </div>

      <!-- Stat Pills -->
      <div class="results__stats" role="list" aria-label="Issue counts">
        <div class="results__stat results__stat--bugs" role="listitem">
          <span class="results__stat-num" [attr.aria-label]="response.bugs.length + ' bugs found'">{{ response.bugs.length }}</span>
          <span>Bugs</span>
        </div>
        <div class="results__stat results__stat--security" role="listitem">
          <span class="results__stat-num" [attr.aria-label]="response.security.length + ' security issues'">{{ response.security.length }}</span>
          <span>Security</span>
        </div>
        <div class="results__stat results__stat--perf" role="listitem">
          <span class="results__stat-num" [attr.aria-label]="response.performance.length + ' performance suggestions'">{{ response.performance.length }}</span>
          <span>Performance</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="results__tabs" role="tablist" aria-label="Review sections">
        @for (tab of tabs; track tab.id) {
          <button class="results__tab"
                  [class.results__tab--active]="activeTab() === tab.id"
                  role="tab"
                  [attr.id]="'tab-' + tab.id"
                  [attr.aria-controls]="'panel-' + tab.id"
                  [attr.aria-selected]="activeTab() === tab.id"
                  (click)="activeTab.set(tab.id)">
            <span class="results__tab-label">{{ tab.label }}</span>
            @if (tab.count !== undefined) {
              <span class="results__tab-badge"
                    [class.results__tab-badge--warn]="tab.count > 0 && (tab.id === 'bugs' || tab.id === 'security')">
                {{ tab.count }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Tab Panels -->
      <div class="results__panels">
        @if (activeTab() === 'summary') {
          <div class="results__panel" id="panel-summary" role="tabpanel" aria-labelledby="tab-summary">
            <div class="summary-card">
              <div class="summary-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
                  <path d="M6.5 7.75A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
              </div>
              <div class="summary-body">
                <h3 class="summary-title">Review Summary</h3>
                <p class="summary-text">{{ response.summary }}</p>
              </div>
            </div>
            <div class="overview-grid">
              <div class="overview-item" [class.overview-item--warn]="response.bugs.length > 0">
                <div class="overview-item__header">
                  <span class="overview-item__dot" style="background:#ef4444"></span>
                  <span class="overview-item__label">Bugs</span>
                </div>
                <span class="overview-item__count">{{ response.bugs.length }}</span>
              </div>
              <div class="overview-item" [class.overview-item--warn]="response.security.length > 0">
                <div class="overview-item__header">
                  <span class="overview-item__dot" style="background:#f59e0b"></span>
                  <span class="overview-item__label">Security</span>
                </div>
                <span class="overview-item__count">{{ response.security.length }}</span>
              </div>
              <div class="overview-item">
                <div class="overview-item__header">
                  <span class="overview-item__dot" style="background:#3b82f6"></span>
                  <span class="overview-item__label">Performance</span>
                </div>
                <span class="overview-item__count">{{ response.performance.length }}</span>
              </div>
              <div class="overview-item">
                <div class="overview-item__header">
                  <span class="overview-item__dot" style="background:#a78bfa"></span>
                  <span class="overview-item__label">Grade</span>
                </div>
                <span class="overview-item__count">{{ grade }}</span>
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'bugs') {
          <div class="results__panel" id="panel-bugs" role="tabpanel" aria-labelledby="tab-bugs">
            @if (response.bugs.length === 0) {
              <div class="no-issues"><svg viewBox="0 0 16 16" fill="currentColor" width="40" height="40" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg><p>No bugs found!</p></div>
            } @else {
              <div class="issue-list" role="list">
                @for (bug of response.bugs; track $index) {
                  <app-issue-item [issue]="bug" [index]="$index + 1" />
                }
              </div>
            }
          </div>
        }

        @if (activeTab() === 'performance') {
          <div class="results__panel" id="panel-performance" role="tabpanel" aria-labelledby="tab-performance">
            @if (response.performance.length === 0) {
              <div class="no-issues"><svg viewBox="0 0 16 16" fill="currentColor" width="40" height="40" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg><p>No performance issues found!</p></div>
            } @else {
              <div class="issue-list" role="list">
                @for (issue of response.performance; track $index) {
                  <app-issue-item [issue]="issue" [index]="$index + 1" />
                }
              </div>
            }
          </div>
        }

        @if (activeTab() === 'security') {
          <div class="results__panel" id="panel-security" role="tabpanel" aria-labelledby="tab-security">
            @if (response.security.length === 0) {
              <div class="no-issues"><svg viewBox="0 0 16 16" fill="currentColor" width="40" height="40" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg><p>No security vulnerabilities found!</p></div>
            } @else {
              <div class="issue-list" role="list">
                @for (issue of response.security; track $index) {
                  <app-issue-item [issue]="issue" [index]="$index + 1" />
                }
              </div>
            }
          </div>
        }

        @if (activeTab() === 'refactored') {
          <div class="results__panel" id="panel-refactored" role="tabpanel" aria-labelledby="tab-refactored">
            <app-diff-viewer [original]="originalCode" [refactored]="response.refactoredCode" [language]="language" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .results { display: flex; flex-direction: column; gap: 16px; animation: fadeInUp 0.4s ease; }
    .results__summary-bar {
      display: flex; gap: 16px; align-items: flex-start; padding: 16px;
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);
    }
    .results__grade {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; flex-shrink: 0; letter-spacing: -0.02em;
      &--A { background: rgba(16,185,129,0.15);  color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
      &--B { background: rgba(59,130,246,0.15);   color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
      &--C { background: rgba(245,158,11,0.15);   color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
      &--D { background: rgba(239,68,68,0.15);    color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
      &--F { background: rgba(220,38,38,0.15);    color: #dc2626; border: 1px solid rgba(220,38,38,0.3); }
    }
    .results__summary-text { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; flex: 1; }
    .results__stats { display: flex; gap: 12px; flex-wrap: wrap; }
    .results__stat {
      display: flex; align-items: center; gap: 10px; flex: 1; min-width: 100px;
      padding: 12px 16px; border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle); background: var(--bg-card);
      font-size: 12px; color: var(--text-muted);
      &--bugs     { border-color: rgba(239,68,68,0.15); }
      &--security { border-color: rgba(245,158,11,0.15); }
      &--perf     { border-color: rgba(59,130,246,0.15); }
    }
    .results__stat-num {
      font-size: 24px; font-weight: 700; letter-spacing: -0.03em;
      .results__stat--bugs     & { color: #ef4444; }
      .results__stat--security & { color: #f59e0b; }
      .results__stat--perf     & { color: #3b82f6; }
    }
    .results__tabs {
      display: flex; gap: 4px; border-bottom: 1px solid var(--border-subtle);
      overflow-x: auto; scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .results__tab {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      border: none; background: none; color: var(--text-muted);
      font-size: 13px; font-weight: 500; cursor: pointer;
      border-bottom: 2px solid transparent; white-space: nowrap;
      transition: all var(--transition-fast);
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      font-family: var(--font-sans);
      &:hover { color: var(--text-secondary); background: var(--bg-glass); }
      &--active { color: var(--text-accent); border-bottom-color: var(--accent-primary); background: rgba(124,58,237,0.06); }
    }
    .results__tab-badge {
      background: var(--bg-glass); color: var(--text-muted);
      font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px;
      &--warn { background: rgba(239,68,68,0.15); color: #ef4444; }
    }
    .results__panel { animation: fadeIn 0.25s ease; }
    .no-issues {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 48px; color: #10b981; text-align: center; font-size: 14px; opacity: 0.7;
    }
    .issue-list { display: flex; flex-direction: column; gap: 10px; }
    .summary-card {
      display: flex; gap: 16px; padding: 20px; margin-bottom: 16px;
      background: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.15); border-radius: var(--radius-xl);
    }
    .summary-icon { color: #a78bfa; flex-shrink: 0; margin-top: 2px; }
    .summary-body { flex: 1; }
    .summary-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .summary-text { font-size: 13.5px; color: var(--text-secondary); line-height: 1.7; }
    .overview-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    }
    .overview-item {
      padding: 14px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      &--warn { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.04); }
    }
    .overview-item__header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .overview-item__dot    { width: 6px; height: 6px; border-radius: 50%; }
    .overview-item__label  { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .overview-item__count  { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }
    @keyframes fadeIn   { from { opacity: 0; }              to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ReviewResultsComponent {
  @Input({ required: true }) response!: ReviewResponse;
  @Input() originalCode = '';
  @Input() language = 'js';

  activeTab = signal<ReviewTab>('summary');

  get tabs() {
    return [
      { id: 'summary'     as ReviewTab, label: 'Summary' },
      { id: 'bugs'        as ReviewTab, label: 'Bugs',        count: this.response.bugs.length },
      { id: 'performance' as ReviewTab, label: 'Performance', count: this.response.performance.length },
      { id: 'security'    as ReviewTab, label: 'Security',    count: this.response.security.length },
      { id: 'refactored'  as ReviewTab, label: 'Refactored' },
    ];
  }

  get grade(): string {
    const total = this.response.bugs.length + this.response.security.length + this.response.performance.length;
    const critSec = this.response.security.filter(i => i.severity === 'critical').length;
    if (critSec > 0)  return 'F';
    if (total === 0)  return 'A';
    if (total <= 2)   return 'B';
    if (total <= 5)   return 'C';
    if (total <= 8)   return 'D';
    return 'F';
  }
}

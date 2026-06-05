import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiffLine } from '../../../models/review.model';

@Component({
  selector: 'app-diff-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diff-viewer" role="region" aria-label="Code diff viewer">
      <div class="diff-header">
        <div class="diff-file diff-file--original">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
          </svg>
          <span>original.{{ language }}</span>
          <span class="diff-badge diff-badge--removed">-{{ removedCount }}</span>
        </div>
        <div class="diff-file diff-file--modified">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
          </svg>
          <span>refactored.{{ language }}</span>
          <span class="diff-badge diff-badge--added">+{{ addedCount }}</span>
        </div>
      </div>

      <div class="diff-body">
        <div class="diff-pane diff-pane--left" role="group" aria-label="Original code">
          <div class="diff-pane-label">Original</div>
          @for (line of leftLines; track $index) {
            <div class="diff-line" [class]="'diff-line--' + line.type" [attr.data-line]="line.lineNumber">
              <span class="diff-ln" aria-hidden="true">{{ line.lineNumber }}</span>
              <span class="diff-marker" aria-hidden="true">{{ line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' ' }}</span>
              <pre class="diff-code"><code>{{ line.content }}</code></pre>
            </div>
          }
        </div>

        <div class="diff-divider" aria-hidden="true"></div>

        <div class="diff-pane diff-pane--right" role="group" aria-label="Refactored code">
          <div class="diff-pane-label">Refactored</div>
          @for (line of rightLines; track $index) {
            <div class="diff-line" [class]="'diff-line--' + line.type" [attr.data-line]="line.lineNumber">
              <span class="diff-ln" aria-hidden="true">{{ line.lineNumber }}</span>
              <span class="diff-marker" aria-hidden="true">{{ line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' ' }}</span>
              <pre class="diff-code"><code>{{ line.content }}</code></pre>
            </div>
          }
        </div>
      </div>

      <div class="diff-footer">
        <span>
          <span class="diff-stat diff-stat--added">+{{ addedCount }} additions</span>
          <span class="diff-stat diff-stat--removed">-{{ removedCount }} deletions</span>
        </span>
        <button class="btn btn--ghost btn--sm" (click)="copyRefactored()" [attr.aria-label]="copied ? 'Copied!' : 'Copy refactored code'">
          @if (copied) {
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true">
              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
            </svg>
            Copied!
          } @else {
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true">
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5z"/>
            </svg>
            Copy
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .diff-viewer {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      overflow: hidden;
      font-family: var(--font-mono);
      font-size: 12px;
      background: var(--bg-secondary);
    }

    .diff-header {
      display: flex;
      border-bottom: 1px solid var(--border-subtle);
      background: rgba(255,255,255,0.02);
    }

    .diff-file {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      font-size: 12px;
      color: var(--text-secondary);
      border-right: 1px solid var(--border-subtle);

      &:last-child { border-right: none; }

      svg { width: 14px; height: 14px; opacity: 0.6; }
    }

    .diff-badge {
      margin-left: auto;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;

      &--added   { background: rgba(16,185,129,0.15); color: #10b981; }
      &--removed { background: rgba(239,68,68,0.12);  color: #ef4444; }
    }

    .diff-body {
      display: flex;
      max-height: 520px;
      overflow-y: auto;
    }

    .diff-pane {
      flex: 1;
      overflow-x: auto;
      min-width: 0;
    }

    .diff-pane-label {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 6px 12px;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid var(--border-subtle);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: var(--font-sans);
    }

    .diff-divider {
      width: 1px;
      background: var(--border-subtle);
    }

    .diff-line {
      display: flex;
      align-items: flex-start;
      min-height: 22px;
      transition: background 0.1s;

      &:hover { background: rgba(255,255,255,0.03); }

      &--added   { background: rgba(16,185,129,0.06); border-left: 2px solid #10b981; }
      &--removed { background: rgba(239,68,68,0.06);  border-left: 2px solid #ef4444; }
      &--unchanged { border-left: 2px solid transparent; }
    }

    .diff-ln {
      min-width: 36px;
      padding: 2px 8px;
      color: var(--text-muted);
      font-size: 11px;
      text-align: right;
      user-select: none;
      flex-shrink: 0;
    }

    .diff-marker {
      width: 16px;
      padding: 2px 4px;
      color: var(--text-muted);
      user-select: none;
      flex-shrink: 0;

      .diff-line--added   & { color: #10b981; }
      .diff-line--removed & { color: #ef4444; }
    }

    .diff-code {
      flex: 1;
      padding: 2px 8px 2px 0;
      white-space: pre;
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
      color: var(--text-primary);
      background: none;
      border: none;
      margin: 0;
      overflow: visible;
      code { font-family: inherit; }
    }

    .diff-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-top: 1px solid var(--border-subtle);
      background: rgba(255,255,255,0.02);
    }

    .diff-stat {
      font-size: 12px;
      font-family: var(--font-sans);

      & + & { margin-left: 12px; }

      &--added   { color: #10b981; }
      &--removed { color: #ef4444; }
    }

    .btn { font-family: var(--font-sans); }
  `]
})
export class DiffViewerComponent implements OnChanges {
  @Input() original = '';
  @Input() refactored = '';
  @Input() language = 'js';

  leftLines: DiffLine[] = [];
  rightLines: DiffLine[] = [];
  addedCount = 0;
  removedCount = 0;
  copied = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['original'] || changes['refactored']) {
      this.computeDiff();
    }
  }

  copyRefactored(): void {
    navigator.clipboard.writeText(this.refactored).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  private computeDiff(): void {
    const origLines = this.original.split('\n');
    const refLines = this.refactored.split('\n');

    this.leftLines = origLines.map((content, i) => ({
      type: refLines[i] === undefined ? 'removed' :
            refLines[i] !== content    ? 'removed'  : 'unchanged',
      content,
      lineNumber: i + 1,
    }));

    this.rightLines = refLines.map((content, i) => ({
      type: origLines[i] === undefined ? 'added' :
            origLines[i] !== content   ? 'added'   : 'unchanged',
      content,
      lineNumber: i + 1,
    }));

    this.addedCount = this.rightLines.filter(l => l.type === 'added').length;
    this.removedCount = this.leftLines.filter(l => l.type === 'removed').length;
  }
}

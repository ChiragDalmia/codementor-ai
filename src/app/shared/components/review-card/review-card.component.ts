import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewHistoryItem } from '../../../models/review.model';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="review-card" [class.review-card--compact]="compact"
             tabindex="0" role="article"
             [attr.aria-label]="'Review from ' + (item.language) + ' ' + (item.timestamp | date:'short')"
             (keydown.enter)="open.emit(item)"
             (keydown.space)="open.emit(item)">

      <div class="rc-header">
        <div class="rc-lang-badge">
          <span class="rc-lang-dot" [style.background]="langColor"></span>
          <span>{{ item.language }}</span>
        </div>
        <time class="rc-time" [dateTime]="item.timestamp">
          {{ item.timestamp | date:'MMM d, h:mm a' }}
        </time>
      </div>

      <p class="rc-summary">{{ item.summary }}</p>

      @if (!compact) {
        <div class="rc-stats">
          @if (item.response.bugs.length) {
            <span class="rc-stat rc-stat--bugs">
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
                <path d="M4.72 3.22a.75.75 0 011.06 1.06L4.06 6h7.88l-1.72-1.72a.75.75 0 111.06-1.06l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06L11.94 8H4.06l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3z"/>
              </svg>
              {{ item.response.bugs.length }} bug{{ item.response.bugs.length !== 1 ? 's' : '' }}
            </span>
          }
          @if (item.response.security.length) {
            <span class="rc-stat rc-stat--security">
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
                <path d="M7.467.133a1.75 1.75 0 011.066 0l5.25 1.68A1.75 1.75 0 0115 3.48V7c0 1.566-.832 3.37-2.8 4.9-1.854 1.445-4.197 2.1-4.2 2.1a.753.753 0 01-.4 0c-.003 0-2.346-.655-4.2-2.1C1.832 10.37 1 8.566 1 7V3.48a1.75 1.75 0 011.217-1.667l5.25-1.68z"/>
              </svg>
              {{ item.response.security.length }} security
            </span>
          }
          @if (item.response.performance.length) {
            <span class="rc-stat rc-stat--perf">
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7.25 4.5a.75.75 0 011.5 0V8a.75.75 0 01-.75.75H5.25a.75.75 0 010-1.5H7.25V4.5z"/>
              </svg>
              {{ item.response.performance.length }} perf
            </span>
          }
        </div>
      }

      <div class="rc-footer">
        <button class="btn btn--ghost btn--sm" (click)="open.emit(item)" aria-label="Open this review">
          View Review
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
            <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
          </svg>
        </button>
        @if (!compact) {
          <button class="btn btn--ghost btn--sm rc-delete" (click)="$event.stopPropagation(); delete.emit(item.id)"
                  aria-label="Delete this review">
            <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" aria-hidden="true">
              <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.492.149l-.66 6.6A1.748 1.748 0 0110.595 15h-5.19a1.75 1.75 0 01-1.741-1.576l-.66-6.6a.75.75 0 011.492-.149z"/>
            </svg>
          </button>
        }
      </div>
    </article>
  `,
  styles: [`
    .review-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
      animation: fadeInUp 0.4s ease forwards;

      &:hover {
        background: var(--bg-card-hover);
        border-color: var(--border-default);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      &:focus-visible {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
      }

      &--compact { gap: 8px; padding: 12px; }
    }

    .rc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .rc-lang-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .rc-lang-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .rc-time {
      font-size: 11px;
      color: var(--text-muted);
    }

    .rc-summary {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .rc-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .rc-stat {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 999px;

      &--bugs     { background: rgba(239,68,68,0.1);    color: #ef4444;  }
      &--security { background: rgba(245,158,11,0.1);   color: #f59e0b;  }
      &--perf     { background: rgba(59,130,246,0.1);   color: #3b82f6;  }
    }

    .rc-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }

    .rc-delete {
      color: var(--color-error) !important;
      opacity: 0.6;
      &:hover { opacity: 1; background: var(--color-error-bg) !important; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ReviewCardComponent {
  @Input({ required: true }) item!: ReviewHistoryItem;
  @Input() compact = false;

  @Output() open = new EventEmitter<ReviewHistoryItem>();
  @Output() delete = new EventEmitter<string>();

  get langColor(): string {
    const colors: Record<string, string> = {
      javascript: '#f7df1e', typescript: '#3178c6', python: '#3572a5',
      java: '#b07219', cpp: '#f34b7d', html: '#e34c26', css: '#563d7c'
    };
    return colors[this.item.language] || '#a78bfa';
  }
}

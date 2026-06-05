import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrap" [attr.aria-label]="'Loading ' + label" role="status">
      @if (type === 'review') {
        <div class="skeleton-review">
          <div class="skeleton-header">
            <div class="sk sk--pill" style="width:80px"></div>
            <div class="sk sk--line" style="width:200px"></div>
          </div>
          <div class="sk sk--line" style="width:100%"></div>
          <div class="sk sk--line" style="width:85%"></div>
          <div class="sk sk--line" style="width:70%"></div>
          <div class="skeleton-tabs">
            @for (t of [1,2,3,4,5]; track t) {
              <div class="sk sk--pill" [style.width.px]="70 + t * 5"></div>
            }
          </div>
          <div class="skeleton-content">
            @for (item of [1,2,3]; track item) {
              <div class="skeleton-issue">
                <div class="sk sk--circle" style="width:32px;height:32px"></div>
                <div class="skeleton-issue-body">
                  <div class="sk sk--line" style="width:60%"></div>
                  <div class="sk sk--line" style="width:90%"></div>
                  <div class="sk sk--line" style="width:75%"></div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (type === 'card') {
        <div class="skeleton-card">
          <div class="sk sk--circle" style="width:40px;height:40px"></div>
          <div class="skeleton-card-body">
            <div class="sk sk--line" style="width:50%"></div>
            <div class="sk sk--line" style="width:80%"></div>
          </div>
        </div>
      } @else if (type === 'metric') {
        <div class="skeleton-metric">
          <div class="sk sk--line" style="width:40%"></div>
          <div class="sk sk--title" style="width:60%"></div>
          <div class="sk sk--line" style="width:30%"></div>
        </div>
      } @else {
        @for (line of lines; track $index) {
          <div class="sk sk--line" [style.width]="line + '%'"></div>
        }
      }
    </div>
  `,
  styles: [`
    .skeleton-wrap { display: flex; flex-direction: column; gap: 12px; width: 100%; }

    .sk {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.04) 25%,
        rgba(255,255,255,0.09) 50%,
        rgba(255,255,255,0.04) 75%
      );
      background-size: 800px 100%;
      animation: shimmer 1.6s infinite linear;
      border-radius: 6px;
    }

    .sk--line   { height: 14px; border-radius: 6px; }
    .sk--title  { height: 24px; border-radius: 8px; }
    .sk--pill   { height: 28px; border-radius: 999px; }
    .sk--circle { border-radius: 50%; flex-shrink: 0; }

    .skeleton-header { display: flex; align-items: center; gap: 12px; }
    .skeleton-tabs   { display: flex; gap: 8px; flex-wrap: wrap; }

    .skeleton-issue {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
    }

    .skeleton-issue-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }

    .skeleton-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .skeleton-card-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }

    .skeleton-metric { display: flex; flex-direction: column; gap: 10px; }

    .skeleton-content { display: flex; flex-direction: column; gap: 10px; }

    .skeleton-review { display: flex; flex-direction: column; gap: 14px; }

    @keyframes shimmer {
      0%   { background-position: -800px 0; }
      100% { background-position: 800px 0; }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'lines' | 'card' | 'review' | 'metric' = 'lines';
  @Input() label = 'content';
  @Input() lines: number[] = [100, 85, 70, 90, 60];
}

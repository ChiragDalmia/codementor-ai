import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReviewHistoryService } from '../../core/services/review-history.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';
import { ReviewHistoryItem } from '../../models/review.model';
import { Router } from '@angular/router';

interface MetricCard {
  label: string;
  value: number;
  icon: SafeHtml;
  color: string;
  bg: string;
  trend?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  historyService = inject(ReviewHistoryService);
  router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  get metrics(): MetricCard[] {
    const m = this.historyService.metrics();
    return [
      {
        label: 'Reviews Completed',
        value: m.totalReviews,
        icon: this.sanitizer.bypassSecurityTrustHtml(this.reviewIcon()),
        color: '#a78bfa',
        bg: 'rgba(124,58,237,0.1)',
        trend: '+12%',
      },
      {
        label: 'Bugs Found',
        value: m.bugsFound,
        icon: this.sanitizer.bypassSecurityTrustHtml(this.bugIcon()),
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.1)',
        trend: m.bugsFound > 0 ? `${m.bugsFound} total` : undefined,
      },
      {
        label: 'Security Issues',
        value: m.securityIssues,
        icon: this.sanitizer.bypassSecurityTrustHtml(this.securityIcon()),
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.1)',
        trend: m.securityIssues > 0 ? 'Needs attention' : 'Clean',
      },
      {
        label: 'Performance Tips',
        value: m.performanceSuggestions,
        icon: this.sanitizer.bypassSecurityTrustHtml(this.perfIcon()),
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.1)',
        trend: `${m.performanceSuggestions} suggestions`,
      },
    ];
  }

  openReview(item: ReviewHistoryItem): void {
    this.router.navigate(['/history'], { queryParams: { id: item.id } });
  }

  deleteReview(id: string): void {
    this.historyService.remove(id);
  }

  quickSteps = [
    { num: 1, title: 'Paste Your Code', desc: 'Copy code from your project into the editor' },
    { num: 2, title: 'Select Language', desc: 'Choose JS, TS, Python, Java, C++, HTML or CSS' },
    { num: 3, title: 'Click Review', desc: 'Get instant AI analysis with actionable fixes' },
  ];

  languages = [
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'Python',     color: '#3572a5' },
    { name: 'Java',       color: '#b07219' },
    { name: 'C++',        color: '#f34b7d' },
    { name: 'HTML',       color: '#e34c26' },
    { name: 'CSS',        color: '#563d7c' },
  ];

  private reviewIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/></svg>`;
  }

  private bugIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20"><path d="M8 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM2 6a6 6 0 1110.174 4.31l2.512 2.512a.75.75 0 11-1.06 1.06L11.114 11.37A6 6 0 012 6z"/></svg>`;
  }

  private securityIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20"><path d="M7.467.133a1.75 1.75 0 011.066 0l5.25 1.68A1.75 1.75 0 0115 3.48V7c0 1.566-.832 3.37-2.8 4.9-1.854 1.445-4.197 2.1-4.2 2.1a.753.753 0 01-.4 0c-.003 0-2.346-.655-4.2-2.1C1.832 10.37 1 8.566 1 7V3.48a1.75 1.75 0 011.217-1.667l5.25-1.68z"/></svg>`;
  }

  private perfIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7.25 4.5a.75.75 0 011.5 0V8a.75.75 0 01-.75.75H5.25a.75.75 0 010-1.5H7.25V4.5z"/></svg>`;
  }
}

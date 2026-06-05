import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from '../../core/services/theme.service';
import { ReviewHistoryService } from '../../core/services/review-history.service';

interface NavItem {
  path: string;
  label: string;
  icon: SafeHtml;
  badge?: number;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout" [class.layout--sidebar-open]="sidebarOpen()">
      <!-- Sidebar -->
      <aside class="sidebar" role="navigation" aria-label="Main navigation">
        <div class="sidebar__inner">
          <!-- Brand -->
          <a class="sidebar__brand" routerLink="/dashboard" aria-label="CodeMentor AI - Home">
            <div class="sidebar__logo" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="10" fill="url(#logo-grad)"/>
                <path d="M8 12l4 4-4 4M16 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                    <stop stop-color="#7c3aed"/>
                    <stop offset="1" stop-color="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="sidebar__brand-text">
              <span class="sidebar__brand-name">CodeMentor</span>
              <span class="sidebar__brand-tag">AI</span>
            </div>
          </a>

          <!-- Nav -->
          <nav class="sidebar__nav">
            <div class="sidebar__nav-group">
              <span class="sidebar__nav-label" aria-hidden="true">Main</span>
              @for (item of mainNav; track item.path) {
                <a class="sidebar__nav-item"
                   [routerLink]="item.path"
                   routerLinkActive="sidebar__nav-item--active"
                   [attr.aria-current]="isActive(item.path) ? 'page' : null">
                  <span class="sidebar__nav-icon" [innerHTML]="item.icon" aria-hidden="true"></span>
                  <span class="sidebar__nav-text">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="sidebar__nav-badge" [attr.aria-label]="item.badge + ' items'">{{ item.badge }}</span>
                  }
                </a>
              }
            </div>

            <div class="sidebar__nav-group">
              <span class="sidebar__nav-label" aria-hidden="true">Account</span>
              @for (item of accountNav; track item.path) {
                <a class="sidebar__nav-item"
                   [routerLink]="item.path"
                   routerLinkActive="sidebar__nav-item--active"
                   [attr.aria-current]="isActive(item.path) ? 'page' : null">
                  <span class="sidebar__nav-icon" [innerHTML]="item.icon" aria-hidden="true"></span>
                  <span class="sidebar__nav-text">{{ item.label }}</span>
                </a>
              }
            </div>
          </nav>

          <!-- User / Footer -->
          <div class="sidebar__footer">
            <div class="sidebar__user">
              <div class="sidebar__avatar" aria-hidden="true">CM</div>
              <div class="sidebar__user-info">
                <span class="sidebar__user-name">Developer</span>
                <span class="sidebar__user-plan">Free Plan</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay (mobile) -->
      @if (sidebarOpen()) {
        <div class="layout__overlay" (click)="sidebarOpen.set(false)" aria-hidden="true"></div>
      }

      <!-- Main Content -->
      <div class="layout__content">
        <!-- Topbar -->
        <header class="topbar" role="banner">
          <button class="topbar__menu-btn"
                  (click)="sidebarOpen.set(!sidebarOpen())"
                  [attr.aria-expanded]="sidebarOpen()"
                  aria-label="Toggle navigation menu"
                  aria-controls="sidebar">
            <svg viewBox="0 0 16 16" fill="currentColor" width="18" height="18" aria-hidden="true">
              <path d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zM1.75 12a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H1.75z"/>
            </svg>
          </button>

          <div class="topbar__breadcrumb" aria-label="Current page">
            <span class="topbar__page-name">{{ currentPageLabel }}</span>
          </div>

          <div class="topbar__actions">
            <a routerLink="/review" class="btn btn--primary btn--sm" aria-label="Start a new code review">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true">
                <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/>
              </svg>
              New Review
            </a>

            <button class="topbar__icon-btn"
                    (click)="themeService.toggle()"
                    [attr.aria-label]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
              @if (themeService.theme() === 'dark') {
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <path d="M8 1.5A6.5 6.5 0 108.001 14.5 6.5 6.5 0 008 1.5zm0 1.5a5 5 0 110 10A5 5 0 018 3z"/>
                </svg>
              } @else {
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <path d="M9.598 1.591a.75.75 0 01.785-.175 7 7 0 11-8.967 8.967.75.75 0 01.961-.96 5.5 5.5 0 007.046-7.046.75.75 0 01.175-.786zm1.616 1.945a7 7 0 01-7.678 7.678 5.5 5.5 0 107.678-7.678z"/>
                </svg>
              }
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="layout__main" id="main-content" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  themeService = inject(ThemeService);
  historyService = inject(ReviewHistoryService);
  private sanitizer = inject(DomSanitizer);

  sidebarOpen = signal(false);

  mainNav: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: this.sanitizer.bypassSecurityTrustHtml(this.dashboardIcon()) },
    { path: '/review',    label: 'Review Code', icon: this.sanitizer.bypassSecurityTrustHtml(this.reviewIcon()) },
    { path: '/history',   label: 'History', icon: this.sanitizer.bypassSecurityTrustHtml(this.historyIcon()), badge: this.historyService.items().length || undefined },
  ];

  accountNav: NavItem[] = [
    { path: '/settings', label: 'Settings', icon: this.sanitizer.bypassSecurityTrustHtml(this.settingsIcon()) },
  ];

  get currentPageLabel(): string {
    const path = window.location.pathname;
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/review': 'Review Code',
      '/history': 'History',
      '/settings': 'Settings',
    };
    return map[path] || 'CodeMentor AI';
  }

  isActive(path: string): boolean {
    return window.location.pathname.startsWith(path);
  }

  @HostListener('document:keydown.escape')
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  private dashboardIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M0 1.75C0 .784.784 0 1.75 0h4.5C7.216 0 8 .784 8 1.75v4.5A1.75 1.75 0 016.25 8h-4.5A1.75 1.75 0 010 6.25V1.75zM1.5 1.75v4.5c0 .138.112.25.25.25h4.5a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-4.5a.25.25 0 00-.25.25zM0 9.75C0 8.784.784 8 1.75 8h4.5C7.216 8 8 8.784 8 9.75v4.5A1.75 1.75 0 016.25 16h-4.5A1.75 1.75 0 010 14.25V9.75zm1.5 0v4.5c0 .138.112.25.25.25h4.5a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-4.5a.25.25 0 00-.25.25zM8 1.75A1.75 1.75 0 019.75 0h4.5c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 0114.25 8h-4.5A1.75 1.75 0 018 6.25V1.75zm1.5 0v4.5c0 .138.112.25.25.25h4.5a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-4.5a.25.25 0 00-.25.25zM8 9.75A1.75 1.75 0 019.75 8h4.5c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 0114.25 16h-4.5A1.75 1.75 0 018 14.25V9.75zm1.5 0v4.5c0 .138.112.25.25.25h4.5a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-4.5a.25.25 0 00-.25.25z"/></svg>`;
  }

  private reviewIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75zm6.75.062V4.25c0 .138.112.25.25.25h2.688a.252.252 0 00-.011-.013L10.5 1.562z"/></svg>`;
  }

  private historyIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/></svg>`;
  }

  private settingsIcon(): string {
    return `<svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 0a8.2 8.2 0 01.701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.08.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 01-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.01-.3.071a5.909 5.909 0 01-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 01-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 01-.668-.386c-.123-.08-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 01-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 010-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 01.704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.01.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.531.01 7.766 0 8 0zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 000 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 001.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 000-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 00-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 00-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 00-1.142 0zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/></svg>`;
  }
}

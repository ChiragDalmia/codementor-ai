import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { ReviewHistoryService } from '../../core/services/review-history.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  historyService = inject(ReviewHistoryService);

  apiKey = signal(localStorage.getItem('gemini_api_key') || '');
  apiKeySaved = signal(false);
  apiKeyVisible = signal(false);

  saveApiKey(): void {
    const key = this.apiKey().trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    this.apiKeySaved.set(true);
    setTimeout(() => this.apiKeySaved.set(false), 2500);
  }

  clearApiKey(): void {
    this.apiKey.set('');
    localStorage.removeItem('gemini_api_key');
    this.apiKeySaved.set(false);
  }

  get maskedKey(): string {
    const key = this.apiKey();
    if (!key) return '';
    if (this.apiKeyVisible()) return key;
    return key.slice(0, 8) + '•'.repeat(Math.max(0, key.length - 12)) + key.slice(-4);
  }

  get apiKeyStatus(): 'none' | 'saved' | 'mock' {
    const stored = localStorage.getItem('gemini_api_key');
    if (!stored) return 'none';
    return 'saved';
  }
}

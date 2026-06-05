import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewHistoryService } from '../../core/services/review-history.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';
import { ReviewResultsComponent } from '../review/components/review-results/review-results.component';
import { ReviewHistoryItem, SupportedLanguage, LANGUAGE_OPTIONS } from '../../models/review.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReviewCardComponent, ReviewResultsComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  historyService = inject(ReviewHistoryService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  searchQuery = signal('');
  selectedLanguage = signal<string>('all');
  selectedItem = signal<ReviewHistoryItem | null>(null);
  showClearConfirm = signal(false);

  languageOptions = [{ value: 'all', label: 'All Languages' }, ...LANGUAGE_OPTIONS.map(o => ({ value: o.value, label: o.label }))];

  filteredItems = computed(() => {
    const items = this.historyService.items();
    const query = this.searchQuery().toLowerCase();
    const lang = this.selectedLanguage();

    return items.filter(item => {
      const matchesLang = lang === 'all' || item.language === lang;
      const matchesSearch = !query ||
        item.summary.toLowerCase().includes(query) ||
        item.language.toLowerCase().includes(query) ||
        item.codeSnippet.toLowerCase().includes(query);
      return matchesLang && matchesSearch;
    });
  });

  constructor() {
    // Open item from query param (e.g., navigated from dashboard)
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        const item = this.historyService.getById(params['id']);
        if (item) this.selectedItem.set(item);
      }
    });
  }

  openItem(item: ReviewHistoryItem): void {
    this.selectedItem.set(item);
  }

  closeItem(): void {
    this.selectedItem.set(null);
    this.router.navigate([], { queryParams: {} });
  }

  deleteItem(id: string): void {
    if (this.selectedItem()?.id === id) this.selectedItem.set(null);
    this.historyService.remove(id);
  }

  clearAll(): void {
    this.historyService.clearAll();
    this.selectedItem.set(null);
    this.showClearConfirm.set(false);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onLangFilter(event: Event): void {
    this.selectedLanguage.set((event.target as HTMLSelectElement).value);
  }
}

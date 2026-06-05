import { Injectable, signal, computed } from '@angular/core';
import { ReviewHistoryItem, ReviewResponse, ReviewRequest, DashboardMetrics } from '../../models/review.model';

const STORAGE_KEY = 'codementor_history';
const MAX_HISTORY = 50;

@Injectable({ providedIn: 'root' })
export class ReviewHistoryService {
  private _items = signal<ReviewHistoryItem[]>(this.load());

  readonly items = this._items.asReadonly();

  readonly metrics = computed<DashboardMetrics>(() => {
    const items = this._items();
    return {
      totalReviews: items.length,
      bugsFound: items.reduce((acc, i) => acc + i.response.bugs.length, 0),
      securityIssues: items.reduce((acc, i) => acc + i.response.security.length, 0),
      performanceSuggestions: items.reduce((acc, i) => acc + i.response.performance.length, 0),
    };
  });

  readonly recentItems = computed(() => this._items().slice(0, 5));

  add(req: ReviewRequest, response: ReviewResponse): ReviewHistoryItem {
    const item: ReviewHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      language: req.language,
      summary: response.summary,
      codeSnippet: req.code.slice(0, 200),
      response,
    };

    const updated = [item, ...this._items()].slice(0, MAX_HISTORY);
    this._items.set(updated);
    this.save(updated);
    return item;
  }

  remove(id: string): void {
    const updated = this._items().filter(i => i.id !== id);
    this._items.set(updated);
    this.save(updated);
  }

  clearAll(): void {
    this._items.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  getById(id: string): ReviewHistoryItem | undefined {
    return this._items().find(i => i.id === id);
  }

  private load(): ReviewHistoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(items: ReviewHistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }
}

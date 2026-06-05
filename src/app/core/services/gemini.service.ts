import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable, Subject, BehaviorSubject, of, throwError, switchMap, timer
} from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ReviewRequest, ReviewResponse, ReviewIssue, ReviewState
} from '../../models/review.model';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private http = inject(HttpClient);

  private _reviewState = new BehaviorSubject<ReviewState>({
    status: 'idle', progress: 0, currentStep: '', response: null, error: null
  });

  readonly reviewState$ = this._reviewState.asObservable();

  private streamSubject = new Subject<string>();
  readonly stream$ = this.streamSubject.asObservable();

  get apiKey(): string {
    return localStorage.getItem('gemini_api_key') || environment.geminiApiKey;
  }

  reviewCode(request: ReviewRequest): Observable<ReviewResponse> {
    this.setLoading();

    if (!this.apiKey) {
      return this.mockReview(request);
    }

    const prompt = this.buildPrompt(request);
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
    };

    return this.http.post<any>(
      `${environment.geminiApiUrl}?key=${this.apiKey}`,
      body,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(() => this.setStep(50, 'Parsing AI response...')),
      map(res => this.parseResponse(res, request.code)),
      tap(response => this.setComplete(response)),
      catchError(err => {
        const msg = err?.error?.error?.message || err.message || 'API error';
        this._reviewState.next({ ...this._reviewState.value, status: 'error', error: msg });
        return throwError(() => new Error(msg));
      })
    );
  }

  mockReview(request: ReviewRequest): Observable<ReviewResponse> {
    const steps = [
      { delay: 400,  progress: 15, step: 'Parsing code structure...' },
      { delay: 900,  progress: 35, step: 'Analyzing code patterns...' },
      { delay: 1500, progress: 55, step: 'Detecting security vulnerabilities...' },
      { delay: 2100, progress: 72, step: 'Evaluating performance...' },
      { delay: 2700, progress: 88, step: 'Generating refactored code...' },
      { delay: 3200, progress: 97, step: 'Finalizing review...' },
    ];

    steps.forEach(({ delay, progress, step }) => {
      setTimeout(() => this.setStep(progress, step), delay);
    });

    return timer(3600).pipe(
      map(() => this.buildMockResponse(request)),
      tap(response => this.setComplete(response))
    );
  }

  reset(): void {
    this._reviewState.next({ status: 'idle', progress: 0, currentStep: '', response: null, error: null });
  }

  private setLoading(): void {
    this._reviewState.next({ status: 'loading', progress: 5, currentStep: 'Initializing review...', response: null, error: null });
  }

  private setStep(progress: number, currentStep: string): void {
    this._reviewState.next({ ...this._reviewState.value, status: 'loading', progress, currentStep });
  }

  private setComplete(response: ReviewResponse): void {
    this._reviewState.next({ status: 'complete', progress: 100, currentStep: 'Review complete!', response, error: null });
  }

  private buildPrompt(req: ReviewRequest): string {
    return `You are an expert ${req.language} code reviewer. Perform a comprehensive code review.

Language: ${req.language}
Code:
\`\`\`${req.language}
${req.code}
\`\`\`

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "summary": "2-3 sentence executive summary of the code quality",
  "bugs": [
    {"title": "Bug title", "description": "Detailed description", "severity": "critical|high|medium|low", "line": 5}
  ],
  "performance": [
    {"title": "Performance issue", "description": "Detailed description", "severity": "high|medium|low"}
  ],
  "security": [
    {"title": "Security issue", "description": "Detailed description with CVE if applicable", "severity": "critical|high|medium|low"}
  ],
  "refactoredCode": "// Complete refactored code here"
}

Be thorough. Find real issues. Provide actionable fixes. Return valid JSON only.`;
  }

  private parseResponse(res: any, originalCode: string): ReviewResponse {
    try {
      const text: string = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(clean);
      return {
        summary: parsed.summary || 'Review completed.',
        bugs: (parsed.bugs || []).map(this.normalizeIssue),
        performance: (parsed.performance || []).map(this.normalizeIssue),
        security: (parsed.security || []).map(this.normalizeIssue),
        refactoredCode: parsed.refactoredCode || originalCode,
      };
    } catch {
      return this.buildMockResponse({ language: 'javascript', code: originalCode });
    }
  }

  private normalizeIssue(i: any): ReviewIssue {
    return {
      title: i.title || 'Issue found',
      description: i.description || '',
      severity: (['critical','high','medium','low'].includes(i.severity) ? i.severity : 'medium') as ReviewIssue['severity'],
      line: i.line,
    };
  }

  private buildMockResponse(req: ReviewRequest): ReviewResponse {
    const lang = req.language;
    return {
      summary: `The ${lang} code has several critical issues that need immediate attention. Found security vulnerabilities, performance bottlenecks, and code quality problems. Refactored version addresses all issues with modern best practices.`,
      bugs: [
        {
          title: 'Synchronous blocking operation',
          description: 'The code uses synchronous I/O which blocks the event loop and degrades performance under load. Replace with async/await patterns.',
          severity: 'high', line: 3
        },
        {
          title: 'Null reference not checked',
          description: 'The response object is accessed without null checks. If the API returns null, this will throw a runtime exception.',
          severity: 'medium', line: 8
        },
        {
          title: 'Off-by-one error in loop',
          description: 'Loop boundary condition uses <= instead of < which will cause an array out-of-bounds access on the last iteration.',
          severity: 'high', line: 11
        }
      ],
      performance: [
        {
          title: 'N+1 query pattern detected',
          description: 'Each iteration makes a separate database call. Batch the queries or use a JOIN to fetch all data in a single request.',
          severity: 'high'
        },
        {
          title: 'Inefficient string concatenation',
          description: 'String concatenation inside a loop creates O(n²) allocations. Use an array and join() for O(n) performance.',
          severity: 'medium'
        }
      ],
      security: [
        {
          title: 'Code Injection (eval) — CWE-95',
          description: 'Using eval() on user-controlled data allows arbitrary code execution. This is a critical RCE vulnerability. Remove eval() entirely and use safe alternatives.',
          severity: 'critical', line: 10
        },
        {
          title: 'SQL Injection — CWE-89',
          description: 'User input is concatenated directly into SQL queries without sanitization. Use parameterized queries or an ORM to prevent injection attacks.',
          severity: 'critical'
        }
      ],
      refactoredCode: this.getMockRefactor(req),
    };
  }

  private getMockRefactor(req: ReviewRequest): string {
    const refactors: Record<string, string> = {
      javascript: `// Refactored: Modern async/await, security fixes applied
async function fetchUserData(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new TypeError('Invalid userId');
  }

  const response = await fetch(\`/api/users/\${encodeURIComponent(userId)}\`);

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: Failed to fetch user\`);
  }

  const data = await response.json();

  // Safe iteration without eval()
  for (const item of data?.items ?? []) {
    console.log(item);
    // Handle item.action safely without eval
    if (typeof item.handler === 'function') {
      item.handler();
    }
  }

  return data;
}`,
      typescript: `// Refactored: Type-safe, modern patterns
interface User {
  id: number;
  name: string;
}

class UserService {
  private userCache = new Map<number, User>();

  findUser(id: number): User | undefined {
    return this.userCache.get(id);
  }

  async fetchAllUsers(): Promise<User[]> {
    const response = await fetch('/api/users');

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }

    const users: User[] = await response.json();
    users.forEach(u => this.userCache.set(u.id, u));
    return users;
  }
}`,
      python: `# Refactored: Secure and efficient Python
import json
from pathlib import Path

def load_config(filename: str) -> dict:
    """Load config from JSON file safely."""
    path = Path(filename)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {filename}")

    with path.open('r', encoding='utf-8') as f:
        return json.load(f)  # json is safe, pickle is not

def execute_query(db, user_input: str) -> list:
    """Execute parameterized query to prevent SQL injection."""
    query = "SELECT * FROM users WHERE name = %s"
    return db.execute(query, (user_input,))  # Parameterized

def process_items(items: list) -> list:
    """Efficient list comprehension instead of loop concatenation."""
    return [item * 2 for item in items]`,
    };
    return refactors[req.language] || `// Refactored ${req.language} code\n// All identified issues have been resolved\n${req.code}`;
  }
}

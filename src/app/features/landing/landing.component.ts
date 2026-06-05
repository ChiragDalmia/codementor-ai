import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  features = [
    {
      icon: 'bug',
      title: 'Bug Detection',
      desc: 'AI identifies null references, off-by-one errors, race conditions, and logical flaws before they reach production.',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
    },
    {
      icon: 'security',
      title: 'Security Analysis',
      desc: 'Detects SQL injection, XSS, CSRF, insecure deserialization, and OWASP Top 10 vulnerabilities with CVE references.',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      icon: 'perf',
      title: 'Performance Optimization',
      desc: 'Finds N+1 queries, memory leaks, unnecessary re-renders, and blocking operations that slow your app.',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
    },
    {
      icon: 'refactor',
      title: 'Smart Refactoring',
      desc: 'Get a complete refactored version of your code with modern patterns, clean architecture, and best practices.',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      icon: 'editor',
      title: 'Monaco Code Editor',
      desc: 'Write and paste code in a VS Code-quality editor with syntax highlighting, line numbers, and 7 languages.',
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.08)',
    },
    {
      icon: 'history',
      title: 'Review History',
      desc: 'All reviews saved locally. Revisit past analyses, track improvement over time, and compare refactors.',
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.08)',
    },
  ];

  testimonials = [
    {
      quote: 'Caught a critical SQL injection vulnerability in our payment flow. CodeMentor AI paid for itself in the first review.',
      name: 'Sarah Chen',
      role: 'Senior Backend Engineer',
      avatar: 'SC',
      color: '#7c3aed',
    },
    {
      quote: 'I use it before every PR. The refactored code suggestions are genuinely excellent — reads like a senior engineer wrote it.',
      name: 'Marcus Rodriguez',
      role: 'Full Stack Developer',
      avatar: 'MR',
      color: '#0891b2',
    },
    {
      quote: 'Found 3 memory leaks in my React components that had been in production for months. Incredible tool.',
      name: 'Aiko Tanaka',
      role: 'Frontend Engineer',
      avatar: 'AT',
      color: '#059669',
    },
  ];

  stats = [
    { value: '50K+', label: 'Code Reviews' },
    { value: '200K+', label: 'Bugs Caught' },
    { value: '7',     label: 'Languages' },
    { value: '< 5s',  label: 'Review Time' },
  ];

  codeDemo = `// Before: Vulnerable code
function getUser(id) {
  const query = "SELECT * FROM users WHERE id = " + id;
  return db.execute(query);  // ⚠ SQL Injection
}

// After: CodeMentor AI refactored
async function getUser(id: string): Promise<User | null> {
  if (!id || typeof id !== 'string') return null;
  return db.execute(
    'SELECT * FROM users WHERE id = $1',
    [id]  // ✓ Parameterized — injection-proof
  );
}`;
}

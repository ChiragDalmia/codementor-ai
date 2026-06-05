import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy,
  OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, NgZone, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportedLanguage, LANGUAGE_OPTIONS, CODE_SAMPLES } from '../../../../models/review.model';

declare const monaco: any;

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-wrapper" role="region" aria-label="Code editor">
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <div class="editor-toolbar__left">
          <label for="lang-select" class="sr-only">Programming language</label>
          <div class="lang-selector">
            <div class="lang-dot" [style.background]="langColor" aria-hidden="true"></div>
            <select id="lang-select"
                    class="input lang-select"
                    [value]="language"
                    (change)="onLangChange($event)"
                    aria-label="Select programming language">
              @for (opt of languageOptions; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <div class="editor-stats" aria-live="polite" aria-label="Editor statistics">
            <span>{{ lineCount }} lines</span>
            <span class="sep" aria-hidden="true">·</span>
            <span>{{ charCount }} chars</span>
          </div>
        </div>

        <div class="editor-toolbar__right">
          <button class="btn btn--ghost btn--sm" (click)="loadSample()" aria-label="Load sample code">
            <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" aria-hidden="true">
              <path d="M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l3.914 3.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
            </svg>
            Sample
          </button>
          <button class="btn btn--ghost btn--sm" (click)="clearCode()" aria-label="Clear editor">
            <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" aria-hidden="true">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
            Clear
          </button>
        </div>
      </div>

      <!-- Monaco Container -->
      <div class="editor-container" [class.editor-loading]="!editorReady">
        <div #editorContainer class="editor-mount" role="textbox" aria-multiline="true"
             [attr.aria-label]="language + ' code editor'"></div>

        @if (!editorReady) {
          <div class="editor-placeholder" aria-hidden="true">
            <div class="editor-placeholder__inner">
              <div class="editor-placeholder__dots">
                <span></span><span></span><span></span>
              </div>
              <span class="editor-placeholder__text">Loading Monaco Editor...</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .editor-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: var(--bg-secondary);
    }

    .editor-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-subtle);
      background: rgba(255,255,255,0.02);
      gap: 12px;
      flex-wrap: wrap;
    }

    .editor-toolbar__left, .editor-toolbar__right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lang-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .lang-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .lang-select {
      width: auto;
      min-width: 120px;
      padding: 5px 32px 5px 10px;
      font-size: 12px;
      font-weight: 600;
    }

    .editor-stats {
      display: flex;
      gap: 6px;
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .sep { opacity: 0.4; }

    .editor-container {
      flex: 1;
      position: relative;
      min-height: 400px;
    }

    .editor-mount {
      width: 100%;
      height: 100%;
      min-height: 400px;
    }

    .editor-loading .editor-mount { opacity: 0; }

    .editor-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .editor-placeholder__inner {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
      font-size: 13px;
    }

    .editor-placeholder__dots {
      display: flex;
      gap: 4px;

      span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent-primary);
        animation: dotBounce 1.2s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
      40%            { transform: scale(1.2); opacity: 1; }
    }
  `]
})
export class CodeEditorComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef<HTMLDivElement>;

  @Input() language: SupportedLanguage = 'javascript';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() languageChange = new EventEmitter<SupportedLanguage>();

  private zone = inject(NgZone);
  private editor: any = null;
  private monacoLoaded = false;
  private resizeObserver: ResizeObserver | null = null;

  editorReady = false;
  languageOptions = LANGUAGE_OPTIONS;

  get lineCount(): number { return (this.value || '').split('\n').length; }
  get charCount(): number { return (this.value || '').length; }

  get langColor(): string {
    const colors: Record<string, string> = {
      javascript: '#f7df1e', typescript: '#3178c6', python: '#3572a5',
      java: '#b07219', cpp: '#f34b7d', html: '#e34c26', css: '#563d7c'
    };
    return colors[this.language] || '#a78bfa';
  }

  ngOnInit(): void {
    if (!this.value) {
      this.value = CODE_SAMPLES[this.language];
    }
  }

  ngAfterViewInit(): void {
    this.loadMonaco();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editor) {
      if (changes['language'] && !changes['language'].isFirstChange()) {
        const opt = LANGUAGE_OPTIONS.find(o => o.value === this.language);
        if (opt) {
          (window as any).monaco?.editor.setModelLanguage(this.editor.getModel(), opt.monacoLang);
        }
      }
      if (changes['value'] && !changes['value'].isFirstChange()) {
        const current = this.editor.getValue();
        if (current !== this.value) {
          this.editor.setValue(this.value || '');
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.editor?.dispose();
  }

  onLangChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value as SupportedLanguage;
    this.language = lang;
    this.languageChange.emit(lang);
    this.value = CODE_SAMPLES[lang];
    this.valueChange.emit(this.value);

    if (this.editor) {
      const opt = LANGUAGE_OPTIONS.find(o => o.value === lang);
      if (opt) {
        (window as any).monaco?.editor.setModelLanguage(this.editor.getModel(), opt.monacoLang);
        this.editor.setValue(this.value);
      }
    }
  }

  loadSample(): void {
    const sample = CODE_SAMPLES[this.language];
    this.value = sample;
    this.valueChange.emit(sample);
    this.editor?.setValue(sample);
  }

  clearCode(): void {
    this.value = '';
    this.valueChange.emit('');
    this.editor?.setValue('');
    this.editor?.focus();
  }

  private loadMonaco(): void {
    const w = window as any;

    if (w.monaco) {
      this.initEditor();
      return;
    }

    w.require = { paths: { vs: 'assets/monaco/min/vs' } };

    const script = document.createElement('script');
    script.src = 'assets/monaco/min/vs/loader.js';
    script.onload = () => {
      w.require(['vs/editor/editor.main'], () => {
        this.zone.run(() => this.initEditor());
      });
    };
    document.head.appendChild(script);
  }

  private initEditor(): void {
    if (!this.editorContainer?.nativeElement) return;

    const m = (window as any).monaco;
    if (!m) return;

    // Define a premium dark theme
    m.editor.defineTheme('codementor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'type', foreground: 'e5c07b' },
        { token: 'function', foreground: '61afef' },
        { token: 'variable', foreground: 'e06c75' },
      ],
      colors: {
        'editor.background': '#0c0c1d',
        'editor.foreground': '#f0f0ff',
        'editorLineNumber.foreground': '#3a3a5a',
        'editorLineNumber.activeForeground': '#7c3aed',
        'editor.lineHighlightBackground': '#ffffff08',
        'editor.selectionBackground': '#7c3aed40',
        'editorCursor.foreground': '#a78bfa',
        'editor.findMatchBackground': '#7c3aed40',
        'scrollbarSlider.background': '#ffffff15',
        'scrollbarSlider.hoverBackground': '#ffffff25',
      }
    });

    const opt = LANGUAGE_OPTIONS.find(o => o.value === this.language);

    this.editor = m.editor.create(this.editorContainer.nativeElement, {
      value: this.value || CODE_SAMPLES[this.language],
      language: opt?.monacoLang || 'javascript',
      theme: 'codementor-dark',
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontLigatures: true,
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      roundedSelection: true,
      automaticLayout: true,
      suggest: { enabled: true },
      quickSuggestions: true,
      contextmenu: true,
      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
      accessibilitySupport: 'on',
    });

    this.editor.onDidChangeModelContent(() => {
      this.zone.run(() => {
        const val = this.editor.getValue();
        this.value = val;
        this.valueChange.emit(val);
      });
    });

    // Observe container resize
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.editor?.layout();
      });
      this.resizeObserver.observe(this.editorContainer.nativeElement);
    }

    this.editorReady = true;
  }
}

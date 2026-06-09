import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

/** [text, tokenClass?] — tokenClass maps to .t-* styles in the stylesheet. */
type Tok = readonly [string, string?];

interface DemoLine {
  n: number;
  tokens: Tok[];
  /** Severity gutter shown once the matching finding card is revealed. */
  mark?: 'crit' | 'warn' | 'info';
  findingIdx?: number;
  /** Refactored pane: line was added/changed. */
  add?: boolean;
}

interface Finding {
  sev: 'crit' | 'warn' | 'info';
  label: string;
  title: string;
  loc: string;
  desc: string;
  fix: string;
}

type DemoPhase = 'idle' | 'typing' | 'scanning' | 'findings' | 'refactor';

const BOOT_KEY = 'cmai.boot.v1';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);

  private readonly reducedMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Boot sequence ────────────────────────────────────────────
  readonly booting = signal(false);
  readonly bootStep = signal(0);
  readonly bootStatus = computed(
    () =>
      ['', 'waking the engine', 'loading review passes', 'scanning sample', 'ready', 'ready'][
        Math.min(this.bootStep(), 5)
      ],
  );

  // ── Nav ──────────────────────────────────────────────────────
  readonly navScrolled = signal(false);

  // ── Engine section ───────────────────────────────────────────
  readonly engineStep = signal(0);
  readonly engineSteps = [
    {
      title: 'Bug detection',
      copy: 'Logic errors, null paths, race conditions, off-by-ones. The class of bug that survives your tests and dies in production.',
    },
    {
      title: 'Security analysis',
      copy: 'Injection, XSS, unsafe deserialization, secrets sitting in plain sight — mapped against OWASP and explained in context.',
    },
    {
      title: 'Performance',
      copy: 'N+1 queries, leaked listeners, quadratic loops, blocking I/O. Found before your users find them.',
    },
    {
      title: 'Refactor',
      copy: 'Not a lecture — a rewrite. Idiomatic, typed, ready to diff against your original.',
    },
  ];
  readonly reactorNodes = [
    { k: 'BUG', label: 'bug detection' },
    { k: 'SEC', label: 'security analysis' },
    { k: 'PERF', label: 'performance' },
    { k: 'REF', label: 'refactor' },
  ];

  // ── Live demo ────────────────────────────────────────────────
  readonly demoPhase = signal<DemoPhase>('idle');
  readonly typedCount = signal(0);
  readonly findingCount = signal(0);
  readonly showRefactor = computed(() => this.demoPhase() === 'refactor');
  readonly stageIndex = computed(
    () => ({ idle: -1, typing: 0, scanning: 1, findings: 2, refactor: 3 })[this.demoPhase()],
  );
  readonly demoStages = ['Paste', 'Scan', 'Findings', 'Refactor'];

  readonly demoBefore: DemoLine[] = [
    { n: 1, tokens: [['async ', 'k'], ['function ', 'k'], ['getUser', 'fn'], ['(', 'p'], ['req', 'a'], [', ', 'p'], ['res', 'a'], [') {', 'p']] },
    { n: 2, mark: 'info', findingIdx: 2, tokens: [['  '], ['const ', 'k'], ['id', 'v'], [' = ', 'p'], ['req', 'a'], ['.', 'p'], ['params', 'pr'], ['.', 'p'], ['id', 'pr'], [';', 'p']] },
    { n: 3, mark: 'crit', findingIdx: 0, tokens: [['  '], ['const ', 'k'], ['query', 'v'], [' = ', 'p'], ['"SELECT * FROM users WHERE id = "', 's'], [' + ', 'p'], ['id', 'v'], [';', 'p']] },
    { n: 4, tokens: [['  '], ['const ', 'k'], ['user', 'v'], [' = ', 'p'], ['await ', 'k'], ['db', 'v'], ['.', 'p'], ['query', 'fn'], ['(', 'p'], ['query', 'v'], [');', 'p']] },
    { n: 5, tokens: [['  '], ['const ', 'k'], ['orders', 'v'], [' = [];', 'p']] },
    { n: 6, mark: 'warn', findingIdx: 1, tokens: [['  '], ['for ', 'k'], ['(', 'p'], ['const ', 'k'], ['oid', 'v'], [' of ', 'k'], ['user', 'v'], ['.', 'p'], ['orderIds', 'pr'], [') {', 'p']] },
    { n: 7, mark: 'warn', findingIdx: 1, tokens: [['    '], ['orders', 'v'], ['.', 'p'], ['push', 'fn'], ['(', 'p'], ['await ', 'k'], ['db', 'v'], ['.', 'p'], ['query', 'fn'], ['(', 'p']] },
    { n: 8, mark: 'warn', findingIdx: 1, tokens: [['      '], ['"SELECT * FROM orders WHERE user = "', 's'], [' + ', 'p'], ['oid', 'v'], ['));', 'p']] },
    { n: 9, tokens: [['  }', 'p']] },
    { n: 10, tokens: [['  '], ['res', 'a'], ['.', 'p'], ['send', 'fn'], ['({ ', 'p'], ['user', 'v'], [', ', 'p'], ['orders', 'v'], [' });', 'p']] },
    { n: 11, tokens: [['}', 'p']] },
  ];

  readonly demoAfter: DemoLine[] = [
    { n: 1, tokens: [['async ', 'k'], ['function ', 'k'], ['getUser', 'fn'], ['(', 'p'], ['req', 'a'], [', ', 'p'], ['res', 'a'], [') {', 'p']] },
    { n: 2, add: true, tokens: [['  '], ['const ', 'k'], ['id', 'v'], [' = ', 'p'], ['Number', 'fn'], ['(', 'p'], ['req', 'a'], ['.', 'p'], ['params', 'pr'], ['.', 'p'], ['id', 'pr'], [');', 'p']] },
    { n: 3, add: true, tokens: [['  '], ['if ', 'k'], ['(!', 'p'], ['Number', 'fn'], ['.', 'p'], ['isInteger', 'fn'], ['(', 'p'], ['id', 'v'], [')) {', 'p']] },
    { n: 4, add: true, tokens: [['    '], ['return ', 'k'], ['res', 'a'], ['.', 'p'], ['status', 'fn'], ['(', 'p'], ['400', 'n'], [').', 'p'], ['send', 'fn'], ['();', 'p']] },
    { n: 5, add: true, tokens: [['  }', 'p']] },
    { n: 6, tokens: [['  '], ['const ', 'k'], ['user', 'v'], [' = ', 'p'], ['await ', 'k'], ['db', 'v'], ['.', 'p'], ['query', 'fn'], ['(', 'p']] },
    { n: 7, add: true, tokens: [['    '], ['"SELECT * FROM users WHERE id = $1"', 's'], [', [', 'p'], ['id', 'v'], [']);', 'p']] },
    { n: 8, add: true, tokens: [['  '], ['const ', 'k'], ['orders', 'v'], [' = ', 'p'], ['await ', 'k'], ['db', 'v'], ['.', 'p'], ['query', 'fn'], ['(', 'p']] },
    { n: 9, add: true, tokens: [['    '], ['"SELECT * FROM orders WHERE user = ANY($1)"', 's'], [',', 'p']] },
    { n: 10, add: true, tokens: [['    [', 'p'], ['user', 'v'], ['.', 'p'], ['orderIds', 'pr'], [']);', 'p']] },
    { n: 11, tokens: [['  '], ['res', 'a'], ['.', 'p'], ['send', 'fn'], ['({ ', 'p'], ['user', 'v'], [', ', 'p'], ['orders', 'v'], [' });', 'p']] },
    { n: 12, tokens: [['}', 'p']] },
  ];

  readonly demoFindings: Finding[] = [
    {
      sev: 'crit',
      label: 'Critical',
      title: 'SQL injection',
      loc: 'line 3',
      desc: 'Request input is concatenated straight into the query. One crafted id reads your whole users table.',
      fix: 'db.query("… WHERE id = $1", [id])',
    },
    {
      sev: 'warn',
      label: 'High',
      title: 'N+1 query',
      loc: 'lines 6–8',
      desc: 'One database round-trip per order. Fifty orders, fifty queries.',
      fix: 'WHERE user = ANY($1)',
    },
    {
      sev: 'info',
      label: 'Medium',
      title: 'Unvalidated input',
      loc: 'line 2',
      desc: 'req.params.id is trusted as-is — strings, arrays, anything.',
      fix: 'Number(id) + Number.isInteger(id)',
    },
  ];

  // ── Impact stats ─────────────────────────────────────────────
  readonly stats = [
    { target: 200, prefix: '', suffix: 'K+', label: 'bugs caught before production' },
    { target: 50, prefix: '', suffix: 'K+', label: 'reviews run' },
    { target: 5, prefix: '<', suffix: 's', label: 'median review time' },
    { target: 7, prefix: '', suffix: '', label: 'languages supported' },
  ];
  readonly statValues = signal<number[]>(this.stats.map(() => 0));

  // ── Internals ────────────────────────────────────────────────
  private timers: ReturnType<typeof setTimeout>[] = [];
  private demoTimers: ReturnType<typeof setTimeout>[] = [];
  private observers: IntersectionObserver[] = [];
  private rafId = 0;
  private scrollHandler?: () => void;
  private demoStarted = false;
  private statsStarted = false;
  private fx = new AbortController(); // all 3D interaction listeners
  private fxCancels: Array<() => void> = []; // per-scene rAF loops

  constructor() {
    const seen = (() => {
      try {
        return !!localStorage.getItem(BOOT_KEY);
      } catch {
        return true;
      }
    })();

    if (!this.reducedMotion && !seen) {
      this.booting.set(true);
      document.body.style.overflow = 'hidden';
      this.runBoot();
    }
  }

  ngAfterViewInit(): void {
    if (this.booting()) {
      // Choreograph reveals to fire as the boot overlay fades.
      this.timers.push(setTimeout(() => { this.initScrollFX(); this.init3D(); }, 2150));
    } else {
      this.initScrollFX();
      this.init3D();
    }
  }

  ngOnDestroy(): void {
    [...this.timers, ...this.demoTimers].forEach(clearTimeout);
    this.observers.forEach(o => o.disconnect());
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    this.fx.abort();
    this.fxCancels.forEach(cancel => cancel());
    document.body.style.overflow = '';
  }

  // ── Boot ─────────────────────────────────────────────────────
  private runBoot(): void {
    const at = (ms: number, fn: () => void) => this.timers.push(setTimeout(fn, ms));
    at(60, () => this.bootStep.set(1)); // logo draws
    at(520, () => this.bootStep.set(2)); // code generates
    at(1080, () => this.bootStep.set(3)); // scan pass
    at(1560, () => this.bootStep.set(4)); // progress fill
    at(2100, () => this.bootStep.set(5)); // overlay reveal
    at(2680, () => {
      this.booting.set(false);
      document.body.style.overflow = '';
      try {
        localStorage.setItem(BOOT_KEY, '1');
      } catch {
        /* private mode */
      }
    });
  }

  // ── Scroll FX: reveals, parallax, section triggers ───────────
  private initScrollFX(): void {
    const root: HTMLElement = this.host.nativeElement;
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (this.reducedMotion || typeof IntersectionObserver === 'undefined') {
      revealEls.forEach(el => el.classList.add('is-in'));
      this.engineStep.set(0);
      this.finishDemoInstantly();
      this.statValues.set(this.stats.map(s => s.target));
      return;
    }

    const reveal = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-in');
            reveal.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
    );
    revealEls.forEach(el => reveal.observe(el));
    this.observers.push(reveal);

    // Engine pass steps light the reactor as they cross mid-viewport.
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
    if (steps.length) {
      const stepObs = new IntersectionObserver(
        entries => {
          for (const e of entries) {
            if (e.isIntersecting) {
              this.engineStep.set(Number((e.target as HTMLElement).dataset['step']) || 0);
            }
          }
        },
        { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
      );
      steps.forEach(el => stepObs.observe(el));
      this.observers.push(stepObs);
    }

    // Demo plays once when its stage is well in view.
    const stage = root.querySelector<HTMLElement>('.demo__stage');
    if (stage) {
      const demoObs = new IntersectionObserver(
        entries => {
          if (entries.some(e => e.isIntersecting) && !this.demoStarted) {
            this.demoStarted = true;
            this.runDemo();
            demoObs.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      demoObs.observe(stage);
      this.observers.push(demoObs);
    }

    // Stats count up once.
    const statsEl = root.querySelector<HTMLElement>('.impact__stats');
    if (statsEl) {
      const statObs = new IntersectionObserver(
        entries => {
          if (entries.some(e => e.isIntersecting) && !this.statsStarted) {
            this.statsStarted = true;
            this.animateStats();
            statObs.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      statObs.observe(statsEl);
      this.observers.push(statObs);
    }

    // Parallax + nav state on one rAF-throttled scroll listener.
    const parallaxEls = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]')).map(
      el => ({ el, f: Number(el.dataset['parallax']) || 0 }),
    );
    let ticking = false;
    this.scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      this.rafId = requestAnimationFrame(() => {
        const y = window.scrollY;
        const scrolled = y > 32;
        if (scrolled !== this.navScrolled()) this.navScrolled.set(scrolled);
        for (const { el, f } of parallaxEls) {
          el.style.transform = `translate3d(0, ${(y * f).toFixed(1)}px, 0)`;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.scrollHandler();
  }

  // ── Demo state machine ───────────────────────────────────────
  private runDemo(): void {
    const at = (ms: number, fn: () => void) => this.demoTimers.push(setTimeout(fn, ms));
    this.demoPhase.set('typing');

    const lineMs = 95;
    for (let i = 1; i <= this.demoBefore.length; i++) {
      at(i * lineMs, () => this.typedCount.set(i));
    }
    const afterTyping = this.demoBefore.length * lineMs + 380;

    at(afterTyping, () => this.demoPhase.set('scanning'));
    const afterScan = afterTyping + 1150;

    at(afterScan, () => this.demoPhase.set('findings'));
    at(afterScan + 220, () => this.findingCount.set(1));
    at(afterScan + 780, () => this.findingCount.set(2));
    at(afterScan + 1340, () => this.findingCount.set(3));

    at(afterScan + 2100, () => this.demoPhase.set('refactor'));
  }

  private finishDemoInstantly(): void {
    this.typedCount.set(this.demoBefore.length);
    this.findingCount.set(this.demoFindings.length);
    this.demoPhase.set('refactor');
  }

  replayDemo(): void {
    this.demoTimers.forEach(clearTimeout);
    this.demoTimers = [];
    this.typedCount.set(0);
    this.findingCount.set(0);
    this.demoPhase.set('idle');
    if (this.reducedMotion) {
      this.finishDemoInstantly();
      return;
    }
    this.demoTimers.push(setTimeout(() => this.runDemo(), 120));
  }

  lineMark(line: DemoLine): string | null {
    if (!line.mark || line.findingIdx === undefined) return null;
    return this.findingCount() > line.findingIdx ? line.mark : null;
  }

  // ── 3D interaction: one spring system for all three scenes ──
  private init3D(): void {
    if (this.reducedMotion) return;
    const root: HTMLElement = this.host.nativeElement;
    this.initCube(root);
    // Reactor tilts toward the pointer anywhere over its column.
    this.addTilt(root.querySelector('.reactor'), root.querySelector('.engine__visual'), 11, 1.02);
    // Shard tracks the pointer magnetically across the whole closer section.
    this.addTilt(root.querySelector('.shard'), root.querySelector('.closer'), 24, 1.06, 1.3);
  }

  /** Hero cube: grab to spin (with inertia), settles back into idle drift. */
  private initCube(root: HTMLElement): void {
    const surface = root.querySelector<HTMLElement>('.hero__visual');
    const cube = root.querySelector<HTMLElement>('.cube');
    if (!surface || !cube) return;

    const idleVel = 0.16; // deg/frame ≈ one turn every ~37s
    const s = { yaw: 32, pitch: -18, vel: idleVel, dragging: false, lastX: 0, lastY: 0 };
    const opts = { signal: this.fx.signal };

    surface.addEventListener('pointerdown', e => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      surface.setPointerCapture(e.pointerId);
      surface.classList.add('is-grabbing');
    }, opts);
    surface.addEventListener('pointermove', e => {
      if (!s.dragging) return;
      s.vel = (e.clientX - s.lastX) * 0.45;
      s.pitch = Math.max(-70, Math.min(38, s.pitch - (e.clientY - s.lastY) * 0.3));
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    }, opts);
    const release = () => { s.dragging = false; surface.classList.remove('is-grabbing'); };
    surface.addEventListener('pointerup', release, opts);
    surface.addEventListener('pointercancel', release, opts);

    let raf = 0;
    const loop = () => {
      if (!s.dragging) {
        s.vel += (idleVel - s.vel) * 0.018; // fling decays back to idle drift
        s.pitch += (-18 - s.pitch) * 0.02;
      }
      s.yaw += s.vel;
      cube.style.transform = `rotateX(${s.pitch.toFixed(2)}deg) rotateY(${s.yaw.toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    // Only burn frames while the hero is on screen.
    const vis = new IntersectionObserver(entries => {
      const on = entries.some(e => e.isIntersecting);
      if (on && !raf) raf = requestAnimationFrame(loop);
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    vis.observe(surface);
    this.observers.push(vis);
    this.fxCancels.push(() => { if (raf) cancelAnimationFrame(raf); });
  }

  /** Springy pointer tilt. Runs only while moving; releases the rAF when settled. */
  private addTilt(
    el: HTMLElement | null,
    surface: HTMLElement | null,
    max = 12,
    lift = 1.03,
    drift = 0,
  ): void {
    if (!el || !surface) return;
    const s = { tx: 0, ty: 0, rx: 0, ry: 0, vx: 0, vy: 0, sc: 1, tsc: 1, raf: 0 };

    const loop = () => {
      s.vx = (s.vx + (s.tx - s.rx) * 0.11) * 0.8;
      s.vy = (s.vy + (s.ty - s.ry) * 0.11) * 0.8;
      s.rx += s.vx;
      s.ry += s.vy;
      s.sc += (s.tsc - s.sc) * 0.12;
      const move = drift ? ` translate3d(${(s.ry * drift).toFixed(1)}px, ${(-s.rx * drift).toFixed(1)}px, 0)` : '';
      el.style.transform =
        `perspective(900px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) scale(${s.sc.toFixed(3)})${move}`;
      const settled =
        Math.abs(s.tx - s.rx) + Math.abs(s.ty - s.ry) + Math.abs(s.vx) + Math.abs(s.vy) < 0.04 &&
        Math.abs(s.tsc - s.sc) < 0.002;
      if (settled && s.tx === 0 && s.ty === 0) {
        el.style.transform = '';
        s.rx = s.ry = s.vx = s.vy = 0;
        s.sc = 1;
        s.raf = 0;
        return;
      }
      s.raf = requestAnimationFrame(loop);
    };
    const wake = () => { if (!s.raf) s.raf = requestAnimationFrame(loop); };

    const opts = { signal: this.fx.signal };
    surface.addEventListener('pointermove', (e: PointerEvent) => {
      const r = surface.getBoundingClientRect();
      s.ty = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
      s.tx = -((e.clientY - r.top) / r.height - 0.5) * 2 * max;
      s.tsc = lift;
      wake();
    }, opts);
    surface.addEventListener('pointerleave', () => {
      s.tx = s.ty = 0;
      s.tsc = 1;
      wake();
    }, opts);
    this.fxCancels.push(() => { if (s.raf) cancelAnimationFrame(s.raf); });
  }

  // ── Stats count-up ───────────────────────────────────────────
  private animateStats(): void {
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(2, -10 * t); // easeOutExpo
      this.statValues.set(this.stats.map(s => Math.round(s.target * (t >= 1 ? 1 : ease))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Helpers ──────────────────────────────────────────────────
  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({
      behavior: this.reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}

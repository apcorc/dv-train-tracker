import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode; title?: string; subtitle?: string }> = ({
  children,
  title,
  subtitle,
}) => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-rail-steel/10 via-transparent to-transparent dark:from-rail-amber/10"
      />

      <header className="relative border-b border-rail-line/70 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="group flex min-w-0 items-center gap-3 no-underline">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rail-steel text-rail-signal shadow-panel transition group-hover:scale-105 dark:bg-slate-800">
              <span className="font-display text-xl font-bold leading-none tracking-tight">DV</span>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rail-go ring-2 ring-white dark:ring-slate-950" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-2xl font-bold uppercase leading-none tracking-[0.04em] text-rail-ink transition group-hover:text-rail-steel dark:text-white dark:group-hover:text-rail-signal">
                Train Tracker
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Derail Valley
              </span>
            </span>
          </Link>

          {!isHome && (
            <Link to="/" className="btn-ghost shrink-0 text-sm">
              ← Consist
            </Link>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {(title || subtitle) && (
          <div className="mb-6 animate-fade-up">
            {title && (
              <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-rail-ink dark:text-white sm:text-4xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;

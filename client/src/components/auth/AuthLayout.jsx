import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LinkupLogo } from '../ui/LinkupLogo';

export function AuthLayout({ heroTitle, heroText, title, subtitle, children, footer }) {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-surface text-on-surface antialiased overflow-x-hidden selection:bg-primary-fixed selection:text-primary">
      <div className="relative w-full lg:w-1/2 min-h-[260px] lg:min-h-[100dvh] bg-gradient-to-br from-[#B65E42] via-[#D97757] to-[#8A4526] flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F7DDC7] opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] rounded-full bg-[#F0BC94] opacity-40 blur-[90px] pointer-events-none" />

        <header className="relative z-10 flex items-center gap-3">
          <LinkupLogo size={44} />
          <span className="text-white font-bold text-xl tracking-editorial">Linkup</span>
        </header>

        <div className="relative z-10 my-auto py-10 lg:py-0 max-w-xl">
          <h1 className="font-bold text-[34px] leading-[42px] lg:text-[44px] lg:leading-[54px] text-white tracking-editorial mb-5">
            {heroTitle}
          </h1>
          <p className="text-base text-white/85 leading-relaxed max-w-[52ch]">{heroText}</p>
        </div>

        <footer className="relative z-10 text-white/70 text-xs">© {new Date().getFullYear()} Linkup</footer>
      </div>

      <div className="w-full lg:w-1/2 lg:min-h-[100dvh] flex flex-col justify-center items-center px-5 sm:px-12 lg:px-20 py-10 sm:py-14">
        <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-3xl p-7 sm:p-10 border border-outline-variant/60 shadow-glass-lg">
          <div className="text-center mb-7">
            <h2 className="font-bold text-[26px] leading-9 text-on-surface tracking-editorial">{title}</h2>
            <p className="text-sm text-on-surface-variant mt-1.5">{subtitle}</p>
          </div>
          {children}
          <div className="mt-8 pt-6 border-t border-outline-variant/50 text-center text-sm text-on-surface-variant">
            {footer}
          </div>
        </div>
      </div>
    </main>
  );
}

export function AuthField({ id, label, icon: Icon, trailing, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-on-surface mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          strokeWidth={1.75}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
        />
        <input
          id={id}
          name={id}
          {...inputProps}
          className={`w-full pl-10 ${trailing ? 'pr-11' : 'pr-4'} py-3 rounded-full bg-surface-container-low border border-outline-variant/60 text-on-surface text-sm placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none`}
        />
        {trailing}
      </div>
    </div>
  );
}

export function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-primary transition-colors"
    >
      {shown ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
    </button>
  );
}

export function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <div className="pt-2">
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 px-6 rounded-full bg-primary-container text-on-primary hover:bg-[#C4694B] font-semibold text-sm flex items-center justify-center gap-2 subtle-wine-halo transition-colors active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        <span>{loading ? loadingLabel : label}</span>
        {!loading && <ArrowRight size={16} strokeWidth={2} />}
      </button>
    </div>
  );
}

export function AuthAlert({ tone = 'error', children }) {
  const styles =
    tone === 'error'
      ? 'bg-error-container/70 border-error/25 text-on-error-container'
      : 'bg-primary-fixed/70 border-primary-container/30 text-on-primary-fixed';
  return (
    <div role="alert" className={`border px-4 py-3 rounded-2xl mb-5 text-sm ${styles}`}>
      {children}
    </div>
  );
}

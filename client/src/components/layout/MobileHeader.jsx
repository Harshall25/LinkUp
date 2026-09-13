import { LinkupLogo } from '../ui/LinkupLogo';
import { ThemeToggle } from '../ui/ThemeToggle';

export function MobileHeader() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 glass-panel z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <LinkupLogo size={32} />
        <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Linkup</span>
      </div>
      <ThemeToggle />
    </div>
  );
}

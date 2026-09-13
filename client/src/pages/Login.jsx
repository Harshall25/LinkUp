import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowUpRight } from 'lucide-react';
import { LinkupLogo } from '../components/ui/LinkupLogo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signin(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-surface text-on-surface antialiased overflow-x-hidden selection:bg-primary-fixed selection:text-primary">
      {/* LEFT — brand showcase */}
      <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[100dvh] bg-gradient-to-br from-[#B65E42] via-[#D97757] to-[#8A4526] flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-fixed opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] rounded-full bg-secondary-container opacity-40 blur-[90px] pointer-events-none" />

        <header className="relative z-10 flex items-center gap-3">
          <LinkupLogo size={44} />
          <span className="text-on-primary font-bold text-xl tracking-editorial">Linkup</span>
        </header>

        <div className="relative z-10 my-auto py-10 lg:py-0 max-w-xl">
          <h1 className="font-bold text-[36px] leading-[44px] lg:text-[44px] lg:leading-[54px] text-on-primary tracking-editorial mb-6">
            Share what you build. Read what matters.
          </h1>
          <p className="text-base text-primary-fixed/95 leading-relaxed max-w-[52ch]">
            A quiet place for posts, discussions, and the people behind them.
          </p>
        </div>

        <footer className="relative z-10 text-primary-fixed/70 text-xs">
          © 2026 Linkup
        </footer>
      </div>

      {/* RIGHT — sign-in form */}
      <div className="w-full lg:w-1/2 min-h-[100dvh] bg-surface flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12 relative">
        <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-3xl p-8 sm:p-10 border border-outline-variant/50 shadow-glass-lg">
          <div className="text-center mb-8">
            <div className="lg:hidden mx-auto mb-4 flex items-center justify-center">
              <LinkupLogo size={44} />
            </div>
            <h2 className="font-bold text-[26px] leading-9 text-on-surface tracking-editorial">
              Welcome back
            </h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="bg-error-container/70 border border-error/20 text-on-error-container px-4 py-3 rounded-2xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <Mail size={18} strokeWidth={1.75} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-on-surface mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock size={18} strokeWidth={1.75} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-3 rounded-full bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-primary-container text-on-primary hover:bg-primary font-semibold text-sm flex items-center justify-center gap-2 subtle-wine-halo transition-colors active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Signing in…' : 'Sign in'}</span>
                {!loading && <ArrowRight size={16} strokeWidth={2} />}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/40 text-center">
            <p className="text-sm text-on-surface-variant">
              Don&apos;t have an account?
              <Link
                to="/signup"
                className="text-primary hover:text-primary-container font-semibold ml-1.5 inline-flex items-center gap-0.5 group"
              >
                <span>Sign up</span>
                <ArrowUpRight size={14} strokeWidth={2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

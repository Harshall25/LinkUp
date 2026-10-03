import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { AuthAlert, AuthField, AuthLayout, PasswordToggle, SubmitButton } from '../components/auth/AuthLayout';
import { GoogleAuthSection } from '../components/auth/GoogleAuthSection';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, signinWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signin(email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign you in. Please try again.'));
      setLoading(false);
    }
  };

  const handleGoogle = useCallback(
    async (credential) => {
      setError('');
      setLoading(true);
      try {
        await signinWithGoogle(credential);
        navigate('/');
      } catch (err) {
        setError(getErrorMessage(err, 'Google sign-in failed. Please try again.'));
        setLoading(false);
      }
    },
    [signinWithGoogle, navigate]
  );

  return (
    <AuthLayout
      heroTitle="Share what you build. Read what matters."
      heroText="A quiet place for posts, discussions, and the people behind them."
      title="Welcome back"
      subtitle="Sign in to continue to Linkup"
      footer={
        <>
          Don&apos;t have an account?
          <Link to="/signup" className="ml-1.5 text-primary hover:underline font-semibold">
            Create one
          </Link>
        </>
      }
    >
      {error && <AuthAlert>{error}</AuthAlert>}

      <GoogleAuthSection mode="signin" onCredential={handleGoogle} dividerLabel="or sign in with email" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
        <AuthField
          id="password"
          label="Password"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />
        <SubmitButton loading={loading} label="Sign in" loadingLabel="Signing in…" />
      </form>
    </AuthLayout>
  );
}

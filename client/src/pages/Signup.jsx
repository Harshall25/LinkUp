import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { AuthAlert, AuthField, AuthLayout, PasswordToggle, SubmitButton } from '../components/auth/AuthLayout';
import { GoogleAuthSection } from '../components/auth/GoogleAuthSection';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signinWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account. Please try again.'));
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
        setError(getErrorMessage(err, 'Google sign-up failed. Please try again.'));
        setLoading(false);
      }
    },
    [signinWithGoogle, navigate]
  );

  return (
    <AuthLayout
      heroTitle="Create your account."
      heroText="Post, follow people whose work you care about, and skip the noise."
      title="Join Linkup"
      subtitle="It takes about ten seconds."
      footer={
        <>
          Already have an account?
          <Link to="/login" className="ml-1.5 text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </>
      }
    >
      {error && <AuthAlert>{error}</AuthAlert>}

      <GoogleAuthSection mode="signup" onCredential={handleGoogle} dividerLabel="or sign up with email" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="name"
          label="Name"
          icon={UserIcon}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          placeholder="Your name"
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="At least 6 characters"
          trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />
        <SubmitButton loading={loading} label="Create account" loadingLabel="Creating account…" />
      </form>
    </AuthLayout>
  );
}

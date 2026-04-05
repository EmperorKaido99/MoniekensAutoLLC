'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Incorrect email or password. Please try again.');
      setLoading(false);
      return;
    }

    router.replace('/dashboard');
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Logo.png" alt="MoniekensAutoLLC" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold">MoniekensAutoLLC</h1>
          <p className="text-white/60 text-base mt-1">Business Management</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-navy mb-6">Sign In</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 bottom-3 text-muted hover:text-navy transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-12 h-6 rounded-full transition-colors ${remember ? 'bg-amber' : 'bg-gray-300'}`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${remember ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </div>
            <span className="text-base text-navy">Remember me</span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-danger text-sm font-medium bg-danger/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} fullWidth className="mt-2">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}

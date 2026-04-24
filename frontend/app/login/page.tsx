'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LoginRequest } from '@/types';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setError('');
    setLoading(true);
    try {
      await login(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-dark text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="mt-2">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:text-primary-dark transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
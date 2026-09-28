'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginSchema } from '@/lib/validations/schemas';
import { useAuth } from '@/providers/AuthProvider';
import { AuthLayout, Button, Input, Label } from '@/components/ui';
import { Lock, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export default function LoginPage() {
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    await signIn(data.email, data.password);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back to LeadPilot AI</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to access your leads and AI insights
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="pl-10"
                error={!!errors.email}
                {...register('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-error-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8227;"
                className="pl-10"
                error={!!errors.password}
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-error-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 font-normal">
              <input type="checkbox" className="rounded" />
              Remember me
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            variant="primary"
            size="lg"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Create account
          </Link>
        </div>

        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}
      </div>
    </AuthLayout>
  );
}

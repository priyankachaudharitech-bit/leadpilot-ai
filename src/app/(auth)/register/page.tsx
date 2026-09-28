'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signupSchema } from '@/lib/validations/schemas';
import { useAuth } from '@/providers/AuthProvider';
import { AuthLayout, Button, Input, Label } from '@/components/ui';
import { Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    try {
      await signUp(data.name, data.email, data.password);
      toast.success('Account created! Check your email to verify.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Start managing leads with AI-powered insights
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                className="pl-10"
                error={!!errors.name}
                {...register('name')}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
            </div>
            {errors.name && (
              <p id="name-error" className="text-xs text-error-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

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
                placeholder="••••••••"
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

          <div className="text-xs text-muted-foreground">
            Password must be at least 8 characters.
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            variant="primary"
            size="lg"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

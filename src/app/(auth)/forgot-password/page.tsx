'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { resetPasswordSchema } from '@/lib/validations/schemas';
import { useAuth } from '@/providers/AuthProvider';
import { AuthLayout, Button, Input, Label } from '@/components/ui';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    try {
      await resetPassword(data.email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email and we'll send you a reset link
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            variant="primary"
            size="lg"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

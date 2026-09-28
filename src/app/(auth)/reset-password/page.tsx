'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { updatePasswordSchema } from '@/lib/validations/schemas';
import { useAuth } from '@/providers/AuthProvider';
import { AuthLayout, Button, Input, Label } from '@/components/ui';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: z.infer<typeof updatePasswordSchema>) => {
    try {
      await updatePassword(data.password);
      toast.success('Password updated! You can now sign in.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
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

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                error={!!errors.confirmPassword}
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              />
            </div>
            {errors.confirmPassword && (
              <p id="confirm-error" className="text-xs text-error-500 mt-1">
                {errors.confirmPassword.message}
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
            {isSubmitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

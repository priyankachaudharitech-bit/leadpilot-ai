'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { leadSchema, leadUpdateSchema } from '@/lib/validations/schemas';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';
import { LEAD_STATUSES } from '@/lib/utils/constants';
import { Lead } from '@/types';

type LeadFormData = z.infer<typeof leadSchema>;
type LeadUpdateData = z.infer<typeof leadUpdateSchema>;

interface LeadFormProps {
  initialData?: Partial<Lead>;
  onSubmit: (data: LeadFormData | LeadUpdateData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function LeadForm({ initialData, onSubmit, onCancel, isSubmitting }: LeadFormProps) {
  const [showNotes, setShowNotes] = useState(false);

  const schema = initialData ? leadUpdateSchema : leadSchema;
  type FormData = typeof initialData extends undefined ? LeadFormData : LeadUpdateData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      company: initialData?.company || '',
      title: initialData?.title || '',
      source: initialData?.source || '',
      status: initialData?.status || 'new',
      notes: initialData?.notes || '',
      custom_fields: initialData?.custom_fields || {},
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Jane Doe"
            error={!!errors.name}
            {...register('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-error-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@company.com"
            error={!!errors.email}
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-error-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Acme Inc."
            {...register('company')}
          />
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Sales Director"
            {...register('title')}
          />
        </div>

        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="Website, Referral, etc."
            {...register('source')}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={initialData?.status || 'new'}
            onValueChange={(v: string) => {}}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('status')} />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="text-sm text-primary hover:underline"
          aria-expanded={showNotes}
        >
          {showNotes ? 'Hide notes' : 'Add notes'}
        </button>
        {showNotes && (
          <div className="mt-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this lead..."
              rows={4}
              {...register('notes')}
            />
          </div>
        )}
      </div>

      {onCancel && (
        <CardFooter className="flex justify-end gap-2 px-0 pb-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Lead' : 'Create Lead'}
          </Button>
        </CardFooter>
      )}

      {!onCancel && (
        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : initialData ? 'Update Lead' : 'Create Lead'}
        </Button>
      )}
    </form>
  );
}

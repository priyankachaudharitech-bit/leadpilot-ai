'use client';

import { LeadForm } from '@/components/forms/LeadForm';
import type { LeadWithInsights } from '@/types';
import { toast } from 'sonner';

export function LeadEditForm({ lead }: { lead: LeadWithInsights }) {
  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update lead');
      toast.success('Lead updated successfully');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lead');
    }
  };

  return <LeadForm initialData={lead} onSubmit={handleSubmit} />;
}

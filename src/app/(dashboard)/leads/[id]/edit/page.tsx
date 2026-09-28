import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { LeadForm } from '@/components/forms/LeadForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Lead } from '@/types';

export default async function LeadEditPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .is('deleted_at', null)
    .single();

  if (error || !lead) {
    notFound();
  }

  const leadData: Partial<Lead> = lead as Partial<Lead>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/leads/${(lead as any).id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lead
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Lead</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update lead information</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientLeadEditForm lead={leadData} />
        </CardContent>
      </Card>
    </div>
  );
}

function ClientLeadEditForm({ lead }: { lead: Partial<Lead> }) {
  'use client';

  const handleSubmit = async (data: any) => {
    const response = await fetch(`/api/leads/${(lead as any).id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update lead');
    }

    window.location.href = `/leads/${(lead as any).id}`;
  };

  const handleCancel = () => {
    window.location.href = `/leads/${(lead as any).id}`;
  };

  return <LeadForm initialData={lead} onSubmit={handleSubmit} onCancel={handleCancel} />;
}

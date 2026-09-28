'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { LeadForm } from '@/components/forms/LeadForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LeadCreatePage() {
  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create lead');
    }

    const result = await response.json();
    window.location.href = `/leads/${result.id}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Lead</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a new lead</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
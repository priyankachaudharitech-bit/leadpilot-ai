import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { SummaryDisplay } from '@/components/ai/SummaryDisplay';
import { ScoreDisplay } from '@/components/ai/ScoreDisplay';
import { FollowUpGenerator } from '@/components/ai/FollowUpGenerator';
import { LeadEditForm } from '@/components/leads/LeadEditForm';
import { LeadActivity } from '@/components/leads/LeadActivity';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import type { LeadWithInsights } from '@/types';

async function fetchLead(id: string): Promise<LeadWithInsights | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      summary(*),
      scores(*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) return null;

  const leadData = data as any;
  const summaryRecord = Array.isArray(leadData.summary) ? leadData.summary[0] : leadData.summary;
  const scoreRecord = Array.isArray(leadData.scores) ? leadData.scores[0] : leadData.scores;

  const { data: followUps } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false });

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false });

  return {
    ...leadData,
    summary: summaryRecord ?? null,
    latest_score: scoreRecord ?? null,
    follow_ups: followUps ?? [],
    activities: activities ?? [],
  };
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await fetchLead(params.id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <div className="ml-auto flex gap-2">
          <Link href={`/leads/${lead.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
          </Link>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LeadFormSkeleton />}>
                    <LeadEditForm lead={lead} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-insights">
              <div className="space-y-6">
                <SummaryDisplay
                  leadId={lead.id}
                  initialContent={lead.summary?.content ?? null}
                  isGenerating={false}
                  error={null}
                  onRegenerate={async () => {}}
                />
                <ScoreDisplay score={lead.latest_score} isGenerating={false} />
                <FollowUpGenerator
                  leadId={lead.id}
                  existingFollowUps={lead.follow_ups}
                  isGenerating={false}
                  onGenerate={async () => {}}
                />
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <LeadActivity activities={lead.activities} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Email</span>
                <p className="text-sm">{lead.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Company</span>
                <p className="text-sm">{lead.company || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Title</span>
                <p className="text-sm">{lead.title || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Source</span>
                <p className="text-sm">{lead.source || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Created</span>
                <p className="text-sm">{new Date(lead.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LeadFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

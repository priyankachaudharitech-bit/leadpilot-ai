import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, name, score, status, created_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const { data: recentActivities } = await supabase
    .from('activities')
    .select('id, type, description, created_at, leads(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const typedLeads = (leads || []) as Array<{ id: string; name: string; score: number; status: string; created_at: string }>;
  const totalLeads = typedLeads.length;
  const avgScore = typedLeads.length > 0
    ? Math.round(typedLeads.reduce((sum: number, l) => sum + (l.score ?? 0), 0) / typedLeads.length)
    : 0;
  const highPriority = typedLeads.filter((l) => (l.score ?? 0) >= 70).length;
  const leadsThisWeek = typedLeads.filter((l) => {
    const created = new Date(l.created_at);
    const weekAgo = subDays(new Date(), 7);
    return created >= weekAgo;
  }).length;

  return {
    totalLeads,
    avgScore,
    highPriority,
    leadsThisWeek,
    recentActivities: recentActivities ?? [],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="p-6">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your lead intelligence at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/leads/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Leads"
          value={String(data.totalLeads)}
          change="+0% from last month"
        />
        <MetricCard
          title="High Priority"
          value={String(data.highPriority)}
          description="Score >= 70"
          valueClassName={data.highPriority > 0 ? 'text-success-600' : ''}
        />
        <MetricCard
          title="Average Score"
          value={`${data.avgScore}`}
          change="Score across all leads"
          description=""
        />
        <MetricCard
          title="Leads This Week"
          value={String(data.leadsThisWeek)}
          change="+12% from last week"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivityList activities={data.recentActivities} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  description,
  valueClassName,
}: {
  title: string;
  value: string;
  change?: string;
  description?: string;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${valueClassName || ''}`}>{value}</p>
          {change && description === undefined && (
            <p className="text-xs text-muted-foreground">{change}</p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  leads?: { name: string | null } | null;
}

function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No recent activity
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-2">
            <ActivityIcon type={activity.type} />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(activity.created_at), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactElement> = {
    created: <Plus className="h-4 w-4 text-primary" />,
    updated: <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16h2m-2 0V9m2 7h-2" /></svg>,
    summary_generated: <svg className="h-4 w-4 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-2 2l2-2m0 0l2-2m-2 2v-4" /></svg>,
    scored: <svg className="h-4 w-4 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.99 7.18c.04.02.08.05.12.09A7 7 0 1111 2a9 9 0 11-1 7.18z" /></svg>,
    follow_up_generated: <svg className="h-4 w-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-5 5m5-5l5 5" /></svg>,
    default: <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>,
  };
  return icons[type] || icons.default;
}

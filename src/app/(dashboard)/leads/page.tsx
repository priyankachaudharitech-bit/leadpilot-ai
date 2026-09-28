import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadTable } from '@/components/leads/LeadTable';
import { EmptyState } from '@/components/ui';
import { Plus, RefreshCw } from 'lucide-react';
import type { LeadListParams } from '@/types';
import { ITEMS_PER_PAGE } from '@/lib/utils/constants';

async function fetchLeads(params: LeadListParams) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], pagination: { page: 1, limit: 25, total: 0, totalPages: 0 } };

  let query = supabase
    .from('leads')
    .select('*, summary(*), scores(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .is('deleted_at', null);

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,company.ilike.%${params.search}%`);
  }
  if (params.status) {
    const statusArray = Array.isArray(params.status) ? params.status : [params.status];
    query = query.in('status', statusArray);
  }
  if (params.minScore !== undefined) {
    query = query.gte('score', params.minScore);
  }
  if (params.maxScore !== undefined) {
    query = query.lte('score', params.maxScore);
  }
  if (params.dateFrom) {
    query = query.gte('created_at', params.dateFrom);
  }
  if (params.dateTo) {
    query = query.lte('created_at', params.dateTo);
  }

  const limit = params.limit || ITEMS_PER_PAGE;
  const page = params.page || 1;
  const offset = (page - 1) * limit;

  const sortColumn = params.sort || 'created_at';
  const sortOrder = params.order || 'desc';
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch leads:', error);
    return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
  }

  const transformed = (data || []).map((lead: any) => {
    const summaryRecord = Array.isArray(lead.summary) ? lead.summary[0] : lead.summary;
    const scoreRecord = Array.isArray(lead.scores) ? lead.scores[0] : lead.scores;
    return {
      ...lead,
      summary: summaryRecord ?? null,
      latest_score: scoreRecord ?? null,
    };
  });

  return {
    data: transformed,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

export interface LeadsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    status?: string;
    source?: string;
    minScore?: string;
    maxScore?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params: LeadListParams = {
    page: Number(searchParams.page) || 1,
    limit: Number(searchParams.limit) || ITEMS_PER_PAGE,
    sort: (searchParams.sort as LeadListParams['sort']) || 'created_at',
    order: searchParams.order || 'desc',
    search: searchParams.search,
    status: searchParams.status as LeadListParams['status'],
    source: searchParams.source,
    minScore: searchParams.minScore ? Number(searchParams.minScore) : undefined,
    maxScore: searchParams.maxScore ? Number(searchParams.maxScore) : undefined,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage your leads with AI-powered insights
          </p>
        </div>
        <Link href="/leads/new">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </Link>
      </div>

      <LeadFilters searchParams={searchParams} />

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<LeadListSkeleton />}>
            <LeadsContent params={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function LeadsContent({ params }: { params: LeadListParams }) {
  const { data, pagination } = await fetchLeads(params);

  if (data.length === 0) {
    return (
      <EmptyState
        title="No leads found"
        description="Try adjusting your filters or create a new lead"
        action={
          <Link href="/leads/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Lead
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <LeadTable leads={data} pagination={pagination} />
    </>
  );
}

function LeadListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

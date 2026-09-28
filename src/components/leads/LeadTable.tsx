'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { type LeadWithInsights } from '@/types';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { SCORE_RANGES } from '@/lib/utils/constants';
import { CheckCircle2, Clock } from 'lucide-react';

interface LeadTableProps {
  leads: LeadWithInsights[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'closed_won' | 'closed_lost';

export function LeadTable({ leads, pagination, searchParams = {} }: LeadTableProps) {
  const buildParams = () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((val) => params.append(k, val));
      else if (v) params.set(k, v);
    });
    return params;
  };

  const handleSort = (field: string) => {
    const params = buildParams();
    const currentSort = params.get('sort') || 'created_at';
    const currentOrder = params.get('order') || 'desc';
    let newOrder: 'asc' | 'desc' = 'desc';
    if (currentSort === field) {
      newOrder = currentOrder === 'desc' ? 'asc' : 'desc';
    }
    params.set('sort', field);
    params.set('order', newOrder);
    params.set('page', '1');
    window.location.href = `/leads?${params.toString()}`;
  };

  const getSortIcon = (field: string) => {
    const sort = (searchParams.sort as string) || '';
    const order = (searchParams.order as string) || 'desc';
    if (sort !== field) return '↕';
    return order === 'desc' ? '↓' : '↑';
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <input type="checkbox" className="rounded border-border" aria-label="Select all" />
            </TableHead>
            <TableHead
              data-sortable
              className="cursor-pointer select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1 font-medium">
                Name {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead
              data-sortable
              className="cursor-pointer select-none"
              onClick={() => handleSort('score')}
            >
              <div className="flex items-center gap-1 font-medium">
                Score {getSortIcon('score')}
              </div>
            </TableHead>
            <TableHead
              data-sortable
              className="cursor-pointer select-none"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1 font-medium">
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead
              data-sortable
              className="cursor-pointer select-none"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center gap-1 font-medium">
                Created {getSortIcon('created_at')}
              </div>
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="w-[40px]">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  aria-label={`Select ${lead.name}`}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {lead.name}
                </Link>
              </TableCell>
              <TableCell>{lead.company || '—'}</TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {lead.email}
              </TableCell>
              <TableCell>
                <ScoreBadge score={lead.score} />
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/leads/${lead.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination.totalPages > 1 && (
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1}>
                Previous
              </Button>
              <span className="px-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color: keyof typeof SCORE_RANGES = 'cold';
  if (score >= 70) color = 'hot';
  else if (score >= 40) color = 'warm';

  let badgeColor: 'success' | 'warning' | 'error' = 'error';
  if (color === 'hot') badgeColor = 'success';
  else if (color === 'warm') badgeColor = 'warning';

  return (
    <Badge colorScheme={badgeColor} variant="soft">
      {score}
    </Badge>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const config: Record<LeadStatus, { label: string; icon: React.ReactNode; colorScheme: 'success' | 'warning' | 'error' | 'info' | 'neutral'; className: string }> = {
    new: { label: 'New', icon: <Clock className="h-3 w-3" />, colorScheme: 'neutral', className: '' },
    contacted: { label: 'Contacted', icon: <Clock className="h-3 w-3" />, colorScheme: 'info', className: '' },
    qualified: {
      label: 'Qualified',
      icon: <CheckCircle2 className="h-3 w-3" />,
      colorScheme: 'success',
      className: '',
    },
    unqualified: { label: 'Unqualified', icon: <Clock className="h-3 w-3" />, colorScheme: 'neutral', className: '' },
    closed_won: {
      label: 'Closed Won',
      icon: <CheckCircle2 className="h-3 w-3" />,
      colorScheme: 'success',
      className: '',
    },
    closed_lost: { label: 'Closed Lost', icon: <Clock className="h-3 w-3" />, colorScheme: 'error', className: '' },
  };

  const cfg = config[status];
  return (
    <Badge variant="soft" colorScheme={cfg.colorScheme} className={cn(cfg.className)}>
      {cfg.icon}
      <span className="ml-1">{cfg.label}</span>
    </Badge>
  );
}

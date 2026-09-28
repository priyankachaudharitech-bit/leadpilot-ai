'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { LEAD_STATUSES } from '@/lib/utils/constants';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LeadFiltersProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export function LeadFilters({ searchParams: initialParams }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const currentFilters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'search' && key !== 'page') {
      currentFilters[key] = value;
    }
  });

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    newParams.set('page', '1');
    router.push(`/leads?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = { search };
    searchParams.forEach((value, key) => {
      if (key !== 'search' && key !== 'page') {
        params[key] = value;
      }
    });
    updateURL(params);
  };

  const toggleFilter = (key: string, value: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, k) => {
      if (k !== 'search' && k !== 'page') {
        params[k] = val;
      }
    });

    if (key === 'status') {
      params[key] = value;
    } else {
      params[key] = value;
    }

    const existing = Object.fromEntries(
      Array.from(searchParams.entries()).filter(([k]) => k !== 'search' && k !== 'page')
    );

    updateURL({ ...existing, ...params });
  };

  const clearFilter = (key: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, k) => {
      if (k !== 'search' && k !== 'page' && k !== key) {
        params[k] = value;
      }
    });
    updateURL(params);
  };

  const clearAll = () => {
    router.push('/leads');
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search leads..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search leads"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <Select value={currentFilters.status || ''} onValueChange={(v) => toggleFilter('status', v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentFilters.minScore || ''} onValueChange={(v) => toggleFilter('minScore', v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Min Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="70">Hot (70+)</SelectItem>
              <SelectItem value="40">Warm (40+)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentFilters.sort || ''} onValueChange={(v) => toggleFilter('sort', v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentFilters).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {value}
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 rounded-full p-0.5 hover:bg-neutral-200"
                  aria-label={`Remove filter ${key}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

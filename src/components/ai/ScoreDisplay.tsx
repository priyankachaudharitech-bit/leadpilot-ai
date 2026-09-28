'use client';

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { Info } from 'lucide-react';
import type { Score } from '@/types';

interface ScoreDisplayProps {
  score: Score | null;
  isGenerating: boolean;
}

export function ScoreDisplay({ score, isGenerating }: ScoreDisplayProps) {
  if (isGenerating || !score) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreColor = score.value >= 70 ? 'success' : score.value >= 40 ? 'warning' : 'error';
  const scorePercent = score.value;

  const factors = score.factors || {};
  const breakdown = [
    { label: 'Fit', value: score.fit_score ?? 0, weight: '40%' },
    { label: 'Intent', value: score.intent_score ?? 0, weight: '40%' },
    { label: 'Engagement', value: score.engagement_score ?? 0, weight: '20%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-4">
          <div className="text-3xl font-bold text-success-600">{score.value}</div>
          <div className="text-sm text-muted-foreground">out of 100</div>
        </div>

        <div
          className="relative h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700"
          role="progressbar"
          aria-valuenow={score.value}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all',
              scoreColor === 'success'
                ? 'bg-success-500'
                : scoreColor === 'warning'
                  ? 'bg-warning-500'
                  : 'bg-error-500',
            )}
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {scoreColor === 'success'
            ? 'Hot lead - high priority for outreach'
            : scoreColor === 'warning'
              ? 'Warm lead - moderate priority'
              : 'Cold lead - low priority'}
        </p>

        <div className="space-y-2">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">({item.weight})</span>
                <button
                  aria-label={`What is ${item.label} score?`}
                  className="cursor-help"
                >
                  <Info className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {Object.keys(factors).length > 0 && (
          <div className="rounded-md bg-neutral-50 dark:bg-neutral-800 p-3">
            <p className="text-xs font-medium mb-2">Key Factors</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {Object.entries(factors).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span>{key}</span>
                  <span>{value as string}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

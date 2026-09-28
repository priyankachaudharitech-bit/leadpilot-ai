'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton, Spinner, ErrorState } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { RefreshCw, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryDisplayProps {
  leadId: string;
  initialContent: string | null;
  isGenerating: boolean;
  error: string | null;
  onRegenerate: () => Promise<void>;
}

export function SummaryDisplay({
  leadId,
  initialContent,
  isGenerating,
  error,
  onRegenerate,
}: SummaryDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (initialContent) {
      void navigator.clipboard.writeText(initialContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Summary copied to clipboard');
    }
  };

  if (isGenerating && !initialContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !initialContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to generate summary"
            description={error}
            onRetry={() => onRegenerate()}
          />
        </CardContent>
      </Card>
    );
  }

  if (error && initialContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-error-50 p-3 text-sm text-error-700">
            {error}
          </div>
          <p className="text-sm text-muted-foreground">Showing cached version.</p>
          <div className="prose prose-sm max-w-none">
            <p>{initialContent}</p>
          </div>
          <Button onClick={() => onRegenerate()} disabled={isGenerating} variant="outline" size="sm">
            <RefreshCw className={cn('h-4 w-4 mr-2', isGenerating && 'animate-spin')} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Summary</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!initialContent}
            aria-label={copied ? 'Copied' : 'Copy summary'}
          >
            {copied ? <Check className="h-4 w-4 text-success-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRegenerate()}
            disabled={isGenerating}
            aria-label="Regenerate summary"
          >
            {isGenerating ? (
              <Spinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isGenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {initialContent ? (
          <div className="prose prose-sm max-w-none">
            <p>{initialContent}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No summary available yet. Click regenerate to generate one.</p>
        )}
      </CardContent>
    </Card>
  );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { FollowUp } from '@/types';

interface FollowUpDisplayProps {
  followUps: FollowUp[];
}

export function FollowUpDisplay({ followUps }: FollowUpDisplayProps) {
  const handleCopy = (content: string) => {
    void navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  if (followUps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Follow-ups</CardTitle>
          <CardDescription>No follow-ups generated yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {followUps.map((fu) => (
        <Card key={fu.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">
                  {fu.type === 'email' && 'Email Follow-up'}
                  {fu.type === 'linkedin' && 'LinkedIn Message'}
                  {fu.type === 'call_script' && 'Call Script'}
                </CardTitle>
                <CardDescription>
                  {fu.tone && `Tone: ${fu.tone}`} · {fu.length && `Length: ${fu.length}`}
                </CardDescription>
              </div>
              <button
                onClick={() => handleCopy(fu.content)}
                className="rounded-md p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
              {fu.content}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

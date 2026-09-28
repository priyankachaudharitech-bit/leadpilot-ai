import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '@/types';

interface LeadActivityProps {
  activities: Activity[];
}

export function LeadActivity({ activities }: LeadActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4">
            No activity recorded for this lead yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 p-4">
              <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-2">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactElement> = {
    created: <Clock className="h-4 w-4 text-primary" />,
    updated: <Clock className="h-4 w-4 text-neutral-500" />,
    summary_generated: <Clock className="h-4 w-4 text-info-500" />,
    scored: <Clock className="h-4 w-4 text-warning-500" />,
    follow_up_generated: <Clock className="h-4 w-4 text-success-500" />,
    status_changed: <Clock className="h-4 w-4 text-primary" />,
    note_added: <Clock className="h-4 w-4 text-neutral-500" />,
  };
  return icons[type] || <Clock className="h-4 w-4 text-neutral-500" />;
}

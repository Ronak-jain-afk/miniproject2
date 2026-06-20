import { useState } from 'react';
import api from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => api.get(`/notifications?page=${page}&limit=20`).then((r: any) => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>Mark All Read</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {data?.data?.length === 0 && <p className="text-sm text-muted-foreground p-4">No notifications</p>}
          {data?.data?.map((n: any) => (
            <div
              key={n._id}
              className={cn('p-4 border-b last:border-0 flex items-start gap-3 cursor-pointer hover:bg-accent/50', !n.read && 'bg-accent/30')}
              onClick={() => !n.read && markReadMutation.mutate(n._id)}
            >
              <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', n.read ? 'bg-transparent' : 'bg-primary')} />
              <div className="flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {n.link && <Button variant="ghost" size="sm" className="text-xs" onClick={(e: any) => { e.stopPropagation(); }}>View</Button>}
            </div>
          ))}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm py-2">Page {page} of {data.pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

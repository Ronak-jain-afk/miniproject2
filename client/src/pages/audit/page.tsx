import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ actor: '', action: '', resource: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, filters],
    queryFn: () => api.get('/audit-logs', { params: { page, limit: 50, ...filters } }).then((r: any) => r.data),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs">Actor</Label>
          <Input placeholder="User ID" value={filters.actor} onChange={(e: any) => setFilters((f) => ({ ...f, actor: e.target.value }))} className="h-8 w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Action</Label>
          <select className="flex h-8 w-32 rounded-md border border-input bg-background px-2 text-xs" value={filters.action} onChange={(e: any) => setFilters((f) => ({ ...f, action: e.target.value }))}>
            <option value="">All</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Resource</Label>
          <Input placeholder="e.g. User" value={filters.resource} onChange={(e: any) => setFilters((f) => ({ ...f, resource: e.target.value }))} className="h-8 w-40" />
        </div>
        <div className="flex items-end">
          <Button variant="outline" size="sm" onClick={() => { setPage(1); setFilters({ actor: '', action: '', resource: '' }); }}>Clear</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Time</th>
                <th className="text-left p-3 font-medium">Actor</th>
                <th className="text-left p-3 font-medium">Action</th>
                <th className="text-left p-3 font-medium">Resource</th>
                <th className="text-left p-3 font-medium">Resource ID</th>
                <th className="text-left p-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>}
              {data?.data?.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No logs found</td></tr>}
              {data?.data?.map((log: any) => (
                <tr key={log._id} className="border-b last:border-0 hover:bg-accent/50">
                  <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3">{log.actor?.email || log.actor}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.action === 'create' ? 'bg-green-100 text-green-700' :
                      log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                      log.action === 'delete' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{log.action}</span>
                  </td>
                  <td className="p-3">{log.resource}</td>
                  <td className="p-3 font-mono text-xs">{log.resourceId || '—'}</td>
                  <td className="p-3 font-mono text-xs">{log.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function SessionsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await api.get('/attendance/sessions', { params: { limit: 50 } });
      return data;
    },
  });

  const { data: detailData } = useQuery({
    queryKey: ['session-detail', selected],
    queryFn: async () => {
      if (!selected) return null;
      const { data } = await api.get(`/attendance/sessions/${selected}`);
      return data.data;
    },
    enabled: !!selected,
  });

  const statusColor: Record<string, string> = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    excused: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Sessions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Section</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Students</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                : sessionsData?.data?.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No sessions.</td></tr>
                : sessionsData?.data?.map((s: any) => (
                  <tr key={s._id} className={`border-b hover:bg-muted/50 cursor-pointer ${selected === s._id ? 'bg-muted' : ''}`} onClick={() => setSelected(s._id)}>
                    <td className="p-4 text-sm">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">{s.subject?.name || '—'}</td>
                    <td className="p-4 text-sm">{s.section?.name || '—'}</td>
                    <td className="p-4"><Badge variant={s.status === 'active' ? 'success' : s.status === 'locked' ? 'secondary' : 'default'}>{s.status}</Badge></td>
                    <td className="p-4 text-sm">{s.totalStudents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {selected && detailData && (
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b font-semibold">Attendance Records</div>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Roll No</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailData.records?.map((r: any) => (
                    <tr key={r._id} className="border-b">
                      <td className="p-4 text-sm font-mono">{r.student?.rollNumber || '—'}</td>
                      <td className="p-4 text-sm">{r.student?.userId?.profile?.firstName} {r.student?.userId?.profile?.lastName}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[r.status] || ''}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

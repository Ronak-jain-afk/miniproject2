import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function StudentAttendancePage() {

  const { data, isLoading } = useQuery({
    queryKey: ['my-attendance-summary'],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/summary/student/me`);
      return data.data;
    },
  });

  const { data: records } = useQuery({
    queryKey: ['my-attendance-records'],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/students/me`);
      return data.data;
    },
  });

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  const percentageColor = !data ? 'text-muted-foreground' :
    data.percentage >= 75 ? 'text-green-600' :
    data.percentage >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Attendance</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Total Classes</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-2xl font-bold">{data?.total || 0}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Present</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-2xl font-bold text-green-600">{data?.present || 0}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Absent</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-2xl font-bold text-red-600">{data?.absent || 0}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Late</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-2xl font-bold text-yellow-600">{data?.late || 0}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Percentage</CardTitle></CardHeader><CardContent className={`p-4 pt-0 text-2xl font-bold ${percentageColor}`}>{data?.percentage || 0}%</CardContent></Card>
      </div>

      {data?.subjectWise && Object.keys(data.subjectWise).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Subject-wise Attendance</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-3 font-medium">Subject</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Present</th>
                  <th className="p-3 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.subjectWise).map(([subjId, info]: [string, any]) => (
                  <tr key={subjId} className="border-b">
                    <td className="p-3 text-sm">{subjId}</td>
                    <td className="p-3 text-sm">{info.total}</td>
                    <td className="p-3 text-sm">{info.present}</td>
                    <td className="p-3">
                      <Badge variant={info.percentage >= 75 ? 'success' : info.percentage >= 60 ? 'warning' : 'destructive'}>
                        {info.percentage}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Recent Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Subject</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records?.slice(0, 20).map((r: any) => (
                <tr key={r._id} className="border-b">
                  <td className="p-3 text-sm">{r.session?.date ? new Date(r.session.date).toLocaleDateString() : '—'}</td>
                  <td className="p-3 text-sm">{r.session?.subject?.name || '—'}</td>
                  <td className="p-3">
                    <Badge variant={r.status === 'present' ? 'success' : r.status === 'absent' ? 'destructive' : r.status === 'late' ? 'warning' : 'secondary'}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!records || records.length === 0) && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No records yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

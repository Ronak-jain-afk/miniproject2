import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function FacultyDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['faculty-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/faculty/dashboard');
      return data.data;
    },
  });

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>;
  if (!data) return <div className="p-6 text-center text-muted-foreground">No data yet.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Faculty Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Classes Conducted</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold">{data.totalClasses}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Attendance</CardTitle></CardHeader><CardContent className={`p-4 pt-0 text-3xl font-bold ${data.avgPercentage >= 75 ? 'text-green-600' : data.avgPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{data.avgPercentage}%</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Low Attendance</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold text-red-600">{data.lowAttendanceStudents}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Subjects</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold">{data.subjectStats?.length || 0}</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Attendance Trend (Last 30 Sessions)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.trends || []}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Subject-wise Attendance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.subjectStats || []} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Subject-wise Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-3 font-medium">Subject</th>
                <th className="p-3 font-medium">Total Classes</th>
                <th className="p-3 font-medium">Present Count</th>
                <th className="p-3 font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.subjectStats?.map((s: any) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3 text-sm">{s.name}</td>
                  <td className="p-3 text-sm">{s.total}</td>
                  <td className="p-3 text-sm">{s.present}</td>
                  <td className="p-3"><Badge variant={s.percentage >= 75 ? 'success' : s.percentage >= 60 ? 'warning' : 'destructive'}>{s.percentage}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

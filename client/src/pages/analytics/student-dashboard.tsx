import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function StudentDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/student/dashboard');
      return data.data;
    },
  });

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>;
  if (!data) return <div className="p-6 text-center text-muted-foreground">No data yet.</div>;

  const pctColor = data.percentage >= 75 ? 'text-green-600' : data.percentage >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        {data.belowThreshold && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            Below {data.threshold}% threshold
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Overall</CardTitle></CardHeader><CardContent className={`p-4 pt-0 text-3xl font-bold ${pctColor}`}>{data.percentage}%</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Total Classes</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold">{data.total}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Present</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold text-green-600">{data.present}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Absent</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold text-red-600">{data.absent}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Late / Excused</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold text-yellow-600">{data.late + data.excused}</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Subject-wise Attendance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.subjectWise || []} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.monthlyTrends || []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Subject Details</CardTitle></CardHeader>
        <CardContent className="p-0">
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
              {data.subjectWise?.map((s: any) => (
                <tr key={s.name} className="border-b">
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

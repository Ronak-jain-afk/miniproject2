import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#ca8a04', '#dc2626', '#8b5cf6', '#ec4899'];

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/admin/dashboard');
      return data.data;
    },
  });

  const { data: deptData } = useQuery({
    queryKey: ['admin-dept-wise'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/department-wise');
      return data.data;
    },
  });

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>;
  if (!data) return <div className="p-6 text-center text-muted-foreground">No data yet.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Total Students</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold">{data.totalStudents}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Total Faculty</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold">{data.totalFaculty}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Departments</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold">{data.totalDepts}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-3xl font-bold">{data.totalSessions}</CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Attendance</CardTitle></CardHeader><CardContent className={`p-4 pt-0 text-3xl font-bold ${data.avgAttendance >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>{data.avgAttendance}%</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Department-wise Students</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.deptStats || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="studentCount" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Department Attendance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deptData || []} dataKey="percentage" nameKey="department" cx="50%" cy="50%" outerRadius={100} label={({ department, percentage }) => `${department}: ${percentage}%`}>
                  {(deptData || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

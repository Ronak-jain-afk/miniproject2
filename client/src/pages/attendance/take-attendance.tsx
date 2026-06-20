import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';

interface StudentRecord {
  _id: string;
  student: {
    _id: string;
    rollNumber: string;
    userId: { _id: string; profile: { firstName: string; lastName: string } };
  };
  status: string;
  remarks?: string;
}

export function TakeAttendancePage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [isNew, setIsNew] = useState(false);

  const { data: subjects } = useQuery({
    queryKey: ['faculty-subjects'],
    queryFn: async () => {
      const { data } = await api.get('/faculty/me/subjects');
      return data.data;
    },
  });

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const { data } = await api.get('/sections');
      return data.data;
    },
  });

  const createSessionMut = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/attendance/sessions', { subject, section, date });
      return data.data;
    },
    onSuccess: (result) => {
      setSessionId(result.session._id);
      setRecords(result.records);
      setIsNew(result.isNew);
    },
  });

  const updateRecordsMut = useMutation({
    mutationFn: async () => {
      const payload = records.map((r) => ({
        student: r.student?._id || r.student,
        status: r.status,
        remarks: r.remarks,
      }));
      const { data } = await api.put(`/attendance/sessions/${sessionId}/records`, { records: payload });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const toggleStatus = (index: number) => {
    const order = ['present', 'absent', 'late', 'excused'];
    const current = records[index].status;
    const next = order[(order.indexOf(current) + 1) % order.length];
    setRecords(records.map((r, i) => (i === index ? { ...r, status: next } : r)));
  };

  const setAll = (status: string) => {
    setRecords(records.map((r) => ({ ...r, status })));
  };

  const statusColor: Record<string, string> = {
    present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    excused: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Take Attendance</h1>

      {!sessionId ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Select subject</option>
                  {subjects?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="">Select section</option>
                  {sections?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => createSessionMut.mutate()} disabled={!subject || !section || createSessionMut.isPending}>
              {createSessionMut.isPending ? 'Loading...' : 'Start Session'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isNew ? 'New session created' : 'Resumed existing session'} &middot; {records.length} students
            </p>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => setAll('present')}>All Present</Button>
              <Button variant="outline" size="sm" onClick={() => setAll('absent')}>All Absent</Button>
              <Button onClick={() => updateRecordsMut.mutate()} disabled={updateRecordsMut.isPending}>
                {updateRecordsMut.isPending ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium w-12">#</th>
                    <th className="p-4 font-medium">Roll No</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r._id || r.student?._id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => toggleStatus(i)}>
                      <td className="p-4 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="p-4 font-mono text-sm">{r.student?.rollNumber || '—'}</td>
                      <td className="p-4">
                        {r.student?.userId?.profile?.firstName} {r.student?.userId?.profile?.lastName}
                      </td>
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

          <Button variant="outline" onClick={() => { setSessionId(null); setRecords([]); }}>Close &amp; Start New</Button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useCrudList } from '../../hooks/use-crud';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';

export function ReportsPage() {
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [downloading, setDownloading] = useState('');

  const { data: students } = useCrudList<any>('students', { limit: 200 });
  const { data: subjects } = useCrudList<any>('subjects', { limit: 200 });

  const download = async (url: string, filename: string, key: string) => {
    setDownloading(key);
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Student Report</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Choose student...</option>
                {students?.data?.map((s: any) => (
                  <option key={s._id} value={s._id}>{s.rollNumber} — {s.userId?.profile?.firstName} {s.userId?.profile?.lastName}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => download(`/reports/student/${studentId}`, `student-${studentId}.pdf`, 'student')} disabled={!studentId || downloading === 'student'}>
              {downloading === 'student' ? 'Downloading...' : 'Download PDF'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Subject Report</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Select Subject</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Choose subject...</option>
                {subjects?.data?.map((s: any) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <Button onClick={() => download(`/reports/subject/${subjectId}`, `subject-${subjectId}.pdf`, 'subject')} disabled={!subjectId || downloading === 'subject'}>
              {downloading === 'subject' ? 'Downloading...' : 'Download PDF'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Defaulter List</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Students with attendance below 75% threshold.</p>
            <Button onClick={() => download('/reports/defaulters', 'defaulters-list.pdf', 'defaulters')} disabled={downloading === 'defaulters'}>
              {downloading === 'defaulters' ? 'Downloading...' : 'Download PDF'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useCrudList, useCrudCreate, useCrudUpdate } from '../../hooks/use-crud';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';

interface Student {
  _id: string;
  rollNumber: string;
  registrationNumber: string;
  userId: { _id: string; email: string; profile: { firstName: string; lastName: string; phone?: string } };
  department: { _id: string; name: string };
  course: { _id: string; name: string };
  currentSemester: { _id: string; name: string };
  section: { _id: string; name: string };
  admissionYear: number;
  status: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  active: 'success', graduated: 'secondary', suspended: 'warning', discontinued: 'destructive',
};

export function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({
    email: '', password: 'Pass@123',
    profile: { firstName: '', lastName: '', phone: '' },
    rollNumber: '', registrationNumber: '', department: '', course: '',
    currentSemester: '', section: '', admissionYear: new Date().getFullYear(),
  });

  const { data: depts } = useCrudList<any>('departments', { limit: 100 });
  const { data: courses } = useCrudList<any>('courses', { limit: 100 });
  const { data: semesters } = useCrudList<any>('semesters', { limit: 100 });
  const { data: sections } = useCrudList<any>('sections', { limit: 100 });
  const { data, isLoading } = useCrudList<Student>('students', { page, limit: 20, search });
  const create = useCrudCreate<Student>('students');
  const update = useCrudUpdate<Student>('students');

  const openCreate = () => {
    setEditing(null);
    setForm({
      email: '', password: 'Pass@123',
      profile: { firstName: '', lastName: '', phone: '' },
      rollNumber: '', registrationNumber: '', department: '', course: '',
      currentSemester: '', section: '', admissionYear: new Date().getFullYear(),
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await update.mutateAsync({ id: editing._id, input: { rollNumber: form.rollNumber, registrationNumber: form.registrationNumber, department: form.department, course: form.course, currentSemester: form.currentSemester, section: form.section, admissionYear: form.admissionYear } });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button onClick={openCreate}>Add Student</Button>
      </div>
      <Input placeholder="Search by name, email, roll number..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Roll No</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Dept</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Semester</th>
                <th className="p-4 font-medium">Section</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={9} className="p-4 text-center">Loading...</td></tr>
              : data?.data.length === 0 ? <tr><td colSpan={9} className="p-4 text-center text-muted-foreground">No students found.</td></tr>
              : data?.data.map((s) => (
                <tr key={s._id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-mono text-sm">{s.rollNumber}</td>
                  <td className="p-4">{s.userId?.profile?.firstName} {s.userId?.profile?.lastName}</td>
                  <td className="p-4 text-sm">{s.userId?.email}</td>
                  <td className="p-4 text-sm">{s.department?.name || '—'}</td>
                  <td className="p-4 text-sm">{s.course?.name || '—'}</td>
                  <td className="p-4 text-sm">{s.currentSemester?.name || '—'}</td>
                  <td className="p-4 text-sm">{s.section?.name || '—'}</td>
                  <td className="p-4"><Badge variant={statusColors[s.status] || 'secondary'}>{s.status}</Badge></td>
                  <td className="p-4">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(s); setOpen(true); }}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.profile.firstName} onChange={(e) => setForm({ ...form, profile: { ...form.profile, firstName: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.profile.lastName} onChange={(e) => setForm({ ...form, profile: { ...form.profile, lastName: e.target.value } })} />
            </div>
            {!editing && (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Roll Number</Label>
              <Input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select</option>
                {depts?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                <option value="">Select</option>
                {courses?.data?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.currentSemester} onChange={(e) => setForm({ ...form, currentSemester: e.target.value })}>
                <option value="">Select</option>
                {semesters?.data?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="">Select</option>
                {sections?.data?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Admission Year</Label>
              <Input type="number" min={2000} max={2100} value={form.admissionYear}
                onChange={(e) => setForm({ ...form, admissionYear: parseInt(e.target.value) || new Date().getFullYear() })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

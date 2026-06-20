import { useState } from 'react';
import { useCrudList, useCrudCreate, useCrudUpdate, useCrudDelete } from '../../hooks/use-crud';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';

interface Subject {
  _id: string;
  name: string;
  code: string;
  department: { _id: string; name: string };
  semester: { _id: string; name: string };
  credits: number;
  faculty: { _id: string; userId: { profile: { firstName: string; lastName: string } } }[];
  isActive: boolean;
}

export function SubjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', code: '', department: '', semester: '', credits: 4 });
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSubjectId, setAssignSubjectId] = useState<string | null>(null);

  const { data: depts } = useCrudList<any>('departments', { limit: 50 });
  const { data: semesters } = useCrudList<any>('semesters', { limit: 100 });
  const { data: facultyList } = useCrudList<any>('faculty', { limit: 100 });
  const { data, isLoading } = useCrudList<Subject>('subjects', { page, limit: 20, search });
  const create = useCrudCreate<Subject>('subjects');
  const update = useCrudUpdate<Subject>('subjects');
  const remove = useCrudDelete('subjects');

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', department: '', semester: '', credits: 4 }); setOpen(true); };
  const openEdit = (s: Subject) => { setEditing(s); setForm({ name: s.name, code: s.code, department: s.department?._id || '', semester: s.semester?._id || '', credits: s.credits }); setOpen(true); };

  const handleSubmit = async () => {
    if (editing) { await update.mutateAsync({ id: editing._id, input: form }); }
    else { await create.mutateAsync(form); }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Button onClick={openCreate}>Add Subject</Button>
      </div>
      <Input placeholder="Search subjects..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Dept</th>
                <th className="p-4 font-medium">Semester</th>
                <th className="p-4 font-medium">Credits</th>
                <th className="p-4 font-medium">Faculty</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={8} className="p-4 text-center">Loading...</td></tr>
              : data?.data.length === 0 ? <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No subjects found.</td></tr>
              : data?.data.map((s) => (
                <tr key={s._id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-mono text-sm">{s.code}</td>
                  <td className="p-4">{s.name}</td>
                  <td className="p-4 text-sm">{s.department?.name || '—'}</td>
                  <td className="p-4 text-sm">{s.semester?.name || '—'}</td>
                  <td className="p-4 text-sm">{s.credits}</td>
                  <td className="p-4 text-sm">
                    {s.faculty?.length ? s.faculty.map((f: any) => f?.userId?.profile?.firstName || 'Unknown').join(', ') : '—'}
                  </td>
                  <td className="p-4"><Badge variant={s.isActive ? 'success' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="p-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setAssignSubjectId(s._id); setAssignOpen(true); }}>Assign</Button>
                    <Button variant="destructive" size="sm" onClick={() => remove.mutate(s._id)}>Deactivate</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Faculty</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Select Faculty</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={async (e) => {
              if (e.target.value && assignSubjectId) {
                try {
                  await (await import('../../lib/api')).default.post(`/subjects/${assignSubjectId}/faculty`, { facultyId: e.target.value });
                  setAssignOpen(false);
                } catch {}
              }
            }}>
              <option value="">Choose faculty...</option>
              {facultyList?.data?.map((f: any) => (
                <option key={f._id} value={f._id}>{f.userId?.profile?.firstName} {f.userId?.profile?.lastName}</option>
              ))}
            </select>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Subject' : 'Add Subject'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {depts?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                <option value="">Select semester</option>
                {semesters?.data?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Credits</Label>
              <Input type="number" min={1} max={10} value={form.credits} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 4 })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

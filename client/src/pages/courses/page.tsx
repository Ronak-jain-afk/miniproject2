import { useState } from 'react';
import { useCrudList, useCrudCreate, useCrudUpdate, useCrudDelete } from '../../hooks/use-crud';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';

interface Course {
  _id: string;
  name: string;
  code: string;
  department: { _id: string; name: string };
  duration: number;
  isActive: boolean;
}

export function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', code: '', department: '', duration: 4 });
  const { data: depts } = useCrudList<any>('departments', { limit: 50 });
  const { data, isLoading } = useCrudList<Course>('courses', { page, limit: 20, search });
  const create = useCrudCreate<Course>('courses');
  const update = useCrudUpdate<Course>('courses');
  const remove = useCrudDelete('courses');

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', department: '', duration: 4 });
    setOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ name: c.name, code: c.code, department: c.department?._id || '', duration: c.duration });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await update.mutateAsync({ id: editing._id, input: form });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button onClick={openCreate}>Add Course</Button>
      </div>
      <Input placeholder="Search courses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No courses found.</td></tr>
              ) : (
                data?.data.map((c) => (
                  <tr key={c._id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-sm">{c.code}</td>
                    <td className="p-4">{c.name}</td>
                    <td className="p-4 text-sm">{c.department?.name || '—'}</td>
                    <td className="p-4 text-sm">{c.duration} yrs</td>
                    <td className="p-4"><Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-4 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => remove.mutate(c._id)}>Deactivate</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Course' : 'Add Course'}</DialogTitle></DialogHeader>
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
              <Label>Duration (years)</Label>
              <Input type="number" min={1} max={6} value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 4 })} />
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

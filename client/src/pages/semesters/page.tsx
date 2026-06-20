import { useState } from 'react';
import { useCrudList, useCrudCreate, useCrudUpdate, useCrudDelete } from '../../hooks/use-crud';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';

interface Semester {
  _id: string;
  name: string;
  number: number;
  course: { _id: string; name: string };
  isActive: boolean;
}

export function SemestersPage() {
  const [page] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [form, setForm] = useState({ name: '', number: 1, course: '' });

  const { data: courses } = useCrudList<any>('courses', { limit: 100 });
  const { data, isLoading } = useCrudList<Semester>('semesters', { page, limit: 20 });
  const create = useCrudCreate<Semester>('semesters');
  const update = useCrudUpdate<Semester>('semesters');
  const remove = useCrudDelete('semesters');

  const openCreate = () => { setEditing(null); setForm({ name: '', number: 1, course: '' }); setOpen(true); };
  const openEdit = (s: Semester) => { setEditing(s); setForm({ name: s.name, number: s.number, course: s.course?._id || '' }); setOpen(true); };

  const handleSubmit = async () => {
    if (editing) { await update.mutateAsync({ id: editing._id, input: form }); }
    else { await create.mutateAsync(form); }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Semesters</h1>
        <Button onClick={openCreate}>Add Semester</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              : data?.data.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No semesters found.</td></tr>
              : data?.data.map((s) => (
                <tr key={s._id} className="border-b hover:bg-muted/50">
                  <td className="p-4 text-sm">{s.number}</td>
                  <td className="p-4">{s.name}</td>
                  <td className="p-4 text-sm">{s.course?.name || '—'}</td>
                  <td className="p-4"><Badge variant={s.isActive ? 'success' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="p-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => remove.mutate(s._id)}>Deactivate</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Semester' : 'Add Semester'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Number</Label>
                <Input type="number" min={1} max={12} value={form.number} onChange={(e) => setForm({ ...form, number: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
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

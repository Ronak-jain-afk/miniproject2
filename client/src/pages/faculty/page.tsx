import { useState } from 'react';
import { useCrudList, useCrudCreate, useCrudUpdate } from '../../hooks/use-crud';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';

interface Faculty {
  _id: string;
  employeeId: string;
  userId: { _id: string; email: string; profile: { firstName: string; lastName: string; phone?: string } };
  department: { _id: string; name: string };
  subjects: { _id: string; name: string; code: string }[];
  joiningDate?: string;
  qualification?: string;
  specialization?: string;
}

export function FacultyPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState({
    email: '', password: 'Pass@123',
    profile: { firstName: '', lastName: '', phone: '' },
    employeeId: '', department: '', joiningDate: '', qualification: '', specialization: '',
  });

  const { data: depts } = useCrudList<any>('departments', { limit: 100 });
  const { data, isLoading } = useCrudList<Faculty>('faculty', { page, limit: 20, search });
  const create = useCrudCreate<Faculty>('faculty');
  const update = useCrudUpdate<Faculty>('faculty');

  const openCreate = () => {
    setEditing(null);
    setForm({ email: '', password: 'Pass@123', profile: { firstName: '', lastName: '', phone: '' }, employeeId: '', department: '', joiningDate: '', qualification: '', specialization: '' });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await update.mutateAsync({ id: editing._id, input: { employeeId: form.employeeId, department: form.department, joiningDate: form.joiningDate, qualification: form.qualification, specialization: form.specialization, profile: form.profile } });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Faculty</h1>
        <Button onClick={openCreate}>Add Faculty</Button>
      </div>
      <Input placeholder="Search by name, email, employee ID..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Emp ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium">Subjects</th>
                <th className="p-4 font-medium">Qualification</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
              : data?.data.length === 0 ? <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No faculty found.</td></tr>
              : data?.data.map((f) => (
                <tr key={f._id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-mono text-sm">{f.employeeId}</td>
                  <td className="p-4">{f.userId?.profile?.firstName} {f.userId?.profile?.lastName}</td>
                  <td className="p-4 text-sm">{f.userId?.email}</td>
                  <td className="p-4 text-sm">{f.department?.name || '—'}</td>
                  <td className="p-4 text-sm">{f.subjects?.map((s) => s.name).join(', ') || '—'}</td>
                  <td className="p-4 text-sm">{f.qualification || '—'}</td>
                  <td className="p-4">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(f); setOpen(true); }}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Faculty' : 'Add Faculty'}</DialogTitle></DialogHeader>
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
              <Label>Employee ID</Label>
              <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select</option>
                {depts?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Specialization</Label>
              <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
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

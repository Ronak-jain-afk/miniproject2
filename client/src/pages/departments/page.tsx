import { useState } from 'react';
import { useCrudList, useCrudCreate, useCrudUpdate, useCrudDelete } from '../../hooks/use-crud';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card, CardContent,
} from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  isActive: boolean;
}

export function DepartmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', headOfDepartment: '' });

  const { data, isLoading } = useCrudList<Department>('departments', { page, limit: 20, search });
  const create = useCrudCreate<Department>('departments');
  const update = useCrudUpdate<Department>('departments');
  const remove = useCrudDelete('departments');

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '', headOfDepartment: '' });
    setOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description || '', headOfDepartment: dept.headOfDepartment || '' });
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

  const handleDelete = async (id: string) => {
    if (confirm('Deactivate this department?')) {
      await remove.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={openCreate}>Add Department</Button>
      </div>

      <Input
        placeholder="Search departments..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="max-w-sm"
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Head</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No departments found.</td></tr>
              ) : (
                data?.data.map((dept) => (
                  <tr key={dept._id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-sm">{dept.code}</td>
                    <td className="p-4">{dept.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{dept.headOfDepartment || '—'}</td>
                    <td className="p-4"><Badge variant={dept.isActive ? 'success' : 'secondary'}>{dept.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-4 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(dept)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(dept._id)}>Deactivate</Button>
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
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
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
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Head of Department</Label>
              <Input value={form.headOfDepartment} onChange={(e) => setForm({ ...form, headOfDepartment: e.target.value })} />
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

import { useState } from 'react';
import { useCrudList, useCrudCreate, useCrudUpdate, useCrudDelete } from '../../hooks/use-crud';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';

interface Rule {
  _id: string;
  department?: { _id: string; name: string };
  semester?: { _id: string; name: string };
  minimumPercentage: number;
  lateCountsAsPresent: boolean;
  excusedCountsAsPresent: boolean;
  freezePeriodHours: number;
  warningThresholds: number[];
  consecutiveAbsenceLimit: number;
}

export function RulesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [form, setForm] = useState({
    department: '', semester: '', minimumPercentage: 75, lateCountsAsPresent: false,
    excusedCountsAsPresent: true, freezePeriodHours: 24, warningThresholds: '75,65,50', consecutiveAbsenceLimit: 5,
  });

  const { data: depts } = useCrudList<any>('departments', { limit: 100 });
  const { data: semesters } = useCrudList<any>('semesters', { limit: 100 });
  const { data, isLoading } = useCrudList<Rule>('rules');
  const create = useCrudCreate<Rule>('rules');
  const update = useCrudUpdate<Rule>('rules');
  const remove = useCrudDelete('rules');

  const openCreate = () => {
    setEditing(null);
    setForm({ department: '', semester: '', minimumPercentage: 75, lateCountsAsPresent: false, excusedCountsAsPresent: true, freezePeriodHours: 24, warningThresholds: '75,65,50', consecutiveAbsenceLimit: 5 });
    setOpen(true);
  };

  const openEdit = (r: Rule) => {
    setEditing(r);
    setForm({
      department: r.department?._id || '', semester: r.semester?._id || '',
      minimumPercentage: r.minimumPercentage, lateCountsAsPresent: r.lateCountsAsPresent,
      excusedCountsAsPresent: r.excusedCountsAsPresent, freezePeriodHours: r.freezePeriodHours,
      warningThresholds: r.warningThresholds.join(','), consecutiveAbsenceLimit: r.consecutiveAbsenceLimit,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      warningThresholds: form.warningThresholds.split(',').map(Number).filter((n) => !isNaN(n)),
      department: form.department || undefined,
      semester: form.semester || undefined,
    };
    if (editing) { await update.mutateAsync({ id: editing._id, input: payload }); }
    else { await create.mutateAsync(payload); }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance Rules</h1>
        <Button onClick={openCreate}>Add Rule</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Rules are resolved by specificity: Department+Semester → Department → Semester → Global default.
        Leave Department and Semester empty for a global rule.
      </p>
      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Scope</th>
                <th className="p-4 font-medium">Min %</th>
                <th className="p-4 font-medium">Late Counts</th>
                <th className="p-4 font-medium">Excused Counts</th>
                <th className="p-4 font-medium">Freeze (hrs)</th>
                <th className="p-4 font-medium">Warnings</th>
                <th className="p-4 font-medium">Consecutive Limit</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={8} className="p-4 text-center">Loading...</td></tr>
              : data?.data.length === 0 ? <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No rules configured.</td></tr>
              : data?.data.map((r) => (
                <tr key={r._id} className="border-b hover:bg-muted/50">
                  <td className="p-4 text-sm">
                    {r.department?.name || '—'} {r.semester ? `/ ${r.semester.name}` : ''}
                    {!r.department && !r.semester ? <span className="font-medium">Global</span> : ''}
                  </td>
                  <td className="p-4 text-sm font-semibold">{r.minimumPercentage}%</td>
                  <td className="p-4 text-sm">{r.lateCountsAsPresent ? 'Yes' : 'No'}</td>
                  <td className="p-4 text-sm">{r.excusedCountsAsPresent ? 'Yes' : 'No'}</td>
                  <td className="p-4 text-sm">{r.freezePeriodHours}h</td>
                  <td className="p-4 text-sm">{r.warningThresholds?.join(', ')}</td>
                  <td className="p-4 text-sm">{r.consecutiveAbsenceLimit}</td>
                  <td className="p-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => remove.mutate(r._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Rule' : 'Add Rule'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department (optional)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">All departments</option>
                {depts?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Semester (optional)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                <option value="">All semesters</option>
                {semesters?.data?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Min Attendance %</Label>
              <Input type="number" min={0} max={100} value={form.minimumPercentage} onChange={(e) => setForm({ ...form, minimumPercentage: parseInt(e.target.value) || 75 })} />
            </div>
            <div className="space-y-2">
              <Label>Freeze Period (hours)</Label>
              <Input type="number" min={1} value={form.freezePeriodHours} onChange={(e) => setForm({ ...form, freezePeriodHours: parseInt(e.target.value) || 24 })} />
            </div>
            <div className="space-y-2">
              <Label>Consecutive Absence Limit</Label>
              <Input type="number" min={1} value={form.consecutiveAbsenceLimit} onChange={(e) => setForm({ ...form, consecutiveAbsenceLimit: parseInt(e.target.value) || 5 })} />
            </div>
            <div className="space-y-2">
              <Label>Warning Thresholds (comma-sep)</Label>
              <Input value={form.warningThresholds} onChange={(e) => setForm({ ...form, warningThresholds: e.target.value })} />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.lateCountsAsPresent} onChange={(e) => setForm({ ...form, lateCountsAsPresent: e.target.checked })} />
                Late counts as present
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.excusedCountsAsPresent} onChange={(e) => setForm({ ...form, excusedCountsAsPresent: e.target.checked })} />
                Excused counts as present
              </label>
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

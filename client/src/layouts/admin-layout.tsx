import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth-context';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/departments', label: 'Departments' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/semesters', label: 'Semesters' },
  { to: '/admin/subjects', label: 'Subjects' },
  { to: '/admin/sections', label: 'Sections' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/faculty', label: 'Faculty' },
  { to: '/admin/rules', label: 'Attendance Rules' },
  { to: '/admin/reports', label: 'Reports' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-card border-r p-4 space-y-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn('block px-3 py-2 rounded-md text-sm transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">{user?.profile.firstName} {user?.profile.lastName}</p>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-2 w-full justify-start">Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

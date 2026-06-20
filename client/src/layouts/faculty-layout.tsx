import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth-context';
import { Button } from '../components/ui/button';

export function FacultyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-card border-r p-4 space-y-4">
        <h1 className="text-xl font-bold">Faculty Portal</h1>
        <nav className="space-y-2">
          <Link to="/faculty" className="block px-3 py-2 rounded-md hover:bg-accent">Dashboard</Link>
          <Link to="/faculty/attendance" className="block px-3 py-2 rounded-md hover:bg-accent">Take Attendance</Link>
          <Link to="/faculty/sessions" className="block px-3 py-2 rounded-md hover:bg-accent">My Sessions</Link>
          <Link to="/faculty/reports" className="block px-3 py-2 rounded-md hover:bg-accent">Reports</Link>
        </nav>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">{user?.profile.firstName} {user?.profile.lastName}</p>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-2">Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

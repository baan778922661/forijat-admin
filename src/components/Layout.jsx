import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BadgeCheck, Banknote, ClipboardList, CreditCard, LogOut, UserCheck, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/payments', label: 'التحقق من المدفوعات', icon: BadgeCheck },
  { to: '/orders', label: 'مراقبة الطلبات', icon: ClipboardList },
  { to: '/technicians', label: 'إدارة الفنيين', icon: UserCheck },
  { to: '/payouts', label: 'السحوبات اليومية', icon: Banknote },
  { to: '/methods', label: 'قنوات الدفع', icon: CreditCard },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-brand-700 text-white flex flex-col">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="bg-white/10 p-2 rounded-xl">
            <Wrench size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight">فُرِجَت</h1>
            <p className="text-xs text-white/60">لوحة تحكم الإدارة</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-white/50 mb-3" dir="ltr">{user?.phone}</p>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-xs text-white/70 hover:text-white"
          >
            <LogOut size={14} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

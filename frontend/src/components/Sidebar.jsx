import { BarChart3, Settings, DatabaseZap } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="glass-panel w-full lg:w-72 p-4 lg:p-6">
      <div className="flex items-center gap-3 pb-6 border-b border-white/10">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-blue via-neon-violet to-neon-pink p-[1px]">
          <div className="h-full w-full rounded-xl bg-slate-950/80 flex items-center justify-center">
            <DatabaseZap className="h-5 w-5 text-neon-blue" />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-300">Monitoramento</p>
          <h1 className="font-semibold">DB Control Center</h1>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                isActive
                  ? 'bg-white/15 text-white border border-white/15'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

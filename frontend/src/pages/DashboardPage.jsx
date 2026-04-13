import { useEffect, useState } from 'react';
import { Activity, HardDrive, Cpu } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ disk: [], sessions: [], queries: [] });

  useEffect(() => {
    async function load() {
      const [diskRes, sessionRes, queryRes] = await Promise.all([
        api.get('/metrics/disk-space?limit=6'),
        api.get('/metrics/sessions?limit=6'),
        api.get('/metrics/high-cpu-queries?limit=6'),
      ]);

      setStats({
        disk: diskRes.data,
        sessions: sessionRes.data.session_history || [],
        queries: queryRes.data,
      });
    }

    load().catch((error) => {
      console.error('Erro ao carregar dashboard:', error);
    });
  }, []);

  const cards = [
    { icon: HardDrive, label: 'Métricas de Disco', value: stats.disk.length },
    { icon: Activity, label: 'Snapshots de Sessões', value: stats.sessions.length },
    { icon: Cpu, label: 'Queries de Alto CPU', value: stats.queries.length },
  ];

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-slate-300 mt-1">Visão rápida das coletas históricas mais recentes.</p>
      </header>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <article key={label} className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-300">{label}</p>
              <Icon className="h-4 w-4 text-neon-blue" />
            </div>
            <p className="text-3xl font-bold mt-3">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

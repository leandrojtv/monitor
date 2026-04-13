import { useCallback, useEffect, useState } from 'react';
import { Activity, Database, HardDrive, RefreshCcw } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../services/api';

function formatDateTime(value) {
  if (!value) return 'Sem dados';
  return new Date(value).toLocaleString('pt-BR');
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshSeconds, setRefreshSeconds] = useState(60);
  const [data, setData] = useState({
    kpis: {
      totalSpaceUsedGB: 0,
      totalSpaceAvailableGB: 0,
      totalSessoesAtivas: 0,
    },
    armazenamento: [],
    desperdicio: [],
    skewTop5: [],
    segurancaLogonsPorHora: [],
    cpuHeavyQueries: [],
    lastUpdated: null,
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/metrics/dashboard');
      setData(response.data);
      setLastRefresh(new Date().toISOString());
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    api
      .get('/config')
      .then((res) => {
        if (res.data?.dashboard_refresh_rate_seconds) {
          setRefreshSeconds(Number(res.data.dashboard_refresh_rate_seconds));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!refreshSeconds) return undefined;

    const interval = setInterval(() => {
      loadDashboard();
    }, refreshSeconds * 1000);

    return () => clearInterval(interval);
  }, [loadDashboard, refreshSeconds]);

  const kpis = [
    {
      label: 'Espaço Usado',
      value: `${data.kpis.totalSpaceUsedGB} GB`,
      helper: `Disponível: ${data.kpis.totalSpaceAvailableGB} GB`,
      icon: HardDrive,
    },
    {
      label: 'Sessões Ativas',
      value: data.kpis.totalSessoesAtivas,
      helper: 'Snapshot mais recente (Query 5.1)',
      icon: Activity,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard Analítico</h2>
          <p className="text-slate-300 text-sm mt-1">
            Última atualização da API: {formatDateTime(data.lastUpdated)} • Último refresh manual:{' '}
            {formatDateTime(lastRefresh)}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-70"
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map(({ label, value, helper, icon: Icon }) => (
          <article key={label} className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-slate-300">{label}</p>
              <Icon className="h-5 w-5 text-neon-blue" />
            </div>
            <p className="text-3xl font-bold mt-3">{value}</p>
            <p className="text-sm text-slate-400 mt-1">{helper}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <article className="glass-panel p-5">
          <h3 className="font-semibold mb-4">Armazenamento por Database (Query 1.2)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.armazenamento}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="database_name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentualUsado" fill="#38bdf8" name="Percentual Usado (%)" />
                <Bar dataKey="currentPermGB" fill="#8b5cf6" name="CurrentPerm (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-panel p-5">
          <h3 className="font-semibold mb-4">Top 5 Tabelas por Skew Factor (Query 2.1)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.skewTop5} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#cbd5e1" />
                <YAxis dataKey="table_name" type="category" stroke="#cbd5e1" width={140} />
                <Tooltip />
                <Bar dataKey="skew_factor" fill="#ec4899" name="Skew Factor (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <article className="glass-panel p-5 overflow-auto">
          <h3 className="font-semibold mb-4">Alerta de Desperdício (Query 1.4)</h3>
          <table className="w-full text-sm">
            <thead className="text-slate-300 border-b border-white/10">
              <tr>
                <th className="text-left py-2">Database</th>
                <th className="text-right py-2">CurrentPerm GB</th>
                <th className="text-right py-2">% Usado</th>
                <th className="text-right py-2">Desperdício GB</th>
              </tr>
            </thead>
            <tbody>
              {data.desperdicio.map((item) => (
                <tr key={item.database_name} className="border-b border-white/5">
                  <td className="py-2">{item.database_name}</td>
                  <td className="py-2 text-right">{item.currentPermGB}</td>
                  <td className="py-2 text-right">{item.percentualUsado}%</td>
                  <td className="py-2 text-right text-amber-300">{item.wastedGB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="glass-panel p-5">
          <h3 className="font-semibold mb-4">Logons por Hora vs Força Bruta (Queries 5.3 / 3.2)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.segurancaLogonsPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="logons" stroke="#38bdf8" fill="#38bdf833" name="Logons" />
                <Area
                  type="monotone"
                  dataKey="brute_force_attempts"
                  stroke="#ef4444"
                  fill="#ef444433"
                  name="Força bruta"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="glass-panel p-5 overflow-auto">
        <h3 className="font-semibold mb-4">Execução de CPU (AMPCPUTime &gt; 100s) — Query 2.4</h3>
        <table className="w-full text-sm">
          <thead className="text-slate-300 border-b border-white/10">
            <tr>
              <th className="text-left py-2">User</th>
              <th className="text-right py-2">CPU Seconds</th>
              <th className="text-left py-2">Resumo SQL</th>
            </tr>
          </thead>
          <tbody>
            {data.cpuHeavyQueries.map((item, index) => (
              <tr key={`${item.user_name}-${index}`} className="border-b border-white/5">
                <td className="py-2">{item.user_name}</td>
                <td className="py-2 text-right text-rose-300">{item.cpu_seconds}</td>
                <td className="py-2 max-w-[620px] truncate">{item.sql_resume}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!data.cpuHeavyQueries.length && (
          <div className="text-slate-400 text-sm flex items-center gap-2 pt-2">
            <Database className="h-4 w-4" />
            Nenhuma query acima de 100s no período atual.
          </div>
        )}
      </article>
    </section>
  );
}

import { useEffect, useState } from 'react';
import api from '../services/api';

const initialState = {
  jdbc_connection_string: '',
  jdbc_user: '',
  jdbc_password: '',
  cron_interval_days: 1,
  cron_days_of_week: ['1', '2', '3', '4', '5'],
  cron_hour: 2,
  dashboard_refresh_rate_seconds: 60,
};

export default function SettingsPage() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api
      .get('/config')
      .then((res) => {
        if (res.data) {
          setForm((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch((error) => console.error('Erro ao carregar configurações:', error));
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('Salvando...');
    try {
      await api.post('/config', form);
      setStatus('Configurações salvas com sucesso.');
    } catch (error) {
      setStatus('Falha ao salvar configurações.');
      console.error(error);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Configurações</h2>
        <p className="text-slate-300 mt-1">Defina conexão JDBC e parâmetros de agendamento.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-slate-300">String de conexão JDBC</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
            value={form.jdbc_connection_string || ''}
            onChange={(e) => updateField('jdbc_connection_string', e.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Usuário JDBC</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
            value={form.jdbc_user || ''}
            onChange={(e) => updateField('jdbc_user', e.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Senha JDBC</span>
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
            value={form.jdbc_password || ''}
            onChange={(e) => updateField('jdbc_password', e.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Intervalo (dias)</span>
          <input
            type="number"
            min="1"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
            value={form.cron_interval_days || 1}
            onChange={(e) => updateField('cron_interval_days', Number(e.target.value))}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Hora da execução (0-23)</span>
          <input
            type="number"
            min="0"
            max="23"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
            value={form.cron_hour || 0}
            onChange={(e) => updateField('cron_hour', Number(e.target.value))}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Dias da semana (1..7, CSV)</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
            value={(form.cron_days_of_week || []).join(',')}
            onChange={(e) =>
              updateField(
                'cron_days_of_week',
                e.target.value
                  .split(',')
                  .map((d) => d.trim())
                  .filter(Boolean)
              )
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Refresh do dashboard (seg)</span>
          <input
            type="number"
            min="5"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
            value={form.dashboard_refresh_rate_seconds || 60}
            onChange={(e) => updateField('dashboard_refresh_rate_seconds', Number(e.target.value))}
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-between gap-3 mt-2">
          <p className="text-sm text-slate-300">{status}</p>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Salvar
          </button>
        </div>
      </form>
    </section>
  );
}

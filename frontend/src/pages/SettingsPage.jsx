import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Save } from 'lucide-react';
import api from '../services/api';

const days = [
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
  { value: '7', label: 'Dom' },
];

const refreshOptions = [
  { value: 30, label: '30 segundos' },
  { value: 60, label: '1 minuto' },
  { value: 300, label: '5 minutos' },
];

const initialState = {
  jdbc_connection_string: '',
  jdbc_user: '',
  jdbc_password: '',
  cron_interval_days: 1,
  cron_days_of_week: ['1', '2', '3', '4', '5'],
  schedule_time: '02:00',
  dashboard_refresh_rate_seconds: 60,
};

function parseScheduleTime(hour = 2, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function SettingsPage() {
  const [form, setForm] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    api
      .get('/config')
      .then((res) => {
        if (!res.data) return;
        setForm((prev) => ({
          ...prev,
          ...res.data,
          schedule_time: parseScheduleTime(res.data.cron_hour, res.data.cron_minute || 0),
        }));
      })
      .catch((error) => console.error('Erro ao carregar configurações:', error));
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(timeout);
  }, [showToast]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day) {
    setForm((prev) => {
      const exists = prev.cron_days_of_week.includes(day);
      return {
        ...prev,
        cron_days_of_week: exists
          ? prev.cron_days_of_week.filter((d) => d !== day)
          : [...prev.cron_days_of_week, day].sort(),
      };
    });
  }

  const payload = useMemo(() => {
    const [hour, minute] = (form.schedule_time || '02:00').split(':').map(Number);
    return {
      jdbc_connection_string: form.jdbc_connection_string,
      jdbc_user: form.jdbc_user,
      jdbc_password: form.jdbc_password,
      cron_interval_days: Number(form.cron_interval_days),
      cron_days_of_week: form.cron_days_of_week,
      cron_hour: Number.isNaN(hour) ? 2 : hour,
      cron_minute: Number.isNaN(minute) ? 0 : minute,
      dashboard_refresh_rate_seconds: Number(form.dashboard_refresh_rate_seconds),
    };
  }, [form]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await api.post('/config', payload);
      setShowToast(true);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  return (
    <section className="space-y-6 relative">
      <header>
        <h2 className="text-2xl font-semibold">Configurações</h2>
        <p className="text-slate-300 mt-1">Gerencie a conexão Teradata e parâmetros de agendamento.</p>
      </header>

      {showToast && (
        <div className="fixed top-5 right-5 z-50 glass-panel px-4 py-3 flex items-center gap-2 border-emerald-400/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span className="text-sm text-emerald-100">Configurações salvas com sucesso.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <article className="glass-panel p-5 space-y-4">
          <h3 className="text-lg font-semibold">Conexão Teradata</h3>

          <label className="space-y-2 block">
            <span className="text-sm text-slate-300">JDBC URL</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
              value={form.jdbc_connection_string || ''}
              onChange={(e) => updateField('jdbc_connection_string', e.target.value)}
              placeholder="jdbc:teradata://host/database=db"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm text-slate-300">Usuário</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
              value={form.jdbc_user || ''}
              onChange={(e) => updateField('jdbc_user', e.target.value)}
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm text-slate-300">Senha</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-neon-blue"
                value={form.jdbc_password || ''}
                onChange={(e) => updateField('jdbc_password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                aria-label="Alternar visibilidade da senha"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
        </article>

        <article className="glass-panel p-5 space-y-4">
          <h3 className="text-lg font-semibold">Agendamento e Atualização (Schedule)</h3>

          <label className="space-y-2 block">
            <span className="text-sm text-slate-300">Intervalo de execução (dias)</span>
            <input
              type="number"
              min="1"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
              value={form.cron_interval_days}
              onChange={(e) => updateField('cron_interval_days', e.target.value)}
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm text-slate-300 block">Dias da semana</span>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {days.map((day) => {
                const checked = form.cron_days_of_week.includes(day.value);
                return (
                  <label
                    key={day.value}
                    className={`rounded-xl border px-2 py-2 text-center text-sm cursor-pointer transition ${
                      checked
                        ? 'border-neon-blue bg-neon-blue/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDay(day.value)}
                      className="sr-only"
                    />
                    {day.label}
                  </label>
                );
              })}
            </div>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm text-slate-300">Horário da coleta pesada (HH:MM)</span>
            <input
              type="time"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
              value={form.schedule_time}
              onChange={(e) => updateField('schedule_time', e.target.value)}
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm text-slate-300">Atualização automática do frontend</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-blue"
              value={Number(form.dashboard_refresh_rate_seconds)}
              onChange={(e) => updateField('dashboard_refresh_rate_seconds', Number(e.target.value))}
            >
              {refreshOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </article>

        <div className="xl:col-span-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-semibold text-slate-950"
          >
            <Save className="h-4 w-4" />
            Salvar configurações
          </button>
        </div>
      </form>
    </section>
  );
}

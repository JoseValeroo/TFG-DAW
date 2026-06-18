import { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import { profileApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';

function Configuracion() {
  const { token } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', location: '' });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileApi
      .me(token)
      .then((p) => setForm({ name: p.name || '', bio: p.bio || '', location: p.location || '' }))
      .catch(() => {});
  }, [token]);

  const save = async () => {
    setSaving(true);
    setStatus('');
    try {
      await profileApi.update(form, token);
      setStatus('Cambios guardados ✓');
    } catch {
      setStatus('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Configuración">
      <div className="panel">
        <label className="field-label">Nombre</label>
        <input
          className="field-input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tu nombre"
        />
        <label className="field-label">Biografía</label>
        <textarea
          className="field-textarea"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          maxLength={280}
          placeholder="Cuéntanos sobre ti"
        />
        <label className="field-label">Ubicación</label>
        <input
          className="field-input"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Ciudad, país"
        />
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" className="pill-btn" onClick={save} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {status && <span className="muted">{status}</span>}
        </div>
      </div>
    </AppShell>
  );
}

export default Configuracion;

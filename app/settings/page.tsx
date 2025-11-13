'use client';

import { FormEvent, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface WhatsAppConfig {
  id?: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhone?: string;
  verifyToken: string;
  accessToken: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WhatsAppConfig>({
    wabaId: '',
    phoneNumberId: '',
    displayPhone: '',
    verifyToken: '',
    accessToken: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchConfig = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/whatsapp/config', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data || config);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  }, [config, router]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMessage('Configurações salvas com sucesso!');
      } else {
        setMessage('Erro ao salvar configurações');
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações WhatsApp</h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes('sucesso')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">WABA ID</label>
            <input
              type="text"
              value={config.wabaId}
              onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number ID</label>
            <input
              type="text"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Display Phone</label>
            <input
              type="text"
              value={config.displayPhone}
              onChange={(e) => setConfig({ ...config, displayPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Verify Token</label>
            <input
              type="text"
              value={config.verifyToken}
              onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Access Token</label>
            <input
              type="password"
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200 text-sm text-gray-700">
          <p className="font-semibold mb-2">Webhook URL:</p>
          <code className="block bg-gray-100 p-2 rounded break-all">
            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : ''}
          </code>
        </div>
      </div>
    </div>
  );
}
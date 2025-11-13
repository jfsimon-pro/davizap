'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  status: string;
}

interface Campaign {
  id: string;
  name: string;
  template: Template;
  totalPlanned: number;
  startedAt: string | null;
  finishedAt: string | null;
  items: { status: string }[];
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router]);

  async function fetchData() {
    try {
      const token = localStorage.getItem('token');

      const [campaignsRes, templatesRes] = await Promise.all([
        fetch('/api/campaigns', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/templates', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.filter((t: Template) => t.status === 'APPROVED'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCampaign(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!csvContent.trim()) {
      alert('Por favor, insira números de telefone no formato CSV');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const phoneNumbers = csvContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((phone) => {
          // Ensure E.164 format
          const cleaned = phone.replace(/\D/g, '');
          return cleaned.length >= 10 ? `+${cleaned}` : null;
        })
        .filter(Boolean);

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          templateId: formData.templateId,
          phoneNumbers,
        }),
      });

      if (res.ok) {
        const newCampaign = await res.json();
        setCampaigns([newCampaign, ...campaigns]);
        setFormData({ name: '', templateId: '' });
        setCsvContent('');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Erro ao criar campanha');
    }
  }

  async function handleStartCampaign(campaignId: string) {
    if (!confirm('Deseja realmente iniciar esta campanha?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error starting campaign:', error);
      alert('Erro ao iniciar campanha');
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const approvedTemplates = templates.filter((t) => t.status === 'APPROVED');

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campanhas de Disparo</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancelar' : '+ Nova Campanha'}
          </button>
        </div>

        {approvedTemplates.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
            <p className="text-yellow-800">
              ⚠️ Você precisa criar e aprovar um template para fazer disparo em massa
            </p>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Criar Nova Campanha</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nome da Campanha</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Promoção Setembro"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Template</label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Selecione um template aprovado</option>
                  {approvedTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Números de Telefone (um por linha)
                </label>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={6}
                  placeholder="5511999999999&#10;5521987654321&#10;5531988776655"
                  required
                />
                <p className="text-xs text-gray-600 mt-2">
                  Formatos aceitos: +5511999999999, 11999999999, ou manualmente formatado
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Criar Campanha
              </button>
            </form>
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhuma campanha criada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const sentCount = campaign.items.filter((i) => i.status === 'SENT').length;
              const failedCount = campaign.items.filter((i) => i.status === 'FAILED').length;

              return (
                <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">Template: {campaign.template.name}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        campaign.finishedAt
                          ? 'bg-blue-100 text-blue-800'
                          : campaign.startedAt
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {campaign.finishedAt
                        ? 'Concluída'
                        : campaign.startedAt
                        ? 'Em Progresso'
                        : 'Aguardando'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{campaign.totalPlanned}</p>
                      <p className="text-xs text-gray-600">Planejado</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{sentCount}</p>
                      <p className="text-xs text-gray-600">Enviado</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                      <p className="text-xs text-gray-600">Falha</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(((sentCount + failedCount) / campaign.totalPlanned) * 100)}%
                      </p>
                      <p className="text-xs text-gray-600">Processado</p>
                    </div>
                  </div>

                  {!campaign.startedAt && (
                    <button
                      onClick={() => handleStartCampaign(campaign.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Iniciar Campanha
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

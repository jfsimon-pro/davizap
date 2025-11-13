'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  version?: string;
  chunks: { id: string; ordinal: number; text: string }[];
  createdAt: string;
}

export default function KnowledgePage() {
  const router = useRouter();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Manual',
    content: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchSources();
  }, [router]);

  async function fetchSources() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/knowledge/sources', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSource(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/knowledge/sources', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newSource = await res.json();
        setSources([newSource, ...sources]);
        setFormData({
          title: '',
          type: 'Manual',
          content: '',
        });
        setShowForm(false);
      } else {
        alert('Erro ao criar fonte de conhecimento');
      }
    } catch (error) {
      console.error('Error creating source:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Base de Conhecimento</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancelar' : '+ Adicionar Conteúdo'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
          <p className="text-blue-800 font-semibold mb-2">💡 Como usar</p>
          <p className="text-blue-700 text-sm">
            Adicione informações sobre seus produtos, políticas, preços e exemplos de conversas.
            Essas informações serão usadas para treinar o ChatGPT a responder melhor.
          </p>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Adicionar Novo Conteúdo</h2>
            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Catálogo de Produtos 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Manual">Texto Manual</option>
                  <option value="PDF">Documento PDF</option>
                  <option value="URL">URL/Página Web</option>
                  <option value="FAQ">FAQ</option>
                  <option value="CSV">Planilha CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Conteúdo</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={10}
                  placeholder="Cole o conteúdo aqui..."
                  required
                />
                <p className="text-xs text-gray-600 mt-2">
                  Dica: Quanto mais detalhado e bem estruturado o conteúdo, melhor o ChatGPT
                  conseguirá responder aos clientes.
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {uploading ? 'Processando...' : 'Adicionar à Base de Conhecimento'}
              </button>
            </form>
          </div>
        )}

        {sources.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">
              Nenhum conteúdo adicionado à base de conhecimento
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Adicionar Conteúdo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sources.map((source) => (
              <div key={source.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{source.title}</h3>
                    <p className="text-sm text-gray-600">Tipo: {source.type}</p>
                    {source.version && (
                      <p className="text-sm text-gray-600">Versão: {source.version}</p>
                    )}
                  </div>
                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {source.chunks.length} trechos
                  </span>
                </div>

                <div className="bg-gray-50 rounded p-4 mb-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">
                    {source.chunks[0]?.text || 'Sem preview disponível'}
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  Adicionado em {new Date(source.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      setUser(decoded);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Davi</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Dashboard Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold">Conversas Abertas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold">Mensagens Hoje</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold">Campanhas Ativas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold">Taxa de Entrega</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/inbox">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📥 Inbox</h2>
              <p className="text-gray-600">Gerencie suas conversas e respostas</p>
            </div>
          </Link>

          <Link href="/templates">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📨 Templates</h2>
              <p className="text-gray-600">Crie e gerencie templates de mensagens</p>
            </div>
          </Link>

          <Link href="/campaigns">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📊 Campanhas</h2>
              <p className="text-gray-600">Disparo em massa com planilhas</p>
            </div>
          </Link>

          <Link href="/settings">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🔧 Configurações</h2>
              <p className="text-gray-600">Configure sua integração WhatsApp</p>
            </div>
          </Link>

          <Link href="/knowledge">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🧠 Base de Conhecimento</h2>
              <p className="text-gray-600">Treinar o ChatGPT com seu produto</p>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📈 Relatórios</h2>
              <p className="text-gray-600">Análises e métricas detalhadas</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

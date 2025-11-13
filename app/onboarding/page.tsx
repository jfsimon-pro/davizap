'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    wabaId: '',
    phoneNumberId: '',
    displayPhone: '',
    verifyToken: '',
    accessToken: '',
  });

  async function handleSaveAndContinue() {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  const steps = [
    {
      title: 'Bem-vindo ao WhatsApp Davi!',
      description: 'Você está prestes a configurar uma poderosa plataforma de automação WhatsApp.',
      content: (
        <div className="space-y-4">
          <p>Este sistema permite você:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Conectar seu WhatsApp ao Meta Cloud API</li>
            <li>Responder conversas automaticamente com IA</li>
            <li>Fazer disparo em massa com templates aprovados</li>
            <li>Gerenciar uma base de conhecimento para treinar o ChatGPT</li>
            <li>Acompanhar métricas e análises detalhadas</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Configurar WhatsApp',
      description: 'Adicione suas credenciais do WhatsApp Cloud API',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">WABA ID</label>
            <input
              type="text"
              value={config.wabaId}
              onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
              placeholder="ex: 123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-600 mt-1">
              Encontre em: Meta Business Manager &gt; WhatsApp &gt; WABA ID
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number ID</label>
            <input
              type="text"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              placeholder="ex: 987654321"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Verify Token</label>
            <input
              type="text"
              value={config.verifyToken}
              onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
              placeholder="token para verificação"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Access Token</label>
            <input
              type="password"
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              placeholder="seu access token"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Display Phone (opcional)</label>
            <input
              type="text"
              value={config.displayPhone}
              onChange={(e) => setConfig({ ...config, displayPhone: e.target.value })}
              placeholder="ex: +55 11 9 9999-9999"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Próximos Passos',
      description: 'Comece a usar o sistema',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Seu WhatsApp foi configurado! Agora você pode:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ir para a seção de Templates e criar mensagens</li>
            <li>Submeter templates para aprovação do WhatsApp</li>
            <li>Adicionar informações à Base de Conhecimento</li>
            <li>Receber e responder mensagens no Inbox</li>
            <li>Executar campanhas de disparo em massa</li>
          </ol>

          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold">💡 Dica:</p>
            <p className="text-sm text-blue-700">
              Configure sua base de conhecimento primeiro para que o ChatGPT tenha contexto
              sobre seus produtos e políticas.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${
                i < step ? 'bg-green-500' : i === step - 1 ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h1>
        <p className="text-gray-600 mb-6">{currentStep.description}</p>

        <div className="mb-8">{currentStep.content}</div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              if (step === 2) {
                handleSaveAndContinue();
              } else {
                setStep(Math.min(steps.length, step + 1));
              }
            }}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
          >
            {step === steps.length ? 'Começar' : 'Próximo'}
          </button>
        </div>

        {step !== 1 && (
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-4 text-gray-600 hover:text-gray-900 text-sm"
          >
            Pular para Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

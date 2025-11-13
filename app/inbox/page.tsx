'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Contact {
  id: string;
  name: string;
  phoneE164: string;
}

interface Message {
  id: string;
  body: string;
  direction: 'INBOUND' | 'OUTBOUND';
  createdAt: string;
  status: string;
}

interface Conversation {
  id: string;
  contact: Contact;
  status: string;
  messages: Message[];
  updatedAt: string;
}

export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [router]);

  async function fetchConversations() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inbox/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversation: Conversation) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/inbox/messages?conversationId=${conversation.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async function handleSendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inbox/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          body: newMessage,
        }),
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages([...messages, sentMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-300 overflow-y-auto">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-900">Conversas</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">Nenhuma conversa</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadMessages(conv)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-semibold text-gray-900">{conv.contact.name}</div>
              <div className="text-sm text-gray-600">{conv.contact.phoneE164}</div>
              <div className="text-xs text-gray-500 mt-1">
                {conv.messages[0]?.body?.substring(0, 50)}...
              </div>
            </div>
          ))
        )}
      </div>

      {/* Messages Area */}
      {selectedConversation ? (
        <div className="w-2/3 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedConversation.contact.name}
            </h2>
            <p className="text-sm text-gray-600">{selectedConversation.contact.phoneE164}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.direction === 'OUTBOUND'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-900'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="w-2/3 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Selecione uma conversa para começar</p>
        </div>
      )}
    </div>
  );
}

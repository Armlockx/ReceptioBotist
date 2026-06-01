"use client";

import { useState } from "react";
import { AdminNav } from "../_components/admin-nav";
import { TenantSelect } from "../_components/tenant-select";

type Conversation = {
  id: string;
  session_id: string;
  status: string;
  updated_at: string;
};

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export default function ConversationsPage() {
  const [tenantId, setTenantId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  async function loadConversations() {
    const response = await fetch(`/api/admin/conversations/${tenantId}`);
    const data = await response.json();
    if (response.ok) {
      setConversations(data.conversations ?? []);
    }
  }

  async function loadMessages(conversationId: string) {
    const response = await fetch(`/api/admin/messages/${conversationId}`);
    const data = await response.json();
    if (response.ok) {
      setMessages(data.messages ?? []);
    }
  }

  return (
    <main className="page card stack">
      <AdminNav />
      <h1>Conversas e mensagens</h1>
      <div className="row">
        <TenantSelect value={tenantId} onChange={setTenantId} placeholder="Selecione o tenant para listar conversas" />
        <button className="button" type="button" onClick={loadConversations} disabled={!tenantId}>
          Buscar conversas
        </button>
      </div>

      <div className="split">
        <div className="card stack">
          <h3 className="section-title">Lista</h3>
          <ul className="list">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button className="button full mono" type="button" onClick={() => loadMessages(conversation.id)}>
                  {conversation.session_id} ({conversation.status})
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card stack">
          <h3 className="section-title">Mensagens</h3>
          <ul className="list">
            {messages.map((message) => (
              <li key={message.id}>
                <b>{message.role}:</b> {message.content}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

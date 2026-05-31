"use client";

import { useState } from "react";

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
    <main style={{ margin: "2rem", fontFamily: "sans-serif" }}>
      <h1>Conversas e mensagens</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          placeholder="Tenant ID"
          style={{ minWidth: "320px" }}
        />
        <button type="button" onClick={loadConversations}>
          Buscar conversas
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
        <div>
          <h3>Lista</h3>
          <ul>
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button type="button" onClick={() => loadMessages(conversation.id)}>
                  {conversation.session_id} ({conversation.status})
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Mensagens</h3>
          <ul>
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

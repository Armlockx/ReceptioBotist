type WidgetConfig = {
  tenant: string;
  apiBaseUrl: string;
};

const SESSION_KEY = "receptio_session_id";

function ensureSessionId() {
  const current = localStorage.getItem(SESSION_KEY);
  if (current) {
    return current;
  }

  const session = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, session);
  return session;
}

function createContainer() {
  const root = document.createElement("div");
  root.id = "receptio-widget-root";
  root.style.position = "fixed";
  root.style.bottom = "16px";
  root.style.right = "16px";
  root.style.width = "320px";
  root.style.height = "420px";
  root.style.background = "#fff";
  root.style.border = "1px solid #ddd";
  root.style.borderRadius = "10px";
  root.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
  root.style.padding = "12px";
  root.style.fontFamily = "Arial, sans-serif";
  root.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px">ReceptioBotist</div>
    <div id="receptio-messages" style="height:300px;overflow:auto;border:1px solid #eee;padding:8px"></div>
    <form id="receptio-form" style="display:flex;gap:6px;margin-top:8px">
      <input id="receptio-input" style="flex:1;padding:8px" placeholder="Digite sua mensagem" />
      <button type="submit">Enviar</button>
    </form>
  `;
  document.body.appendChild(root);
  return root;
}

function appendMessage(container: HTMLElement, role: "user" | "assistant", text: string) {
  const line = document.createElement("div");
  line.style.marginBottom = "8px";
  line.innerHTML = `<b>${role === "user" ? "Você" : "Atendente"}:</b> ${text}`;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

export function mountWidget(config: WidgetConfig) {
  const root = createContainer();
  const messages = root.querySelector("#receptio-messages") as HTMLElement;
  const form = root.querySelector("#receptio-form") as HTMLFormElement;
  const input = root.querySelector("#receptio-input") as HTMLInputElement;
  const sessionId = ensureSessionId();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    input.value = "";
    appendMessage(messages, "user", message);

    const response = await fetch(`${config.apiBaseUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-key": config.tenant
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        metadata: { channel: "widget" }
      })
    });

    if (!response.ok) {
      appendMessage(messages, "assistant", "Não consegui responder agora. Tente novamente.");
      return;
    }

    const data = (await response.json()) as { reply?: string };
    appendMessage(messages, "assistant", data.reply ?? "");
  });
}

declare global {
  interface Window {
    ReceptioWidget?: { mount: (config: WidgetConfig) => void };
  }
}

window.ReceptioWidget = {
  mount: mountWidget
};

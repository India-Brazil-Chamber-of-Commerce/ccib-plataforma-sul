// Chamadas à API do Claude com conectores MCP (HubSpot, Microsoft 365).
// Funcionam quando a plataforma roda como Artifact no Claude, que autentica
// as requisições para api.anthropic.com e para os conectores do usuário logado.

export const CLAUDE_MODEL = "claude-sonnet-5";

export const MCP_HUBSPOT = { url: "https://mcp.hubspot.com/anthropic", name: "hubspot" };
export const MCP_MICROSOFT_365 = { url: "https://microsoft365.mcp.claude.com/mcp", name: "microsoft365" };

// Envia o prompt com o conector indicado e devolve o array JSON da resposta.
export async function callMcpForJson(prompt, server) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      mcp_servers: [{ type: "url", url: server.url, name: server.name }],
    }),
  });
  const data = await response.json();
  const textResponse = (data.content || [])
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
  const cleaned = textResponse.replace(/```json|```/g, "").trim();
  const jsonStart = cleaned.indexOf("[");
  const jsonEnd = cleaned.lastIndexOf("]");
  const jsonSlice = jsonStart >= 0 && jsonEnd >= 0 ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned;
  return JSON.parse(jsonSlice);
}

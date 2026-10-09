export type EstadoForm = { erro?: string; ok?: string } | undefined;

// Traduz erros do Postgres/Supabase em mensagens para o morador.
export function mensagemDeErro(erro: unknown): string {
  const msg =
    erro && typeof erro === "object" && "message" in erro
      ? String((erro as { message: unknown }).message)
      : String(erro);
  if (msg.includes("violates check constraint")) return "Algum campo está fora do formato esperado.";
  if (msg.includes("row-level security")) return "Você não tem permissão para fazer isso.";
  if (msg.includes("duplicate key")) return "Isso já foi registrado.";
  return msg;
}

export function texto(form: FormData, campo: string) {
  return String(form.get(campo) ?? "").trim();
}

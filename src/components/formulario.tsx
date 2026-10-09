"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { EstadoForm } from "@/lib/acao";

type Acao = (estado: EstadoForm, form: FormData) => Promise<EstadoForm>;

// Formulário com Server Action que mostra erro/sucesso abaixo dos campos.
export function Formulario({
  acao,
  children,
  className = "space-y-4",
}: {
  acao: Acao;
  children: ReactNode;
  className?: string;
}) {
  const [estado, executar] = useActionState(acao, undefined);
  return (
    <form action={executar} className={className}>
      {children}
      {estado?.erro && (
        <p role="alert" className="rounded-xl bg-perigo-fundo px-3 py-2 text-sm text-perigo">
          {estado.erro}
        </p>
      )}
      {estado?.ok && (
        <p role="status" className="rounded-xl bg-ok-fundo px-3 py-2 text-sm text-ok">
          {estado.ok}
        </p>
      )}
    </form>
  );
}

export function BotaoEnviar({
  children,
  pendente = "Enviando…",
  className = "botao w-full",
  name,
  value,
}: {
  children: ReactNode;
  pendente?: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} name={name} value={value}>
      {pending ? pendente : children}
    </button>
  );
}

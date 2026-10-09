import type { Metadata } from "next";
import Link from "next/link";
import { BotaoEnviar, Formulario } from "@/components/formulario";
import { cadastrar, entrar } from "./acoes";

export const metadata: Metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const { modo, erro } = await searchParams;
  const cadastro = modo === "cadastro";

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <Link href="/" className="etiqueta">
        ForCondom
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{cadastro ? "Criar conta" : "Entrar"}</h1>
      <p className="mt-1 text-sm text-suave">
        {cadastro
          ? "Depois você informa o código do seu condomínio."
          : "Bem-vindo de volta, vizinho."}
      </p>
      {erro && (
        <p role="alert" className="mt-4 rounded-xl bg-perigo-fundo px-3 py-2 text-sm text-perigo">
          Não foi possível confirmar o seu e-mail. Tente entrar novamente.
        </p>
      )}
      <Formulario acao={cadastro ? cadastrar : entrar} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="rotulo">
            E-mail
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="campo" />
        </div>
        <div>
          <label htmlFor="senha" className="rotulo">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            minLength={cadastro ? 8 : undefined}
            autoComplete={cadastro ? "new-password" : "current-password"}
            className="campo"
          />
        </div>
        <BotaoEnviar pendente={cadastro ? "Criando conta…" : "Entrando…"}>
          {cadastro ? "Criar conta" : "Entrar"}
        </BotaoEnviar>
      </Formulario>
      <p className="mt-6 text-center text-sm text-suave">
        {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link href={cadastro ? "/entrar" : "/entrar?modo=cadastro"} className="font-medium text-marca">
          {cadastro ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </main>
  );
}

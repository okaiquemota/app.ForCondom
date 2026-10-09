import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BotaoEnviar, Formulario } from "@/components/formulario";
import { obterSessao } from "@/lib/auth";
import { criarCondominio, entrarNoCondominio } from "./acoes";

export const metadata: Metadata = { title: "Seu condomínio" };

function CamposMorador() {
  return (
    <>
      <div>
        <label htmlFor="nome" className="rotulo">
          Seu nome
        </label>
        <input id="nome" name="nome" required minLength={2} maxLength={80} className="campo" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="torre" className="rotulo">
            Torre / bloco
          </label>
          <input id="torre" name="torre" required maxLength={20} className="campo" />
        </div>
        <div>
          <label htmlFor="apto" className="rotulo">
            Apartamento
          </label>
          <input id="apto" name="apto" required maxLength={20} className="campo" />
        </div>
      </div>
      <div>
        <label htmlFor="whatsapp" className="rotulo">
          WhatsApp <span className="font-normal text-suave">(opcional)</span>
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          placeholder="(11) 99999-8888"
          className="campo"
        />
      </div>
    </>
  );
}

export default async function Onboarding({ searchParams }: PageProps<"/onboarding">) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  if (sessao.perfil) redirect("/inicio");
  const { criar } = await searchParams;

  if (criar === "1") {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold">Cadastrar condomínio</h1>
        <p className="mt-1 text-sm text-suave">
          Para síndicos e administradores. Você será o moderador e receberá o código de convite
          para os moradores.
        </p>
        <Formulario acao={criarCondominio} className="mt-6 space-y-4">
          <div>
            <label htmlFor="condominio" className="rotulo">
              Nome do condomínio
            </label>
            <input id="condominio" name="condominio" required minLength={2} maxLength={120} className="campo" />
          </div>
          <div>
            <label htmlFor="cidade" className="rotulo">
              Cidade
            </label>
            <input id="cidade" name="cidade" className="campo" />
          </div>
          <CamposMorador />
          <BotaoEnviar pendente="Criando…">Criar condomínio</BotaoEnviar>
        </Formulario>
        <a href="/onboarding" className="mt-6 block text-center text-sm font-medium text-marca">
          Tenho um código de convite
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">Entrar no seu condomínio</h1>
      <p className="mt-1 text-sm text-suave">
        Peça o código de convite ao síndico ou à administração. Seu cadastro fica pendente até ser
        aprovado.
      </p>
      <Formulario acao={entrarNoCondominio} className="mt-6 space-y-4">
        <div>
          <label htmlFor="codigo" className="rotulo">
            Código de convite
          </label>
          <input
            id="codigo"
            name="codigo"
            required
            autoCapitalize="characters"
            placeholder="EX: 7F3A9C21"
            className="campo font-mono uppercase tracking-widest"
          />
        </div>
        <CamposMorador />
        <p className="text-xs text-suave">
          Seu apartamento só fica visível para o síndico, a menos que você escolha mostrá-lo no
          perfil.
        </p>
        <BotaoEnviar pendente="Enviando…">Pedir para entrar</BotaoEnviar>
      </Formulario>
      <a href="/onboarding?criar=1" className="mt-6 block text-center text-sm font-medium text-marca">
        Sou síndico e quero cadastrar meu condomínio
      </a>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { sair } from "@/app/entrar/acoes";
import { CartaoAnuncio } from "@/components/cartao-anuncio";
import { BotaoEnviar, Formulario } from "@/components/formulario";
import { exigirMorador } from "@/lib/auth";
import { formatarWhatsapp } from "@/lib/formato";
import type { Anuncio } from "@/lib/tipos";
import { salvarPerfil } from "./acoes";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function MeuPerfil() {
  const { supabase, userId, perfil, email } = await exigirMorador();
  const { data: anuncios } = await supabase
    .from("anuncios")
    .select("*")
    .eq("autor_id", userId)
    .order("created_at", { ascending: false })
    .returns<Anuncio[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Meu perfil</h1>
          <p className="text-sm text-suave">
            Torre {perfil.torre} • Apto {perfil.apto} • {email}
          </p>
        </div>
        <Link href={`/vizinhos/${userId}`} className="botao-secundario shrink-0 px-3 py-1.5 text-xs">
          Ver como vizinho
        </Link>
      </div>

      <Formulario acao={salvarPerfil} className="space-y-5">
        <section className="cartao space-y-4">
          <h2 className="font-semibold">Dados pessoais</h2>
          <div>
            <label htmlFor="nome" className="rotulo">
              Nome
            </label>
            <input id="nome" name="nome" required minLength={2} maxLength={80} defaultValue={perfil.nome} className="campo" />
          </div>
          <div>
            <label htmlFor="whatsapp" className="rotulo">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              defaultValue={formatarWhatsapp(perfil.whatsapp)}
              placeholder="(11) 99999-8888"
              className="campo"
            />
            <p className="mt-1 text-xs text-suave">Os vizinhos usam para falar com você sobre anúncios.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="mostrar_apto" defaultChecked={perfil.mostrar_apto} className="size-4 accent-marca" />
            Mostrar meu apartamento para os vizinhos (a torre sempre aparece)
          </label>
          <div>
            <label htmlFor="bio" className="rotulo">
              Sobre você
            </label>
            <textarea id="bio" name="bio" rows={2} maxLength={500} defaultValue={perfil.bio} className="campo" />
          </div>
        </section>

        <section className="cartao space-y-4">
          <div>
            <h2 className="font-semibold">Minha vitrine</h2>
            <p className="text-sm text-suave">
              Vende produtos ou presta serviços? Dê um nome à sua vitrine para aparecer em “Vizinhos”.
            </p>
          </div>
          <div>
            <label htmlFor="vitrine_nome" className="rotulo">
              Nome da vitrine
            </label>
            <input
              id="vitrine_nome"
              name="vitrine_nome"
              maxLength={80}
              defaultValue={perfil.vitrine_nome ?? ""}
              placeholder="Bolos da Ana"
              className="campo"
            />
          </div>
          <div>
            <label htmlFor="vitrine_descricao" className="rotulo">
              O que você oferece
            </label>
            <textarea
              id="vitrine_descricao"
              name="vitrine_descricao"
              rows={3}
              maxLength={1000}
              defaultValue={perfil.vitrine_descricao}
              placeholder="Bolos e doces por encomenda, com 2 dias de antecedência."
              className="campo"
            />
          </div>
          <div>
            <label htmlFor="horarios" className="rotulo">
              Horários
            </label>
            <input
              id="horarios"
              name="horarios"
              maxLength={200}
              defaultValue={perfil.horarios}
              placeholder="Seg a sáb, 9h às 18h"
              className="campo"
            />
          </div>
        </section>

        <BotaoEnviar pendente="Salvando…">Salvar perfil</BotaoEnviar>
      </Formulario>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Meus anúncios</h2>
          <Link href="/anuncios/novo" className="text-sm font-medium text-marca">
            + Novo
          </Link>
        </div>
        {anuncios && anuncios.length > 0 ? (
          <ul className="space-y-3">
            {anuncios.map((a) => (
              <li key={a.id}>
                <CartaoAnuncio anuncio={a} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-suave">Você ainda não anunciou nada.</p>
        )}
      </section>

      <form action={sair}>
        <button className="botao-secundario w-full">Sair da conta</button>
      </form>
    </div>
  );
}

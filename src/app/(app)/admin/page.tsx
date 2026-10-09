import type { Metadata } from "next";
import Link from "next/link";
import { BotaoEnviar, Formulario } from "@/components/formulario";
import { exigirSindico } from "@/lib/auth";
import { formatarData, formatarWhatsapp } from "@/lib/formato";
import type { Anuncio, Denuncia, Perfil } from "@/lib/tipos";
import { removerPelaModeracao } from "../anuncios/acoes";
import { definirPapel, moderarMorador, novoConvite, salvarRegras, tratarDenuncia } from "./acoes";

export const metadata: Metadata = { title: "Painel do síndico" };

export default async function Admin() {
  const { supabase, userId, condominio } = await exigirSindico();

  const [{ data: moradores }, { data: denuncias }] = await Promise.all([
    supabase.from("perfis").select("*").order("created_at", { ascending: false }).returns<Perfil[]>(),
    supabase
      .from("denuncias")
      .select("*")
      .eq("status", "aberta")
      .order("created_at", { ascending: false })
      .returns<Denuncia[]>(),
  ]);

  const idsAnuncios = (denuncias ?? []).flatMap((d) => (d.anuncio_id ? [d.anuncio_id] : []));
  const { data: anunciosDenunciados } = idsAnuncios.length
    ? await supabase.from("anuncios").select("*").in("id", idsAnuncios).returns<Anuncio[]>()
    : { data: [] as Anuncio[] };

  const todos = moradores ?? [];
  const nomes = new Map(todos.map((m) => [m.id, `${m.nome} (T${m.torre}/${m.apto})`]));
  const anuncios = new Map((anunciosDenunciados ?? []).map((a) => [a.id, a]));
  const pendentes = todos.filter((m) => m.status === "pendente");
  const aprovados = todos.filter((m) => m.status === "aprovado");
  const bloqueados = todos.filter((m) => m.status === "bloqueado");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel do síndico</h1>
        <p className="text-sm text-suave">
          {aprovados.length} moradores • {pendentes.length} pendentes • {denuncias?.length ?? 0} denúncias abertas
        </p>
      </div>

      <section className="cartao">
        <h2 className="font-semibold">Código de convite</h2>
        <p className="mt-1 text-sm text-suave">
          Envie no grupo do condomínio. Quem entrar com ele fica pendente até você aprovar.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <code className="rounded-xl bg-marca-fundo px-4 py-2 font-mono text-xl font-bold tracking-widest text-marca-forte">
            {condominio.codigo_convite}
          </code>
          <form action={novoConvite}>
            <button className="botao-secundario px-3 py-1.5 text-xs">Gerar novo</button>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Aguardando aprovação ({pendentes.length})</h2>
        {pendentes.length === 0 && <p className="text-sm text-suave">Ninguém aguardando.</p>}
        <ul className="space-y-2">
          {pendentes.map((m) => (
            <li key={m.id} className="cartao">
              <p className="font-semibold">{m.nome}</p>
              <p className="text-sm text-suave">
                Torre {m.torre} • Apto {m.apto}
                {m.whatsapp ? ` • ${formatarWhatsapp(m.whatsapp)}` : ""} • pediu em {formatarData(m.created_at)}
              </p>
              <div className="mt-3 flex gap-2">
                <form action={moderarMorador.bind(null, m.id, "aprovado")}>
                  <button className="botao px-3 py-1.5">Aprovar</button>
                </form>
                <form action={moderarMorador.bind(null, m.id, "bloqueado")}>
                  <button className="botao-perigo px-3 py-1.5">Recusar</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Denúncias abertas ({denuncias?.length ?? 0})</h2>
        {!denuncias?.length && <p className="text-sm text-suave">Nenhuma denúncia aberta.</p>}
        <ul className="space-y-2">
          {denuncias?.map((d) => {
            const anuncio = d.anuncio_id ? anuncios.get(d.anuncio_id) : undefined;
            return (
              <li key={d.id} className="cartao space-y-2">
                <p className="text-xs text-suave">
                  {formatarData(d.created_at, true)} • por {nomes.get(d.autor_id) ?? "morador"}
                </p>
                <p className="text-sm">
                  {anuncio ? (
                    <>
                      Anúncio{" "}
                      <Link href={`/anuncios/${anuncio.id}`} className="font-semibold text-marca underline">
                        {anuncio.titulo}
                      </Link>{" "}
                      de {nomes.get(anuncio.autor_id)}
                      {anuncio.status === "removido" && " (já removido)"}
                    </>
                  ) : d.perfil_id ? (
                    <>
                      Perfil{" "}
                      <Link href={`/vizinhos/${d.perfil_id}`} className="font-semibold text-marca underline">
                        {nomes.get(d.perfil_id)}
                      </Link>
                    </>
                  ) : null}
                </p>
                <p className="rounded-xl bg-fundo px-3 py-2 text-sm whitespace-pre-line">{d.motivo}</p>
                <div className="flex flex-wrap gap-2">
                  {anuncio && anuncio.status !== "removido" && (
                    <form action={removerPelaModeracao.bind(null, anuncio.id)}>
                      <button className="botao-perigo px-3 py-1.5 text-xs">Remover anúncio</button>
                    </form>
                  )}
                  <form action={tratarDenuncia.bind(null, d.id, "resolvida")}>
                    <button className="botao px-3 py-1.5 text-xs">Marcar resolvida</button>
                  </form>
                  <form action={tratarDenuncia.bind(null, d.id, "descartada")}>
                    <button className="botao-secundario px-3 py-1.5 text-xs">Descartar</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="regras" className="cartao space-y-3">
        <h2 className="font-semibold">Regras do condomínio</h2>
        <p className="text-sm text-suave">
          O que o regimento permite no comércio entre moradores: categorias proibidas, horários, entregas na
          portaria, uso de áreas comuns…
        </p>
        <Formulario acao={salvarRegras} className="space-y-3">
          <textarea
            name="regras"
            rows={6}
            defaultValue={condominio.regras}
            aria-label="Regras do condomínio"
            placeholder={"Ex.:\n• Entregas somente pela portaria.\n• Proibido atendimento de clientes de fora do condomínio.\n• Não é permitido usar o salão de festas para vendas."}
            className="campo"
          />
          <BotaoEnviar className="botao" pendente="Salvando…">
            Salvar regras
          </BotaoEnviar>
        </Formulario>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Moradores ({aprovados.length})</h2>
        <ul className="divide-y divide-borda rounded-2xl border border-borda bg-superficie">
          {aprovados.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {m.nome} {m.papel === "sindico" && <span className="etiqueta ml-1">Síndico</span>}
                </p>
                <p className="text-xs text-suave">
                  Torre {m.torre} • Apto {m.apto}
                </p>
              </div>
              {m.id !== userId && (
                <div className="flex gap-2">
                  <form action={definirPapel.bind(null, m.id, m.papel === "sindico" ? "morador" : "sindico")}>
                    <button className="botao-secundario px-3 py-1.5 text-xs">
                      {m.papel === "sindico" ? "Tirar moderação" : "Tornar moderador"}
                    </button>
                  </form>
                  <form action={moderarMorador.bind(null, m.id, "bloqueado")}>
                    <button className="botao-perigo px-3 py-1.5 text-xs">Bloquear</button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
        {bloqueados.length > 0 && (
          <details className="cartao">
            <summary className="cursor-pointer text-sm font-medium">Bloqueados ({bloqueados.length})</summary>
            <ul className="mt-2 space-y-2">
              {bloqueados.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {m.nome} • T{m.torre}/{m.apto}
                  </span>
                  <form action={moderarMorador.bind(null, m.id, "aprovado")}>
                    <button className="botao-secundario px-3 py-1.5 text-xs">Reativar</button>
                  </form>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EtiquetaStatus } from "@/components/cartao-anuncio";
import { FormDenuncia } from "@/components/form-denuncia";
import { exigirMorador } from "@/lib/auth";
import { TIPOS } from "@/lib/catalogo";
import { formatarData, formatarPreco, linkWhatsapp, localizacao } from "@/lib/formato";
import type { Anuncio, PerfilPublico } from "@/lib/tipos";
import { denunciar, excluirAnuncio, mudarStatus, removerPelaModeracao } from "../acoes";

export const metadata: Metadata = { title: "Anúncio" };

export default async function PaginaAnuncio({ params }: PageProps<"/anuncios/[id]">) {
  const { id } = await params;
  const { supabase, userId, perfil, condominio } = await exigirMorador();

  const { data: anuncio } = await supabase.from("anuncios").select("*").eq("id", id).maybeSingle<Anuncio>();
  if (!anuncio) notFound();

  const { data: vendedor } = await supabase
    .from("perfis_publicos")
    .select("*")
    .eq("id", anuncio.autor_id)
    .maybeSingle<PerfilPublico>();

  const meu = anuncio.autor_id === userId;
  const sindico = perfil.papel === "sindico";
  const tipo = TIPOS[anuncio.tipo];
  const mensagem = `Olá! Vi seu anúncio "${anuncio.titulo}" no ForCondom (${condominio.nome}).`;

  return (
    <article className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-marca-fundo">
        {anuncio.foto_url ? (
          <Image src={anuncio.foto_url} alt={anuncio.titulo} fill sizes="(max-width: 672px) 100vw, 672px" className="object-cover" priority />
        ) : (
          <span aria-hidden className="grid size-full place-items-center text-7xl">
            {tipo.emoji}
          </span>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="etiqueta">
            {tipo.emoji} {tipo.rotulo} • {anuncio.categoria}
          </span>
          {anuncio.status !== "ativo" && <EtiquetaStatus status={anuncio.status} />}
        </div>
        <h1 className="mt-2 text-2xl font-bold">{anuncio.titulo}</h1>
        <p className="mt-1 text-xl font-semibold text-marca-forte">{formatarPreco(anuncio.preco_centavos)}</p>
        <p className="mt-1 text-xs text-suave">Publicado em {formatarData(anuncio.created_at)}</p>
      </div>

      {anuncio.descricao && <p className="whitespace-pre-line">{anuncio.descricao}</p>}

      {vendedor && (
        <Link href={`/vizinhos/${vendedor.id}`} className="cartao flex items-center justify-between gap-3 transition hover:border-marca">
          <div className="min-w-0">
            <p className="truncate font-semibold">{vendedor.vitrine_nome || vendedor.nome}</p>
            <p className="text-sm text-suave">
              {vendedor.vitrine_nome ? `${vendedor.nome} • ` : ""}
              {localizacao(vendedor.torre, vendedor.apto)}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-marca-forte">👍 {vendedor.total_recomendacoes}</span>
        </Link>
      )}

      {!meu && anuncio.status === "ativo" && vendedor?.whatsapp && (
        <a href={linkWhatsapp(vendedor.whatsapp, mensagem)} target="_blank" rel="noopener noreferrer" className="botao w-full py-3 text-base">
          💬 Chamar no WhatsApp
        </a>
      )}
      {!meu && anuncio.status === "ativo" && vendedor && !vendedor.whatsapp && (
        <p className="text-center text-sm text-suave">Este vizinho ainda não cadastrou um WhatsApp.</p>
      )}

      {meu && anuncio.status !== "removido" && (
        <section className="cartao space-y-3">
          <h2 className="font-semibold">Gerenciar anúncio</h2>
          <form action={mudarStatus.bind(null, anuncio.id)} className="flex flex-wrap gap-2">
            {(["ativo", "pausado", "vendido"] as const)
              .filter((s) => s !== anuncio.status)
              .map((s) => (
                <button key={s} name="status" value={s} className="botao-secundario">
                  {s === "ativo" ? "Reativar" : s === "pausado" ? "Pausar" : "Marcar como vendido"}
                </button>
              ))}
          </form>
          <div className="flex gap-2">
            <Link href={`/anuncios/${anuncio.id}/editar`} className="botao-secundario">
              Editar
            </Link>
            <form action={excluirAnuncio.bind(null, anuncio.id)}>
              <button className="botao-perigo">Excluir</button>
            </form>
          </div>
        </section>
      )}

      {meu && anuncio.status === "removido" && (
        <p className="rounded-xl bg-perigo-fundo px-3 py-2 text-sm text-perigo">
          Este anúncio foi removido pela administração do condomínio por não seguir as{" "}
          <Link href="/regras" className="font-semibold underline">
            regras
          </Link>
          .
        </p>
      )}

      {sindico && !meu && anuncio.status !== "removido" && (
        <form action={removerPelaModeracao.bind(null, anuncio.id)}>
          <button className="botao-perigo w-full">🛡️ Remover anúncio (moderação)</button>
        </form>
      )}

      {!meu && <FormDenuncia acao={denunciar.bind(null, { anuncio_id: anuncio.id })} rotulo="Denunciar anúncio" />}
    </article>
  );
}

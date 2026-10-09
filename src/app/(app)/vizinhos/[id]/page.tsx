import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartaoAnuncio } from "@/components/cartao-anuncio";
import { FormDenuncia } from "@/components/form-denuncia";
import { BotaoEnviar, Formulario } from "@/components/formulario";
import { exigirMorador } from "@/lib/auth";
import { formatarData, linkWhatsapp, localizacao } from "@/lib/formato";
import type { Anuncio, PerfilPublico, Recomendacao } from "@/lib/tipos";
import { denunciar } from "../../anuncios/acoes";
import { recomendar, retirarRecomendacao } from "../acoes";

export const metadata: Metadata = { title: "Vizinho" };

export default async function PaginaVizinho({ params }: PageProps<"/vizinhos/[id]">) {
  const { id } = await params;
  const { supabase, userId, condominio } = await exigirMorador();

  const [{ data: vizinho }, { data: anuncios }, { data: recomendacoes }, { data: todos }] = await Promise.all([
    supabase.from("perfis_publicos").select("*").eq("id", id).maybeSingle<PerfilPublico>(),
    supabase
      .from("anuncios")
      .select("*")
      .eq("autor_id", id)
      .in("status", ["ativo", "vendido"])
      .order("created_at", { ascending: false })
      .returns<Anuncio[]>(),
    supabase
      .from("recomendacoes")
      .select("*")
      .eq("vendedor_id", id)
      .order("created_at", { ascending: false })
      .returns<Recomendacao[]>(),
    supabase.from("perfis_publicos").select("id, nome").returns<Pick<PerfilPublico, "id" | "nome">[]>(),
  ]);
  if (!vizinho) notFound();

  const nomes = new Map((todos ?? []).map((p) => [p.id, p.nome]));
  const eu = id === userId;
  const jaRecomendei = recomendacoes?.some((r) => r.autor_id === userId);
  const mensagem = `Olá, ${vizinho.nome}! Te encontrei no ForCondom (${condominio.nome}).`;

  return (
    <div className="space-y-5">
      <section className="cartao">
        <h1 className="text-2xl font-bold">{vizinho.vitrine_nome || vizinho.nome}</h1>
        <p className="text-sm text-suave">
          {vizinho.vitrine_nome ? `${vizinho.nome} • ` : ""}
          {localizacao(vizinho.torre, vizinho.apto)}
          {vizinho.papel === "sindico" ? " • Síndico(a)" : ""}
        </p>
        <p className="mt-2 text-sm">
          <span className="etiqueta">✅ Morador verificado</span>{" "}
          <span className="font-medium text-marca-forte">👍 {vizinho.total_recomendacoes}</span>
        </p>
        {vizinho.vitrine_descricao && <p className="mt-3 whitespace-pre-line">{vizinho.vitrine_descricao}</p>}
        {!vizinho.vitrine_descricao && vizinho.bio && <p className="mt-3 whitespace-pre-line">{vizinho.bio}</p>}
        {vizinho.horarios && <p className="mt-2 text-sm text-suave">🕒 {vizinho.horarios}</p>}
        {!eu && vizinho.whatsapp && (
          <a href={linkWhatsapp(vizinho.whatsapp, mensagem)} target="_blank" rel="noopener noreferrer" className="botao mt-4 w-full">
            💬 Chamar no WhatsApp
          </a>
        )}
        {eu && (
          <Link href="/perfil" className="botao-secundario mt-4 w-full">
            Editar minha vitrine
          </Link>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Anúncios</h2>
        {anuncios && anuncios.length > 0 ? (
          <ul className="space-y-3">
            {anuncios.map((a) => (
              <li key={a.id}>
                <CartaoAnuncio anuncio={a} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-suave">Nenhum anúncio ativo.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recomendações dos vizinhos</h2>
        {!eu && !jaRecomendei && (
          <Formulario acao={recomendar.bind(null, id)} className="cartao space-y-3">
            <label htmlFor="texto" className="rotulo">
              Já comprou ou contratou? Recomende para os vizinhos.
            </label>
            <textarea id="texto" name="texto" rows={2} maxLength={500} placeholder="Opcional: conte como foi" className="campo" />
            <BotaoEnviar className="botao" pendente="Enviando…">
              👍 Recomendar
            </BotaoEnviar>
          </Formulario>
        )}
        {!eu && jaRecomendei && (
          <form action={retirarRecomendacao.bind(null, id)} className="text-sm text-suave">
            Você recomendou este vizinho.{" "}
            <button className="font-medium text-marca underline">Retirar recomendação</button>
          </form>
        )}
        {recomendacoes && recomendacoes.length > 0 ? (
          <ul className="space-y-2">
            {recomendacoes.map((r) => (
              <li key={r.id} className="cartao">
                <p className="text-sm font-medium">
                  👍 {nomes.get(r.autor_id) ?? "Vizinho"}{" "}
                  <span className="font-normal text-suave">• {formatarData(r.created_at)}</span>
                </p>
                {r.texto && <p className="mt-1 text-sm">{r.texto}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-suave">Ainda sem recomendações.</p>
        )}
      </section>

      {!eu && <FormDenuncia acao={denunciar.bind(null, { perfil_id: id })} rotulo="Denunciar este perfil" />}
    </div>
  );
}

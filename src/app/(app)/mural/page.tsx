import type { Metadata } from "next";
import { BotaoEnviar, Formulario } from "@/components/formulario";
import { Vazio } from "@/components/vazio";
import { exigirMorador } from "@/lib/auth";
import { formatarData } from "@/lib/formato";
import type { Aviso } from "@/lib/tipos";
import { alternarFixado, apagarAviso, publicarAviso } from "./acoes";

export const metadata: Metadata = { title: "Mural" };

export default async function Mural() {
  const { supabase, perfil } = await exigirMorador();
  const sindico = perfil.papel === "sindico";
  const { data: avisos } = await supabase
    .from("avisos")
    .select("*")
    .order("fixado", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Aviso[]>();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Mural</h1>
        <p className="text-sm text-suave">Comunicados da administração do condomínio.</p>
      </div>

      {sindico && (
        <details className="cartao">
          <summary className="cursor-pointer font-semibold text-marca">+ Novo comunicado</summary>
          <Formulario acao={publicarAviso} className="mt-4 space-y-3">
            <div>
              <label htmlFor="titulo" className="rotulo">
                Título
              </label>
              <input id="titulo" name="titulo" required minLength={3} maxLength={120} className="campo" />
            </div>
            <div>
              <label htmlFor="corpo" className="rotulo">
                Mensagem
              </label>
              <textarea id="corpo" name="corpo" required rows={5} maxLength={5000} className="campo" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="fixado" className="size-4 accent-marca" /> Fixar no topo
            </label>
            <BotaoEnviar pendente="Publicando…">Publicar</BotaoEnviar>
          </Formulario>
        </details>
      )}

      {avisos && avisos.length > 0 ? (
        <ul className="space-y-3">
          {avisos.map((a) => (
            <li key={a.id} className={`cartao ${a.fixado ? "border-marca/40" : ""}`}>
              <p className="text-xs text-suave">
                {a.fixado && "📌 Fixado • "}
                {formatarData(a.created_at, true)}
              </p>
              <h2 className="mt-1 font-semibold">{a.titulo}</h2>
              <p className="mt-2 whitespace-pre-line text-sm">{a.corpo}</p>
              {sindico && (
                <div className="mt-3 flex gap-2">
                  <form action={alternarFixado.bind(null, a.id, !a.fixado)}>
                    <button className="botao-secundario px-3 py-1.5 text-xs">{a.fixado ? "Desafixar" : "Fixar"}</button>
                  </form>
                  <form action={apagarAviso.bind(null, a.id)}>
                    <button className="botao-perigo px-3 py-1.5 text-xs">Apagar</button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Vazio emoji="📢" titulo="Nenhum comunicado por enquanto" />
      )}
    </div>
  );
}

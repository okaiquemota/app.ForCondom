import type { Metadata } from "next";
import Link from "next/link";
import { CartaoAnuncio } from "@/components/cartao-anuncio";
import { Vazio } from "@/components/vazio";
import { exigirMorador } from "@/lib/auth";
import { CATEGORIAS, TIPOS, ehTipo } from "@/lib/catalogo";
import type { Anuncio, Aviso, PerfilPublico } from "@/lib/tipos";

export const metadata: Metadata = { title: "Explorar" };

export default async function Explorar({ searchParams }: PageProps<"/inicio">) {
  const { supabase } = await exigirMorador();
  const params = await searchParams;
  const tipo = ehTipo(params.tipo) ? params.tipo : undefined;
  const categoria = typeof params.categoria === "string" ? params.categoria : undefined;
  const busca = typeof params.q === "string" ? params.q.trim() : "";

  let consulta = supabase
    .from("anuncios")
    .select("*")
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(60);
  if (tipo) consulta = consulta.eq("tipo", tipo);
  if (tipo && categoria) consulta = consulta.eq("categoria", categoria);
  if (busca) {
    const termo = busca.replace(/[%_,()"\\]/g, " ");
    consulta = consulta.or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%,categoria.ilike.%${termo}%`);
  }

  const [{ data: anuncios }, { data: vizinhos }, { data: avisos }] = await Promise.all([
    consulta.returns<Anuncio[]>(),
    supabase.from("perfis_publicos").select("id, nome, vitrine_nome").returns<PerfilPublico[]>(),
    supabase
      .from("avisos")
      .select("*")
      .eq("fixado", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<Aviso[]>(),
  ]);
  const nomes = new Map((vizinhos ?? []).map((v) => [v.id, v.vitrine_nome || v.nome]));
  const aviso = avisos?.[0];

  const link = (novo: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const tudo = { tipo, categoria, q: busca || undefined, ...novo };
    Object.entries(tudo).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/inicio?${s}` : "/inicio";
  };

  return (
    <div className="space-y-5">
      {aviso && (
        <Link href="/mural" className="cartao block border-marca/40 bg-marca-fundo">
          <p className="text-xs font-semibold uppercase tracking-wide text-marca">📌 Aviso fixado</p>
          <p className="mt-1 font-semibold">{aviso.titulo}</p>
        </Link>
      )}

      <form action="/inicio" className="flex gap-2">
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
        <input
          name="q"
          defaultValue={busca}
          placeholder="Buscar bolo, manicure, bicicleta…"
          aria-label="Buscar"
          className="campo"
        />
        <button className="botao shrink-0">Buscar</button>
      </form>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href={link({ tipo: undefined, categoria: undefined })} className={filtro(!tipo)}>
          Tudo
        </Link>
        {Object.entries(TIPOS).map(([chave, t]) => (
          <Link
            key={chave}
            href={link({ tipo: chave, categoria: undefined })}
            className={filtro(tipo === chave)}
          >
            {t.emoji} {t.plural}
          </Link>
        ))}
      </div>

      {tipo && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {CATEGORIAS[tipo].map((c) => (
            <Link
              key={c}
              href={link({ categoria: categoria === c ? undefined : c })}
              className={filtro(categoria === c, true)}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {anuncios && anuncios.length > 0 ? (
        <ul className="space-y-3">
          {anuncios.map((a) => (
            <li key={a.id}>
              <CartaoAnuncio anuncio={a} vendedor={nomes.get(a.autor_id)} />
            </li>
          ))}
        </ul>
      ) : (
        <Vazio emoji="🔎" titulo={busca || tipo ? "Nada encontrado" : "Ainda não há anúncios"}>
          <Link href="/anuncios/novo" className="font-medium text-marca">
            Seja o primeiro a anunciar
          </Link>
        </Vazio>
      )}
    </div>
  );
}

function filtro(ativo: boolean, pequeno = false) {
  const base = `shrink-0 rounded-full border font-medium whitespace-nowrap ${pequeno ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm"}`;
  return ativo
    ? `${base} border-marca bg-marca text-white dark:text-black`
    : `${base} border-borda bg-superficie text-texto`;
}

import type { Metadata } from "next";
import Link from "next/link";
import { Vazio } from "@/components/vazio";
import { exigirMorador } from "@/lib/auth";
import { localizacao } from "@/lib/formato";
import type { PerfilPublico } from "@/lib/tipos";

export const metadata: Metadata = { title: "Vizinhos que vendem" };

export default async function Vitrines() {
  const { supabase } = await exigirMorador();
  const { data: vitrines } = await supabase
    .from("perfis_publicos")
    .select("*")
    .not("vitrine_nome", "is", null)
    .order("total_recomendacoes", { ascending: false })
    .returns<PerfilPublico[]>();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Vizinhos que vendem</h1>
        <p className="text-sm text-suave">Produtos e serviços de quem mora aqui.</p>
      </div>
      {vitrines && vitrines.length > 0 ? (
        <ul className="space-y-3">
          {vitrines.map((v) => (
            <li key={v.id}>
              <Link href={`/vizinhos/${v.id}`} className="cartao block transition hover:border-marca">
                <p className="font-semibold">{v.vitrine_nome}</p>
                <p className="text-sm text-suave">
                  {v.nome} • {localizacao(v.torre, v.apto)}
                </p>
                {v.vitrine_descricao && <p className="mt-2 line-clamp-2 text-sm">{v.vitrine_descricao}</p>}
                <p className="mt-2 text-sm font-medium text-marca-forte">
                  👍 {v.total_recomendacoes}{" "}
                  {v.total_recomendacoes === 1 ? "recomendação" : "recomendações"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Vazio emoji="🧑‍🍳" titulo="Nenhuma vitrine ainda">
          Vende algo ou presta serviço?{" "}
          <Link href="/perfil" className="font-medium text-marca">
            Monte sua vitrine
          </Link>
        </Vazio>
      )}
    </div>
  );
}

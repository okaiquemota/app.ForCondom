import Image from "next/image";
import Link from "next/link";
import { TIPOS } from "@/lib/catalogo";
import { formatarPreco } from "@/lib/formato";
import type { Anuncio } from "@/lib/tipos";

export function CartaoAnuncio({ anuncio, vendedor }: { anuncio: Anuncio; vendedor?: string }) {
  const tipo = TIPOS[anuncio.tipo];
  return (
    <Link
      href={`/anuncios/${anuncio.id}`}
      className="cartao flex gap-3 transition hover:border-marca"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-marca-fundo">
        {anuncio.foto_url ? (
          <Image src={anuncio.foto_url} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <span aria-hidden className="grid size-full place-items-center text-3xl">
            {tipo.emoji}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{anuncio.titulo}</p>
        <p className="text-sm text-suave">
          {anuncio.categoria}
          {vendedor ? ` • ${vendedor}` : ""}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-marca-forte">
            {formatarPreco(anuncio.preco_centavos)}
          </span>
          {anuncio.status !== "ativo" && <EtiquetaStatus status={anuncio.status} />}
        </div>
      </div>
    </Link>
  );
}

const STATUS = {
  ativo: "Ativo",
  pausado: "Pausado",
  vendido: "Vendido",
  removido: "Removido pela moderação",
} as const;

export function EtiquetaStatus({ status }: { status: Anuncio["status"] }) {
  const cor =
    status === "removido"
      ? "bg-perigo-fundo text-perigo"
      : status === "ativo"
        ? "bg-ok-fundo text-ok"
        : "bg-borda text-suave";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cor}`}>{STATUS[status]}</span>;
}

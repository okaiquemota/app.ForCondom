import Link from "next/link";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";

const DESTAQUES = [
  { emoji: "🛍️", titulo: "Produtos", texto: "Marmitas, bolos, doces, salgados e artesanato de quem mora aqui." },
  { emoji: "🔧", titulo: "Serviços", texto: "Eletricista, manicure, pet sitter, aulas, informática e mais." },
  { emoji: "🏷️", titulo: "Classificados", texto: "Móveis, bicicletas, eletrônicos e itens infantis entre vizinhos." },
  { emoji: "🛡️", titulo: "Com regras do condomínio", texto: "O síndico aprova moradores, define regras e modera denúncias." },
];

export default async function Inicio() {
  const sessao = await obterSessao();
  if (sessao) redirect("/inicio");

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="etiqueta">ForCondom</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">A economia do seu condomínio, organizada.</h1>
      <p className="mt-4 text-lg text-suave">
        Compre de quem mora no seu condomínio. Encontre vizinhos que vendem e prestam serviços, sem
        se perder no grupo de WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/entrar?modo=cadastro" className="botao">
          Criar conta
        </Link>
        <Link href="/entrar" className="botao-secundario">
          Já tenho conta
        </Link>
      </div>
      <ul className="mt-12 grid gap-3 sm:grid-cols-2">
        {DESTAQUES.map((d) => (
          <li key={d.titulo} className="cartao">
            <p aria-hidden className="text-2xl">
              {d.emoji}
            </p>
            <p className="mt-2 font-semibold">{d.titulo}</p>
            <p className="mt-1 text-sm text-suave">{d.texto}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

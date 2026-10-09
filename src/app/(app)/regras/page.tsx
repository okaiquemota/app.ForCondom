import type { Metadata } from "next";
import Link from "next/link";
import { exigirMorador } from "@/lib/auth";

export const metadata: Metadata = { title: "Regras" };

const REGRAS_GERAIS = [
  "Somente moradores aprovados pela administração podem anunciar.",
  "Combine entrega, pagamento e horários diretamente com o vizinho.",
  "Respeite o regimento interno: nada de atendimento a público externo ou uso de áreas comuns sem autorização.",
  "Anúncios ilegais, ofensivos ou enganosos são removidos.",
  "Teve um problema? Use “Denunciar”: só a administração vê.",
];

export default async function Regras() {
  const { condominio, perfil } = await exigirMorador();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Regras do comércio entre vizinhos</h1>
      <section className="cartao">
        <h2 className="font-semibold">{condominio.nome}</h2>
        {condominio.regras ? (
          <p className="mt-2 whitespace-pre-line text-sm">{condominio.regras}</p>
        ) : (
          <p className="mt-2 text-sm text-suave">A administração ainda não publicou regras específicas.</p>
        )}
        {perfil.papel === "sindico" && (
          <Link href="/admin#regras" className="mt-3 inline-block text-sm font-medium text-marca">
            Editar regras
          </Link>
        )}
      </section>
      <section className="cartao">
        <h2 className="font-semibold">Regras gerais do ForCondom</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {REGRAS_GERAIS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

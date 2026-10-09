import type { Metadata } from "next";
import Link from "next/link";
import { exigirMorador } from "@/lib/auth";
import { criarAnuncio } from "../acoes";
import { FormAnuncio } from "../form-anuncio";

export const metadata: Metadata = { title: "Novo anúncio" };

export default async function NovoAnuncio() {
  const { perfil } = await exigirMorador();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Novo anúncio</h1>
      {!perfil.whatsapp && (
        <p className="rounded-xl bg-marca-fundo px-3 py-2 text-sm text-marca-forte">
          Cadastre seu WhatsApp no{" "}
          <Link href="/perfil" className="font-semibold underline">
            perfil
          </Link>{" "}
          para que os vizinhos consigam falar com você.
        </p>
      )}
      <FormAnuncio acao={criarAnuncio} />
    </div>
  );
}

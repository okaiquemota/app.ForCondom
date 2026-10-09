import Link from "next/link";
import { NavInferior } from "@/components/nav-inferior";
import { exigirMorador } from "@/lib/auth";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const { condominio, perfil } = await exigirMorador();

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-10 border-b border-borda bg-fundo/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/inicio" className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-marca">ForCondom</p>
            <p className="truncate font-semibold">{condominio.nome}</p>
          </Link>
          <nav className="flex shrink-0 items-center gap-2 text-sm">
            <Link href="/regras" className="botao-secundario px-3 py-1.5">
              Regras
            </Link>
            {perfil.papel === "sindico" && (
              <Link href="/admin" className="botao px-3 py-1.5">
                Síndico
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
      <NavInferior />
    </div>
  );
}

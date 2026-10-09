"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/inicio", rotulo: "Explorar", icone: "🏠" },
  { href: "/vitrines", rotulo: "Vizinhos", icone: "🧑‍🍳" },
  { href: "/anuncios/novo", rotulo: "Anunciar", icone: "➕" },
  { href: "/mural", rotulo: "Mural", icone: "📢" },
  { href: "/perfil", rotulo: "Perfil", icone: "👤" },
];

export function NavInferior() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-2xl justify-around">
        {ITENS.map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-w-16 flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-medium ${
                  ativo ? "text-marca" : "text-suave"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">
                  {item.icone}
                </span>
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import type { ReactNode } from "react";

export function Vazio({ emoji, titulo, children }: { emoji: string; titulo: string; children?: ReactNode }) {
  return (
    <div className="cartao py-10 text-center">
      <p aria-hidden className="text-4xl">
        {emoji}
      </p>
      <p className="mt-2 font-semibold">{titulo}</p>
      {children && <div className="mt-1 text-sm text-suave">{children}</div>}
    </div>
  );
}

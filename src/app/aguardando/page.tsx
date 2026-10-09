import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sair } from "@/app/entrar/acoes";
import { obterSessao } from "@/lib/auth";

export const metadata: Metadata = { title: "Aguardando aprovação" };

export default async function Aguardando() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  if (!sessao.perfil) redirect("/onboarding");
  if (sessao.perfil.status === "aprovado") redirect("/inicio");
  const bloqueado = sessao.perfil.status === "bloqueado";

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <p aria-hidden className="text-5xl">
        {bloqueado ? "🚫" : "⏳"}
      </p>
      <h1 className="mt-4 text-2xl font-bold">
        {bloqueado ? "Acesso não liberado" : "Quase lá!"}
      </h1>
      <p className="mt-2 text-suave">
        {bloqueado
          ? "A administração do condomínio não liberou o seu acesso. Fale com o síndico se achar que é um engano."
          : "Seu pedido foi enviado. Assim que o síndico confirmar que você é morador, o app é liberado."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {!bloqueado && (
          <a href="/aguardando" className="botao">
            Verificar novamente
          </a>
        )}
        <form action={sair}>
          <button className="botao-secundario">Sair</button>
        </form>
      </div>
    </main>
  );
}

import { BotaoEnviar, Formulario } from "@/components/formulario";
import type { EstadoForm } from "@/lib/acao";

export function FormDenuncia({
  acao,
  rotulo = "Denunciar",
}: {
  acao: (estado: EstadoForm, form: FormData) => Promise<EstadoForm>;
  rotulo?: string;
}) {
  return (
    <details className="cartao">
      <summary className="cursor-pointer text-sm font-medium text-suave">🚩 {rotulo}</summary>
      <Formulario acao={acao} className="mt-3 space-y-3">
        <label htmlFor="motivo" className="rotulo">
          O que aconteceu? Só a administração do condomínio verá.
        </label>
        <textarea id="motivo" name="motivo" rows={3} required minLength={3} maxLength={1000} className="campo" />
        <BotaoEnviar className="botao-perigo" pendente="Enviando…">
          Enviar denúncia
        </BotaoEnviar>
      </Formulario>
    </details>
  );
}

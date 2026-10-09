const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarPreco(centavos: number | null) {
  return centavos === null ? "A combinar" : moeda.format(centavos / 100);
}

// "45" -> 4500, "45,90" -> 4590, "1.234,50" -> 123450; vazio -> null
export function lerPreco(texto: string): number | null {
  const limpo = texto.trim().replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
  if (!limpo) return null;
  const valor = Number(limpo);
  if (!Number.isFinite(valor) || valor < 0) throw new Error("Preço inválido");
  return Math.round(valor * 100);
}

export function centavosParaTexto(centavos: number | null) {
  return centavos === null ? "" : (centavos / 100).toFixed(2).replace(".", ",");
}

// Aceita "(11) 99999-8888" ou "+55 11 99999-8888"; guarda só dígitos com DDI.
export function normalizarWhatsapp(texto: string): string | null {
  const digitos = texto.replace(/\D/g, "");
  if (!digitos) return null;
  const comDdi = digitos.length <= 11 ? `55${digitos}` : digitos;
  if (comDdi.length < 12 || comDdi.length > 13) throw new Error("WhatsApp inválido");
  return comDdi;
}

export function linkWhatsapp(numero: string, mensagem: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function formatarWhatsapp(numero: string | null) {
  if (!numero) return "";
  const local = numero.startsWith("55") ? numero.slice(2) : numero;
  const m = local.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : numero;
}

export function localizacao(torre: string, apto: string | null) {
  return apto ? `Torre ${torre} • Apto ${apto}` : `Torre ${torre}`;
}

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const dataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatarData(iso: string, comHora = false) {
  return (comHora ? dataHora : data).format(new Date(iso));
}

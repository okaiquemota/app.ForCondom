import type { TipoAnuncio } from "./tipos";

export const TIPOS: Record<TipoAnuncio, { rotulo: string; plural: string; emoji: string }> = {
  produto: { rotulo: "Produto", plural: "Produtos", emoji: "🛍️" },
  servico: { rotulo: "Serviço", plural: "Serviços", emoji: "🔧" },
  classificado: { rotulo: "Classificado", plural: "Classificados", emoji: "🏷️" },
};

export const CATEGORIAS: Record<TipoAnuncio, string[]> = {
  produto: ["Marmitas", "Bolos e doces", "Salgados", "Bebidas", "Artesanato", "Roupas", "Beleza", "Outros"],
  servico: [
    "Elétrica",
    "Pintura",
    "Manutenção",
    "Informática",
    "Beleza e estética",
    "Pet sitter",
    "Aulas",
    "Limpeza",
    "Costura",
    "Outros",
  ],
  classificado: [
    "Móveis",
    "Eletrônicos",
    "Roupas",
    "Bicicletas",
    "Games",
    "Infantil",
    "Casa",
    "Outros",
  ],
};

export function ehTipo(valor: unknown): valor is TipoAnuncio {
  return valor === "produto" || valor === "servico" || valor === "classificado";
}

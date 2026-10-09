export type Papel = "morador" | "sindico";
export type StatusMorador = "pendente" | "aprovado" | "bloqueado";
export type TipoAnuncio = "produto" | "servico" | "classificado";
export type StatusAnuncio = "ativo" | "pausado" | "vendido" | "removido";
export type StatusDenuncia = "aberta" | "resolvida" | "descartada";

export type Condominio = {
  id: string;
  nome: string;
  cidade: string | null;
  codigo_convite: string;
  regras: string;
};

export type Perfil = {
  id: string;
  condominio_id: string;
  nome: string;
  torre: string;
  apto: string;
  mostrar_apto: boolean;
  whatsapp: string | null;
  bio: string;
  vitrine_nome: string | null;
  vitrine_descricao: string;
  horarios: string;
  papel: Papel;
  status: StatusMorador;
  created_at: string;
};

export type PerfilPublico = Omit<Perfil, "mostrar_apto" | "status" | "apto"> & {
  apto: string | null;
  total_recomendacoes: number;
};

export type Anuncio = {
  id: string;
  condominio_id: string;
  autor_id: string;
  tipo: TipoAnuncio;
  categoria: string;
  titulo: string;
  descricao: string;
  preco_centavos: number | null;
  foto_url: string | null;
  status: StatusAnuncio;
  created_at: string;
};

export type Recomendacao = {
  id: string;
  autor_id: string;
  vendedor_id: string;
  texto: string;
  created_at: string;
};

export type Denuncia = {
  id: string;
  autor_id: string;
  anuncio_id: string | null;
  perfil_id: string | null;
  motivo: string;
  status: StatusDenuncia;
  created_at: string;
};

export type Aviso = {
  id: string;
  autor_id: string;
  titulo: string;
  corpo: string;
  fixado: boolean;
  created_at: string;
};

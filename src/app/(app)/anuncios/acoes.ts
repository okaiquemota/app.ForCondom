"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mensagemDeErro, texto, type EstadoForm } from "@/lib/acao";
import { exigirMorador } from "@/lib/auth";
import { CATEGORIAS, ehTipo } from "@/lib/catalogo";
import { lerPreco } from "@/lib/formato";
import type { StatusAnuncio } from "@/lib/tipos";

const TIPOS_FOTO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Supabase = Awaited<ReturnType<typeof exigirMorador>>["supabase"];

async function enviarFoto(supabase: Supabase, userId: string, arquivo: FormDataEntryValue | null) {
  if (!(arquivo instanceof File) || arquivo.size === 0) return undefined;
  const extensao = TIPOS_FOTO[arquivo.type];
  if (!extensao) throw new Error("Use uma foto JPG, PNG ou WebP.");
  if (arquivo.size > 5 * 1024 * 1024) throw new Error("A foto pode ter no máximo 5 MB.");

  const caminho = `${userId}/${crypto.randomUUID()}.${extensao}`;
  const { error } = await supabase.storage.from("fotos").upload(caminho, arquivo, {
    contentType: arquivo.type,
  });
  if (error) throw error;
  return supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

function lerCampos(form: FormData) {
  const tipo = texto(form, "tipo");
  if (!ehTipo(tipo)) throw new Error("Escolha o tipo do anúncio.");
  const categoria = texto(form, "categoria");
  if (!CATEGORIAS[tipo].includes(categoria)) throw new Error("Escolha uma categoria.");
  return {
    tipo,
    categoria,
    titulo: texto(form, "titulo"),
    descricao: texto(form, "descricao"),
    preco_centavos: lerPreco(texto(form, "preco")),
  };
}

export async function criarAnuncio(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  let id: string;
  try {
    const { supabase, userId } = await exigirMorador();
    const campos = lerCampos(form);
    const foto_url = await enviarFoto(supabase, userId, form.get("foto"));
    const { data, error } = await supabase
      .from("anuncios")
      .insert({ ...campos, foto_url, autor_id: userId })
      .select("id")
      .single();
    if (error) return { erro: mensagemDeErro(error) };
    id = data.id;
  } catch (e) {
    return { erro: mensagemDeErro(e) };
  }
  revalidatePath("/inicio");
  redirect(`/anuncios/${id}`);
}

export async function editarAnuncio(id: string, _: EstadoForm, form: FormData): Promise<EstadoForm> {
  try {
    const { supabase, userId } = await exigirMorador();
    const campos = lerCampos(form);
    const foto_url = await enviarFoto(supabase, userId, form.get("foto"));
    const { error } = await supabase
      .from("anuncios")
      .update({ ...campos, ...(foto_url ? { foto_url } : {}) })
      .eq("id", id)
      .eq("autor_id", userId);
    if (error) return { erro: mensagemDeErro(error) };
  } catch (e) {
    return { erro: mensagemDeErro(e) };
  }
  revalidatePath(`/anuncios/${id}`);
  redirect(`/anuncios/${id}`);
}

const STATUS_DO_AUTOR: StatusAnuncio[] = ["ativo", "pausado", "vendido"];

export async function mudarStatus(id: string, form: FormData) {
  const { supabase, userId } = await exigirMorador();
  const status = texto(form, "status") as StatusAnuncio;
  if (!STATUS_DO_AUTOR.includes(status)) return;
  await supabase.from("anuncios").update({ status }).eq("id", id).eq("autor_id", userId);
  revalidatePath(`/anuncios/${id}`);
}

export async function excluirAnuncio(id: string) {
  const { supabase, userId } = await exigirMorador();
  await supabase.from("anuncios").delete().eq("id", id).eq("autor_id", userId);
  revalidatePath("/inicio");
  redirect("/perfil");
}

export async function removerPelaModeracao(id: string) {
  const { supabase, perfil } = await exigirMorador();
  if (perfil.papel !== "sindico") return;
  await supabase.from("anuncios").update({ status: "removido" }).eq("id", id);
  revalidatePath(`/anuncios/${id}`);
  revalidatePath("/admin");
}

export async function denunciar(
  alvo: { anuncio_id?: string; perfil_id?: string },
  _: EstadoForm,
  form: FormData,
): Promise<EstadoForm> {
  const { supabase, userId } = await exigirMorador();
  const motivo = texto(form, "motivo");
  if (motivo.length < 3) return { erro: "Conte em poucas palavras o que aconteceu." };
  const { error } = await supabase.from("denuncias").insert({ ...alvo, motivo, autor_id: userId });
  if (error) return { erro: mensagemDeErro(error) };
  return { ok: "Denúncia enviada à administração. Obrigado por ajudar a comunidade." };
}

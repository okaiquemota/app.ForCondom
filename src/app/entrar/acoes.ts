"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { mensagemDeErro, texto, type EstadoForm } from "@/lib/acao";
import { createClient } from "@/lib/supabase/server";

export async function entrar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: texto(form, "email"),
    password: String(form.get("senha") ?? ""),
  });
  if (error) {
    if (error.code === "email_not_confirmed") return { erro: "Confirme seu e-mail antes de entrar." };
    if (error.code === "invalid_credentials") return { erro: "E-mail ou senha incorretos." };
    return { erro: mensagemDeErro(error) };
  }
  redirect("/inicio");
}

export async function cadastrar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const senha = String(form.get("senha") ?? "");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const origem = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: texto(form, "email"),
    password: senha,
    options: { emailRedirectTo: `${origem}/auth/callback` },
  });
  if (error) return { erro: mensagemDeErro(error) };
  if (data.session) redirect("/onboarding");
  return { ok: "Conta criada! Enviamos um link de confirmação para o seu e-mail." };
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

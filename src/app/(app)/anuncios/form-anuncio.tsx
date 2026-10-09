"use client";

import { useState } from "react";
import { BotaoEnviar, Formulario } from "@/components/formulario";
import type { EstadoForm } from "@/lib/acao";
import { CATEGORIAS, TIPOS } from "@/lib/catalogo";
import { centavosParaTexto } from "@/lib/formato";
import type { Anuncio, TipoAnuncio } from "@/lib/tipos";

export function FormAnuncio({
  acao,
  anuncio,
}: {
  acao: (estado: EstadoForm, form: FormData) => Promise<EstadoForm>;
  anuncio?: Anuncio;
}) {
  const [tipo, setTipo] = useState<TipoAnuncio>(anuncio?.tipo ?? "produto");

  return (
    <Formulario acao={acao}>
      <fieldset>
        <legend className="rotulo">O que você quer anunciar?</legend>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TIPOS) as TipoAnuncio[]).map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-sm font-medium ${
                tipo === t ? "border-marca bg-marca-fundo text-marca-forte" : "border-borda bg-superficie"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="sr-only"
              />
              <span aria-hidden className="block text-xl">
                {TIPOS[t].emoji}
              </span>
              {TIPOS[t].rotulo}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="categoria" className="rotulo">
          Categoria
        </label>
        <select
          key={tipo}
          id="categoria"
          name="categoria"
          required
          defaultValue={anuncio?.tipo === tipo ? anuncio.categoria : ""}
          className="campo"
        >
          <option value="" disabled>
            Escolha…
          </option>
          {CATEGORIAS[tipo].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="titulo" className="rotulo">
          Título
        </label>
        <input
          id="titulo"
          name="titulo"
          required
          minLength={3}
          maxLength={100}
          defaultValue={anuncio?.titulo}
          placeholder={
            tipo === "produto"
              ? "Bolo de cenoura com chocolate"
              : tipo === "servico"
                ? "Manicure e pedicure em domicílio"
                : "Bicicleta aro 29 seminova"
          }
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="descricao" className="rotulo">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          maxLength={2000}
          defaultValue={anuncio?.descricao}
          placeholder="Detalhes, sabores, tamanhos, como funciona a entrega…"
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="preco" className="rotulo">
          Preço (R$) <span className="font-normal text-suave">vazio = a combinar</span>
        </label>
        <input
          id="preco"
          name="preco"
          inputMode="decimal"
          defaultValue={centavosParaTexto(anuncio?.preco_centavos ?? null)}
          placeholder="45,00"
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="foto" className="rotulo">
          Foto <span className="font-normal text-suave">(JPG, PNG ou WebP, até 5 MB)</span>
        </label>
        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-marca-fundo file:px-3 file:py-2 file:font-medium file:text-marca-forte"
        />
      </div>
      <BotaoEnviar pendente="Salvando…">{anuncio ? "Salvar alterações" : "Publicar anúncio"}</BotaoEnviar>
    </Formulario>
  );
}

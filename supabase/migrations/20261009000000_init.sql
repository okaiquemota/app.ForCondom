-- ForCondom: schema inicial do MVP
-- Marketplace (produtos e serviços), classificados, perfis, recomendações,
-- moderação e mural. Cada condomínio é isolado por RLS.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type papel_morador as enum ('morador', 'sindico');
create type status_morador as enum ('pendente', 'aprovado', 'bloqueado');
create type tipo_anuncio as enum ('produto', 'servico', 'classificado');
create type status_anuncio as enum ('ativo', 'pausado', 'vendido', 'removido');
create type status_denuncia as enum ('aberta', 'resolvida', 'descartada');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table condominios (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  cidade text,
  codigo_convite text not null unique
    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  regras text not null default '',
  created_at timestamptz not null default now()
);

create table perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  condominio_id uuid not null references condominios (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 80),
  torre text not null check (char_length(torre) between 1 and 20),
  apto text not null check (char_length(apto) between 1 and 20),
  mostrar_apto boolean not null default false,
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,13}$'),
  bio text not null default '' check (char_length(bio) <= 500),
  -- Vitrine: preenchida por quem vende produtos ou presta serviços
  vitrine_nome text check (vitrine_nome is null or char_length(vitrine_nome) <= 80),
  vitrine_descricao text not null default '' check (char_length(vitrine_descricao) <= 1000),
  horarios text not null default '' check (char_length(horarios) <= 200),
  papel papel_morador not null default 'morador',
  status status_morador not null default 'pendente',
  created_at timestamptz not null default now()
);

create index perfis_condominio_idx on perfis (condominio_id, status);

create table anuncios (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references condominios (id) on delete cascade,
  autor_id uuid not null references perfis (id) on delete cascade,
  tipo tipo_anuncio not null,
  categoria text not null check (char_length(categoria) between 1 and 40),
  titulo text not null check (char_length(titulo) between 3 and 100),
  descricao text not null default '' check (char_length(descricao) <= 2000),
  -- preço em centavos; nulo = "a combinar"
  preco_centavos integer check (preco_centavos is null or preco_centavos >= 0),
  foto_url text,
  status status_anuncio not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index anuncios_feed_idx on anuncios (condominio_id, status, tipo, created_at desc);
create index anuncios_autor_idx on anuncios (autor_id);

create table recomendacoes (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references condominios (id) on delete cascade,
  autor_id uuid not null references perfis (id) on delete cascade,
  vendedor_id uuid not null references perfis (id) on delete cascade,
  texto text not null default '' check (char_length(texto) <= 500),
  created_at timestamptz not null default now(),
  unique (autor_id, vendedor_id),
  check (autor_id <> vendedor_id)
);

create index recomendacoes_vendedor_idx on recomendacoes (vendedor_id);

create table denuncias (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references condominios (id) on delete cascade,
  autor_id uuid not null references perfis (id) on delete cascade,
  anuncio_id uuid references anuncios (id) on delete cascade,
  perfil_id uuid references perfis (id) on delete cascade,
  motivo text not null check (char_length(motivo) between 3 and 1000),
  status status_denuncia not null default 'aberta',
  created_at timestamptz not null default now(),
  check (anuncio_id is not null or perfil_id is not null)
);

create index denuncias_condominio_idx on denuncias (condominio_id, status);

create table avisos (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references condominios (id) on delete cascade,
  autor_id uuid not null references perfis (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 3 and 120),
  corpo text not null check (char_length(corpo) between 1 and 5000),
  fixado boolean not null default false,
  created_at timestamptz not null default now()
);

create index avisos_condominio_idx on avisos (condominio_id, fixado desc, created_at desc);

-- ---------------------------------------------------------------------------
-- Funções auxiliares para RLS (security definer evita recursão nas policies)
-- ---------------------------------------------------------------------------

create function meu_condominio() returns uuid
language sql stable security definer set search_path = public as $$
  select condominio_id from perfis where id = auth.uid()
$$;

create function sou_aprovado() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select status = 'aprovado' from perfis where id = auth.uid()), false)
$$;

create function sou_sindico() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select status = 'aprovado' and papel = 'sindico' from perfis where id = auth.uid()),
    false)
$$;

-- ---------------------------------------------------------------------------
-- Integridade: o condomínio de anúncios, recomendações e denúncias é sempre o
-- do autor, e as referências apontam para o mesmo condomínio.
-- ---------------------------------------------------------------------------

create function preencher_condominio() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select condominio_id into new.condominio_id from perfis where id = new.autor_id;
  if new.condominio_id is null then
    raise exception 'autor sem condomínio';
  end if;
  return new;
end
$$;

create trigger anuncios_condominio before insert on anuncios
  for each row execute function preencher_condominio();
create trigger recomendacoes_condominio before insert on recomendacoes
  for each row execute function preencher_condominio();
create trigger denuncias_condominio before insert on denuncias
  for each row execute function preencher_condominio();
create trigger avisos_condominio before insert on avisos
  for each row execute function preencher_condominio();

create function validar_mesmo_condominio() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'recomendacoes' then
    if not exists (select 1 from perfis where id = new.vendedor_id
                   and condominio_id = new.condominio_id and status = 'aprovado') then
      raise exception 'vendedor de outro condomínio';
    end if;
  elsif tg_table_name = 'denuncias' then
    if new.anuncio_id is not null and not exists (
        select 1 from anuncios where id = new.anuncio_id and condominio_id = new.condominio_id) then
      raise exception 'anúncio de outro condomínio';
    end if;
    if new.perfil_id is not null and not exists (
        select 1 from perfis where id = new.perfil_id and condominio_id = new.condominio_id) then
      raise exception 'perfil de outro condomínio';
    end if;
  end if;
  return new;
end
$$;

create trigger recomendacoes_mesmo_condominio before insert on recomendacoes
  for each row execute function validar_mesmo_condominio();
create trigger denuncias_mesmo_condominio before insert on denuncias
  for each row execute function validar_mesmo_condominio();

create function tocar_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger anuncios_updated_at before update on anuncios
  for each row execute function tocar_updated_at();

-- Quem não é síndico só pode mexer no conteúdo do próprio anúncio; o status
-- 'removido' é exclusivo da moderação.
create function proteger_anuncio() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.autor_id <> old.autor_id or new.condominio_id <> old.condominio_id then
    raise exception 'campos imutáveis';
  end if;
  if not sou_sindico() then
    if old.status = 'removido' then
      raise exception 'anúncio removido pela moderação';
    end if;
    if new.status = 'removido' then
      raise exception 'apenas a moderação remove anúncios';
    end if;
  end if;
  return new;
end
$$;

create trigger anuncios_protecao before update on anuncios
  for each row execute function proteger_anuncio();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table condominios enable row level security;
alter table perfis enable row level security;
alter table anuncios enable row level security;
alter table recomendacoes enable row level security;
alter table denuncias enable row level security;
alter table avisos enable row level security;

-- condominios
create policy "membro vê seu condomínio" on condominios for select
  using (id = meu_condominio());
create policy "síndico edita seu condomínio" on condominios for update
  using (id = meu_condominio() and sou_sindico())
  with check (id = meu_condominio() and sou_sindico());

-- perfis: a tabela guarda o apartamento, então só o próprio morador e o
-- síndico leem direto. Os demais usam a view perfis_publicos.
create policy "vejo meu perfil" on perfis for select
  using (id = auth.uid());
create policy "síndico vê moradores" on perfis for select
  using (condominio_id = meu_condominio() and sou_sindico());
create policy "edito meu perfil" on perfis for update
  using (id = auth.uid()) with check (id = auth.uid());

revoke update on perfis from authenticated, anon;
grant update (nome, torre, apto, mostrar_apto, whatsapp, bio,
              vitrine_nome, vitrine_descricao, horarios)
  on perfis to authenticated;
revoke insert, delete on perfis from authenticated, anon;

-- anuncios
create policy "membros veem anúncios" on anuncios for select
  using (
    condominio_id = meu_condominio() and sou_aprovado()
    and (status in ('ativo', 'vendido') or autor_id = auth.uid() or sou_sindico())
  );
create policy "membro aprovado anuncia" on anuncios for insert
  with check (autor_id = auth.uid() and sou_aprovado() and status <> 'removido');
create policy "autor edita anúncio" on anuncios for update
  using (autor_id = auth.uid() and sou_aprovado())
  with check (autor_id = auth.uid());
create policy "síndico modera anúncios" on anuncios for update
  using (condominio_id = meu_condominio() and sou_sindico())
  with check (condominio_id = meu_condominio());
create policy "autor apaga anúncio" on anuncios for delete
  using (autor_id = auth.uid());

-- recomendacoes
create policy "membros veem recomendações" on recomendacoes for select
  using (condominio_id = meu_condominio() and sou_aprovado());
create policy "membro recomenda" on recomendacoes for insert
  with check (autor_id = auth.uid() and sou_aprovado());
create policy "autor apaga recomendação" on recomendacoes for delete
  using (autor_id = auth.uid() or (condominio_id = meu_condominio() and sou_sindico()));

-- denuncias
create policy "denunciante e síndico veem" on denuncias for select
  using (autor_id = auth.uid() or (condominio_id = meu_condominio() and sou_sindico()));
create policy "membro denuncia" on denuncias for insert
  with check (autor_id = auth.uid() and sou_aprovado() and status = 'aberta');
create policy "síndico trata denúncia" on denuncias for update
  using (condominio_id = meu_condominio() and sou_sindico())
  with check (condominio_id = meu_condominio());

-- avisos
create policy "membros leem o mural" on avisos for select
  using (condominio_id = meu_condominio() and sou_aprovado());
create policy "síndico publica" on avisos for insert
  with check (autor_id = auth.uid() and sou_sindico());
create policy "síndico edita aviso" on avisos for update
  using (condominio_id = meu_condominio() and sou_sindico())
  with check (condominio_id = meu_condominio());
create policy "síndico apaga aviso" on avisos for delete
  using (condominio_id = meu_condominio() and sou_sindico());

-- ---------------------------------------------------------------------------
-- View pública de perfis: só moradores aprovados, só do meu condomínio, e o
-- apartamento só aparece se o morador permitir.
-- ---------------------------------------------------------------------------

create view perfis_publicos with (security_invoker = false) as
  select
    p.id,
    p.condominio_id,
    p.nome,
    p.torre,
    case when p.mostrar_apto or p.id = auth.uid() then p.apto end as apto,
    p.whatsapp,
    p.bio,
    p.vitrine_nome,
    p.vitrine_descricao,
    p.horarios,
    p.papel,
    p.created_at,
    (select count(*) from recomendacoes r where r.vendedor_id = p.id) as total_recomendacoes
  from perfis p
  where p.status = 'aprovado'
    and p.condominio_id = meu_condominio()
    and sou_aprovado();

revoke all on perfis_publicos from anon;
grant select on perfis_publicos to authenticated;

-- ---------------------------------------------------------------------------
-- RPCs de onboarding e moderação
-- ---------------------------------------------------------------------------

-- Cria um condomínio e torna quem chamou o síndico (já aprovado).
create function criar_condominio(
  p_nome text, p_cidade text, p_nome_morador text, p_torre text, p_apto text,
  p_whatsapp text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  if exists (select 1 from perfis where id = auth.uid()) then
    raise exception 'você já participa de um condomínio';
  end if;

  insert into condominios (nome, cidade) values (p_nome, nullif(p_cidade, ''))
    returning id into v_id;
  insert into perfis (id, condominio_id, nome, torre, apto, whatsapp, papel, status)
    values (auth.uid(), v_id, p_nome_morador, p_torre, p_apto,
            nullif(p_whatsapp, ''), 'sindico', 'aprovado');
  return v_id;
end
$$;

-- Entra num condomínio pelo código de convite; fica pendente até o síndico aprovar.
create function entrar_condominio(
  p_codigo text, p_nome_morador text, p_torre text, p_apto text, p_whatsapp text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  if exists (select 1 from perfis where id = auth.uid()) then
    raise exception 'você já participa de um condomínio';
  end if;

  select id into v_id from condominios where codigo_convite = upper(trim(p_codigo));
  if v_id is null then raise exception 'código de convite inválido'; end if;

  insert into perfis (id, condominio_id, nome, torre, apto, whatsapp)
    values (auth.uid(), v_id, p_nome_morador, p_torre, p_apto, nullif(p_whatsapp, ''));
  return v_id;
end
$$;

create function moderar_morador(p_perfil uuid, p_status status_morador)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not sou_sindico() then raise exception 'apenas o síndico'; end if;
  if p_perfil = auth.uid() then raise exception 'não é possível moderar a si mesmo'; end if;
  update perfis set status = p_status
    where id = p_perfil and condominio_id = meu_condominio();
  if not found then raise exception 'morador não encontrado'; end if;
end
$$;

create function definir_papel(p_perfil uuid, p_papel papel_morador)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not sou_sindico() then raise exception 'apenas o síndico'; end if;
  if p_perfil = auth.uid() and p_papel <> 'sindico' then
    raise exception 'passe a função para outro morador antes de sair';
  end if;
  update perfis set papel = p_papel
    where id = p_perfil and condominio_id = meu_condominio() and status = 'aprovado';
  if not found then raise exception 'morador não encontrado'; end if;
end
$$;

create function gerar_novo_convite() returns text
language plpgsql security definer set search_path = public as $$
declare
  v_codigo text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
begin
  if not sou_sindico() then raise exception 'apenas o síndico'; end if;
  update condominios set codigo_convite = v_codigo where id = meu_condominio();
  return v_codigo;
end
$$;

revoke execute on function criar_condominio, entrar_condominio, moderar_morador,
  definir_papel, gerar_novo_convite from public, anon;
grant execute on function criar_condominio, entrar_condominio, moderar_morador,
  definir_papel, gerar_novo_convite to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: fotos dos anúncios. Leitura pública (URLs não adivinháveis),
-- escrita apenas na pasta do próprio usuário.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "envio na própria pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "apago da própria pasta" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

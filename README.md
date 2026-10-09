# ForCondom

**A economia do seu condomínio, organizada.**

Plataforma para organizar a comunidade e, principalmente, a economia interna de condomínios grandes: moradores que vendem produtos (marmitas, bolos, artesanato), prestam serviços (eletricista, manicure, pet sitter, aulas) ou anunciam itens usados para os próprios vizinhos.

> "Compre de alguém que mora no seu condomínio."

- [Visão do produto](docs/visao.md)
- [Plano de validação](docs/validacao.md) (opcional; decidimos construir o MVP direto)

## O que o MVP faz

| Área | Funcionalidades |
|---|---|
| **Explorar** | Feed de produtos, serviços e classificados do condomínio, com busca e filtro por categoria |
| **Anúncios** | Criar/editar com foto e preço (ou "a combinar"), pausar, marcar como vendido, excluir; botão "Chamar no WhatsApp" com mensagem pronta |
| **Vizinhos** | Vitrine de cada vendedor/prestador (nome da vitrine, descrição, horários, anúncios), selo de morador verificado |
| **Recomendações** | "👍 Recomendo" com comentário opcional, uma por vizinho (sem notas negativas públicas) |
| **Moderação** | Denúncias privadas de anúncio ou perfil; síndico remove anúncios, resolve/descarta denúncias |
| **Síndico** | Código de convite, aprovação/recusa/bloqueio de moradores, promover moderadores, regras do condomínio |
| **Mural** | Comunicados do síndico, com opção de fixar no topo (aparece também no Explorar) |
| **Privacidade** | Só moradores aprovados do mesmo condomínio veem algo; apartamento só aparece se o morador permitir |

### Como funciona a entrada

1. O síndico cria a conta e cadastra o condomínio, e passa a ser o moderador.
2. Ele divulga o **código de convite** no grupo do condomínio.
3. O morador cria a conta, informa o código, a torre e o apto, e fica **pendente**.
4. O síndico aprova no painel e o app é liberado.

## Stack

- **Next.js 16** (App Router, Server Actions) + **Tailwind CSS 4**, mobile-first e instalável como PWA
- **Supabase**: Auth (e-mail e senha), Postgres com **RLS** isolando cada condomínio, Storage para fotos
- Toda regra de permissão vive no banco (`supabase/migrations`): mesmo que alguém chame a API direto, não consegue ver outro condomínio, se autoaprovar ou desfazer uma remoção da moderação.

## Rodando localmente

Pré-requisitos: Node 20+ e um projeto no [Supabase](https://supabase.com) (o plano gratuito serve).

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a publishable key do seu projeto
```

Aplique o schema no projeto Supabase de uma destas formas:

- **CLI:** `npx supabase link --project-ref <ref>` e depois `npx supabase db push`
- **Painel:** cole o conteúdo de `supabase/migrations/20261009000000_init.sql` no SQL Editor e execute

No painel do Supabase, em **Authentication → URL Configuration**, defina o *Site URL* (ex.: `http://localhost:3000`) e adicione `http://localhost:3000/auth/callback` (e a URL de produção equivalente) em *Redirect URLs*. É para lá que aponta o link de confirmação de e-mail.

```bash
npm run dev   # http://localhost:3000
```

Com Docker, `npx supabase start` sobe um Supabase local que já aplica a migração (veja `supabase/config.toml`).

### Testes do banco

`supabase/tests/rls.sql` percorre os cenários de permissão: isolamento entre condomínios, morador pendente, tentativa de se autoaprovar, de editar anúncio alheio e de reativar anúncio removido. Rode **somente** em um banco descartável.

## Estrutura

```
src/
  app/
    page.tsx               landing
    entrar/                login e cadastro
    auth/callback/         confirmação de e-mail
    onboarding/            entrar com convite ou cadastrar condomínio
    aguardando/            aprovação pendente / bloqueado
    (app)/                 área do morador aprovado (layout com navegação inferior)
      inicio/              explorar anúncios
      anuncios/            novo, detalhe, editar + server actions
      vitrines/            lista de vizinhos que vendem
      vizinhos/[id]/       vitrine + recomendações
      mural/  regras/  perfil/
      admin/               painel do síndico
  lib/                     auth, clientes Supabase, tipos, formatação
  proxy.ts                 renova a sessão e protege as rotas
supabase/
  migrations/              schema, RLS, RPCs, bucket de fotos
  tests/rls.sql
```

## Próximos passos sugeridos

- Deploy na Vercel conectado ao repositório
- Notificações (novo anúncio, aprovação, denúncia) por e-mail ou push
- Reservas de áreas comuns, ocorrências, documentos e avisos de encomendas (roadmap em [docs/visao.md](docs/visao.md))

# Visão do produto

## Problema

Condomínios grandes (300+ unidades) já têm uma economia interna: comida, serviços, classificados. Ela vive em grupos de WhatsApp, o que gera:

- **Para quem compra:** ofertas que somem no meio da conversa, nenhuma forma de achar "quem faz manicure aqui", nenhum histórico de reputação.
- **Para quem vende:** precisa repostar o tempo todo, compete com spam, não tem vitrine.
- **Para o síndico:** reclamações de spam no grupo, conflitos entre vizinhos por negócios mal resolvidos, dúvidas sobre o que o regimento interno permite (circulação de clientes de fora, uso de áreas comuns, atividade comercial em unidade residencial).

## Posicionamento

Não é "mais um sistema para síndico". É **a plataforma digital do condomínio**, que o morador abre por motivos próprios.

Diferencial proposto em relação aos concorrentes (VICUS, JuntApê, Kondi, Condos Shop, CondoMarket, Vzin, MyVillage, Housi AppSpace), a ser confirmado na validação:

1. **Comércio interno com regras do condomínio.** O síndico define o que é permitido (categorias, horários, entregas na portaria, proibição de atendimento a público externo) e a plataforma aplica essas regras. Isso transforma o comércio interno de um problema do síndico em algo que ele administra.
2. **Mais leve que o WhatsApp.** Vitrine compartilhável por link, contato direto pelo WhatsApp do vendedor, sem obrigar ninguém a aprender outro chat.
3. **Confiança verificada.** Selo de "morador verificado" concedido pela administração.

## MVP (primeira versão de software, só depois da validação)

| Módulo | Escopo mínimo |
|---|---|
| Vitrine (produtos e serviços) | Perfil do vendedor, itens, horários, botão "chamar no WhatsApp" |
| Classificados | Anúncio com foto, preço, status vendido |
| Perfis | Morador, vendedor/prestador; selo de verificação |
| Recomendações | Indicações positivas ("recomendo"), com histórico |
| Moderação | Aprovação de vendedores pelo síndico, denúncias, regras do condomínio |
| Mural | Comunicados simples (opcional no MVP) |

### Decisões deliberadas para o MVP

- **Sem chat próprio.** Contato via WhatsApp. Chat interno custa caro e compete com um hábito que já existe.
- **Recomendações em vez de notas de 1 a 5.** Avaliação negativa pública entre vizinhos tende a gerar conflito, que é justamente o que o síndico quer evitar. Problemas vão por denúncia privada à moderação.
- **Privacidade (LGPD).** Mostrar o apartamento é opcional; o padrão é exibir só a torre. Aprovação de cadastro valida a unidade sem expô-la.
- **PWA (web app) antes de app nativo.** Entrar por um link no grupo do condomínio é muito menos atrito do que instalar um app.

## Roadmap posterior (só com uso real)

Comunidade: enquetes, eventos, achados e perdidos, documentos.
Operação: ocorrências, manutenção, reservas de áreas comuns, avisos de encomendas.

## Modelo de receita (hipóteses)

- Mensalidade do condomínio: R$ 99–299/mês conforme porte.
- Alternativa a testar: gratuito para o condomínio, com plano pago para vendedores (destaque, mais itens, estatísticas).
- Futuro: venda por administradoras de condomínio (um contrato, muitos condomínios), anúncios de destaque e, se fizer sentido, comissão.

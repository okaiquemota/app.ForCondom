# Plano de validação

Objetivo: decidir, com evidência, se vale desenvolver o ForCondom e qual posicionamento usar, gastando o mínimo possível em código.

## Hipóteses principais (das mais arriscadas para as menos)

| # | Hipótese | Por que é arriscada |
|---|---|---|
| H1 | Moradores usam uma vitrine fora do WhatsApp para achar vendedores do condomínio | O WhatsApp já resolve "bem o suficiente"; trocar de hábito é difícil |
| H2 | Vendedores mantêm o perfil atualizado | Sem oferta atualizada a vitrine morre |
| H3 | O síndico vê valor em organizar/regular o comércio interno | Pode preferir proibir ou ignorar |
| H4 | Alguém paga: condomínio (R$ 99–299/mês) ou vendedor | Mensalidade do condomínio às vezes depende de assembleia; quem usa (morador) não é quem paga (condomínio) |
| H5 | O diferencial "regras do condomínio + moderação" pesa contra os concorrentes | Concorrentes podem já resolver isso |

## Etapa 1: Entrevistas (2 semanas)

Meta: 5 síndicos/administradores, 10 vendedores, 15 compradores, de preferência em condomínios com 300+ unidades.

Regra de ouro: perguntar sobre **o que já aconteceu**, não sobre o que a pessoa faria ("você usaria?" sempre recebe "sim").

**Síndicos**
- Qual foi a última vez que o comércio entre moradores gerou problema? O que aconteceu?
- O regimento interno fala algo sobre atividade comercial? Como vocês fiscalizam?
- Que sistema/app o condomínio usa hoje e quanto paga? Quem decidiu a contratação?
- Como foi o processo para aprovar o último gasto recorrente desse tipo?

**Vendedores/prestadores**
- Como você divulga hoje? Quantas vendas por semana vêm do condomínio?
- O que mais atrapalha (spam, posts que somem, calote, regras)?
- Já pagou para divulgar em algum lugar? Quanto?

**Compradores**
- Qual foi a última vez que você comprou/contratou alguém do condomínio? Como encontrou?
- Já quis algo e não sabia se alguém do condomínio fazia?
- Teve alguma experiência ruim? Como resolveu?

**Concorrência:** perguntar a todos se conhecem ou já usaram algum dos concorrentes listados no README. Paralelamente, criar conta nos que permitirem e anotar o que fazem bem, o que falta e o preço.

## Etapa 2: MVP concierge, sem código (4 semanas, 1 a 2 condomínios)

1. Com apoio do síndico, mapear os vendedores que já anunciam no grupo e convidá-los.
2. Cadastro por formulário (Google Forms/Tally).
3. Vitrine montada numa ferramenta no-code (Notion, Glide, Softr ou uma página simples), com botão para o WhatsApp de cada vendedor, usando links rastreáveis.
4. Divulgar o link no grupo e na portaria; o síndico anuncia como "o canal oficial do comércio entre moradores", com as regras.
5. Toda semana: lembrar os vendedores de atualizar e postar um "destaques da semana" no grupo apontando para a vitrine.

## Métricas e critérios de decisão

| Métrica | Sinal verde (seguir) | Sinal vermelho (repensar) |
|---|---|---|
| Vendedores cadastrados (condomínio de ~600 aptos) | ≥ 25 | < 10 |
| Moradores que acessaram a vitrine | ≥ 20% das unidades | < 5% |
| Cliques para WhatsApp por semana | crescendo semana a semana | caindo após a 1ª semana |
| Vendedores que dizem ter vendido via vitrine | ≥ 40% | < 15% |
| Síndicos dispostos a pagar (carta de intenção ou pré-venda) | ≥ 2 de 5 | 0 de 5 |
| Vendedores dispostos a pagar R$ 15–30/mês por destaque | ≥ 20% | ~0 |

Decisões possíveis ao fim:
- **Construir o MVP** se H1, H2 e pelo menos uma forma de pagamento (H4) passarem.
- **Pivotar a cobrança** (vendedor em vez de condomínio, ou administradoras) se o uso passar e o síndico não pagar.
- **Parar ou repensar** se os moradores não saírem do WhatsApp mesmo com a vitrine pronta.

## Registro

Anotar cada entrevista em `docs/entrevistas/AAAA-MM-DD-perfil.md` (sem dados pessoais identificáveis) e os números semanais em uma planilha.

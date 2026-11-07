# Custo do Pro sem expiração

Receita bruta atual: R$ 49,90 por conta. Não há dados de fatura e uso suficientes neste repositório para afirmar o custo real por usuário. O cálculo abaixo é **um cenário ilustrativo**, sem taxas de pagamento, impostos, inflação ou câmbio.

Fórmula mensal por usuário:

`armazenamento_GB × R$/GB-mês + tráfego_GB × R$/GB + minutos_suporte/60 × R$/hora + infraestrutura_rateada`

| Entrada ilustrativa | Valor |
| --- | ---: |
| Armazenamento por usuário | 0,01 GB |
| Custo de armazenamento | R$ 1/GB-mês |
| Tráfego mensal por usuário | 0,10 GB |
| Custo de tráfego | R$ 1/GB |
| Suporte médio mensal | 1 minuto |
| Custo do suporte | R$ 60/hora |
| Infraestrutura rateada | R$ 0,10/mês |
| Custo mensal resultante | R$ 1,21 |

| Horizonte | Custo acumulado | Receita menos custo |
| --- | ---: | ---: |
| 12 meses | R$ 14,52 | R$ 35,38 |
| 36 meses | R$ 43,56 | R$ 6,34 |
| 60 meses | R$ 72,60 | -R$ 22,70 |
| 120 meses | R$ 145,20 | -R$ 95,30 |

Nesse cenário, a receita é consumida em 41,2 meses. Taxas e impostos antecipam esse ponto. Com custo mensal positivo e horizonte ilimitado, uma receita única não cobre custos indefinidamente; é necessário provisionar recursos e monitorar a coorte.

Execute com dados reais:

```sh
node --import tsx scripts/lifetime-cost.ts --price=49.9 --fees=0 --tax-rate=0 --storage-gb=0.01 --storage-rate=1 --bandwidth-gb=0.1 --bandwidth-rate=1 --support-minutes=1 --support-hourly=60 --infra-monthly=0.1
```

Coletar antes de decidir limites: imagens e bytes por usuário ativo e inativo; tráfego de imagens externas; retenção; fatura marginal (não apenas franquia grátis); custo de banco/hosting; tempo de suporte; impostos; taxas; reembolsos. Usar medianas e percentis altos: assinaturas ilimitadas não impõem limite ao número total de imagens. Business de R$ 9,90/mês com equipe ilimitada também precisa de análise por empresa e tamanho da equipe.

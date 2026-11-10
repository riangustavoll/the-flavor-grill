/*
  logica.js — Fechamento do dia (algoritmo de lógica de programação)

  Tema: resumo das vendas de um dia de delivery da The Flavor Grill.

  Entrada:
    - Meta de faturamento do dia (em reais), digitada pelo usuário.
    - Números de pedidos para consulta, até o usuário digitar "sair".

  Processamento:
    - Percorrer os pedidos de exemplo e calcular o total de cada um
      a partir dos preços do cardápio (js/dados.js).
    - Classificar cada pedido pelo valor (pequeno, médio ou grande).
    - Traduzir a forma de pagamento para um nome legível.
    - Acumular o faturamento, contar entregas e combos, achar o maior pedido.
    - Comparar o faturamento com a meta informada.

  Saída:
    - Relatório em console.table e um resumo em frases no console.
    - Detalhes do pedido consultado.

  Pseudocódigo:
    1. Declarar os pedidos de exemplo.
    2. Ler a meta; se cancelar, vazia ou inválida, avisar e encerrar.
    3. Para cada pedido:
         total <- soma (preço do item + combo) x quantidade
         se total < 40 então porte <- "Pequeno"
         senão se total < 80 então porte <- "Médio"
         senão porte <- "Grande"
         escolha pagamento: pix / cartao / dinheiro
         acumular faturamento, entregas, combos e maior pedido
    4. Exibir a tabela, o ticket médio e se a meta foi atingida.
    5. Enquanto o comando for diferente de "sair": ler o número do pedido e mostrar seus dados.
*/

const PEDIDOS_DO_DIA = [
    {
        numero: 101, tipo: "entrega", pagamento: "pix",
        itens: [{ id: "smash", quantidade: 2, combo: true }]
    },
    {
        numero: 102, tipo: "retirada", pagamento: "dinheiro",
        itens: [{ id: "classico", quantidade: 1, combo: false }]
    },
    {
        numero: 103, tipo: "entrega", pagamento: "cartao",
        itens: [
            { id: "prime", quantidade: 1, combo: true },
            { id: "batata", quantidade: 1, combo: false }
        ]
    },
    {
        numero: 104, tipo: "entrega", pagamento: "pix",
        itens: [
            { id: "quatro-queijos", quantidade: 2, combo: false },
            { id: "onion-rings", quantidade: 1, combo: false }
        ]
    },
    {
        numero: 105, tipo: "retirada", pagamento: "cartao",
        itens: [{ id: "nuggets", quantidade: 1, combo: false }]
    }
];

// Soma o valor de todos os itens de um pedido, usando os preços do cardápio
function calcularTotalPedido(pedido) {
    let total = 0;
    for (const itemPedido of pedido.itens) {
        const precoItem = buscarItem(itemPedido.id).preco;
        const precoComCombo = itemPedido.combo ? precoItem + PRECO_COMBO : precoItem;
        total += precoComCombo * itemPedido.quantidade;
    }
    return total;
}

// Classifica o pedido pelo valor total
function classificarPedido(total) {
    if (total < 40) {
        return "Pequeno";
    } else if (total < 80) {
        return "Médio";
    } else {
        return "Grande";
    }
}

// Converte o código da forma de pagamento em um nome para o relatório
function nomearPagamento(codigo) {
    switch (codigo) {
        case "pix":
            return "Pix";
        case "cartao":
            return "Cartão";
        case "dinheiro":
            return "Dinheiro";
        default:
            return "Não informado";
    }
}

function simularFechamentoDoDia() {
    const entradaMeta = prompt("Qual a meta de faturamento do dia? (em reais, ex.: 300)");

    if (entradaMeta === null) {
        console.log("Fechamento cancelado.");
        return;
    }
    if (entradaMeta.trim() === "") {
        console.log("Informe um valor; a entrada está vazia.");
        return;
    }

    const metaFaturamento = Number(entradaMeta.replace(",", "."));
    if (Number.isNaN(metaFaturamento) || metaFaturamento <= 0) {
        console.log("Meta inválida. Informe um número maior que zero.");
        return;
    }

    let faturamento = 0;
    let totalEntregas = 0;
    let totalCombos = 0;
    let maiorPedido = null;
    const relatorio = [];

    for (const pedido of PEDIDOS_DO_DIA) {
        const totalPedido = calcularTotalPedido(pedido);

        faturamento += totalPedido;
        if (pedido.tipo === "entrega") {
            totalEntregas++;
        }
        for (const itemPedido of pedido.itens) {
            if (itemPedido.combo) {
                totalCombos += itemPedido.quantidade;
            }
        }
        if (maiorPedido === null || totalPedido > maiorPedido.total) {
            maiorPedido = { numero: pedido.numero, total: totalPedido };
        }

        relatorio.push({
            pedido: pedido.numero,
            tipo: pedido.tipo === "entrega" ? "Entrega" : "Retirada",
            pagamento: nomearPagamento(pedido.pagamento),
            total: formatarPreco(totalPedido),
            porte: classificarPedido(totalPedido)
        });
    }

    const ticketMedio = faturamento / PEDIDOS_DO_DIA.length;
    const percentualMeta = ((faturamento / metaFaturamento) * 100).toFixed(1).replace(".", ",");

    console.table(relatorio);
    console.log("Pedidos: " + PEDIDOS_DO_DIA.length + ". Entregas: " + totalEntregas + ". Combos vendidos: " + totalCombos + ".");
    console.log("Faturamento: " + formatarPreco(faturamento) + ". Ticket médio: " + formatarPreco(ticketMedio) + ".");
    console.log("Maior pedido: nº " + maiorPedido.numero + " (" + formatarPreco(maiorPedido.total) + ").");
    if (faturamento >= metaFaturamento) {
        console.log("Meta de " + formatarPreco(metaFaturamento) + " atingida! (" + percentualMeta + "%)");
    } else {
        console.log("Faltaram " + formatarPreco(metaFaturamento - faturamento) + " para a meta (" + percentualMeta + "% atingido).");
    }

    /*
      Teste de mesa do laço principal (preços atuais do cardápio):
      Volta | Pedido | Total do pedido | Faturamento acumulado | Entregas | Combos | Maior pedido | Porte
      1     | 101    | 69,80           | 69,80                 | 1        | 2      | 101 (69,80)  | Médio
      2     | 102    | 23,90           | 93,70                 | 1        | 2      | 101 (69,80)  | Pequeno
      3     | 103    | 66,80           | 160,50                | 2        | 3      | 101 (69,80)  | Médio
      4     | 104    | 98,70           | 259,20                | 3        | 3      | 104 (98,70)  | Grande
      5     | 105    | 17,90           | 277,10                | 3        | 3      | 104 (98,70)  | Pequeno
      Ao final: faturamento = 277,10; ticket médio = 55,42; com meta 300 -> faltaram 22,90 (92,4%).
    */

    let comando = "";
    while (comando !== "sair") {
        const entradaConsulta = prompt("Digite o número de um pedido (101 a 105) ou sair:");

        if (entradaConsulta === null) {
            comando = "sair";
        } else {
            comando = entradaConsulta.trim().toLowerCase();
            if (comando !== "sair") {
                const pedidoEncontrado = PEDIDOS_DO_DIA.find(pedido => String(pedido.numero) === comando);
                if (pedidoEncontrado) {
                    const nomesItens = pedidoEncontrado.itens.map(function (itemPedido) {
                        return itemPedido.quantidade + "x " + buscarItem(itemPedido.id).nome + (itemPedido.combo ? " (combo)" : "");
                    });
                    console.log("Pedido " + pedidoEncontrado.numero + ": " + nomesItens.join(", ") + " · " + formatarPreco(calcularTotalPedido(pedidoEncontrado)));
                } else {
                    console.log("Pedido não encontrado: \"" + entradaConsulta + "\". Use 101 a 105 ou sair.");
                }
            }
        }
    }
    console.log("Consulta encerrada.");
}

document.getElementById("executar-fechamento").addEventListener("click", simularFechamentoDoDia);

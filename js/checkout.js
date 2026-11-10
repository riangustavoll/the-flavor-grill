/*
  checkout.js
  Formulário de finalização: entrega ou retirada, dados do cliente,
  pagamento e montagem da mensagem enviada para o WhatsApp da loja.
  A validação dos campos obrigatórios é feita pelo próprio HTML (required).
*/

const formularioPedido = document.getElementById("formulario-pedido");
const grupoEndereco = document.getElementById("grupo-endereco");
const campoTroco = document.getElementById("campo-troco");
const avisoTaxa = document.getElementById("aviso-taxa");

// Campos que são lembrados para o próximo pedido
const CAMPOS_LEMBRADOS = ["nome", "rua", "numero", "bairro", "referencia"];

function lerCampo(nome) {
    return formularioPedido.elements[nome].value.trim();
}

/* ---------- Ajustes conforme as escolhas do cliente ---------- */

function atualizarFormulario() {
    const ehEntrega = formularioPedido.elements.tipo.value === "entrega";

    // Fieldset desativado não é enviado nem validado: o endereço deixa de ser obrigatório
    grupoEndereco.disabled = !ehEntrega;
    grupoEndereco.hidden = !ehEntrega;
    avisoTaxa.textContent = ehEntrega
        ? "+ taxa de entrega, confirmada pelo WhatsApp conforme o bairro."
        : "Retirada no local: sem taxa de entrega.";

    campoTroco.hidden = formularioPedido.elements.pagamento.value !== "Dinheiro";
}

function lembrarDadosDoCliente() {
    const dados = {};
    for (const campo of CAMPOS_LEMBRADOS) {
        dados[campo] = lerCampo(campo);
    }
    salvarNoArmazenamento(CHAVE_CLIENTE, dados);
}

function preencherDadosSalvos() {
    const dadosSalvos = lerDoArmazenamento(CHAVE_CLIENTE, {});
    for (const campo of CAMPOS_LEMBRADOS) {
        if (dadosSalvos[campo]) {
            formularioPedido.elements[campo].value = dadosSalvos[campo];
        }
    }
}

/* ---------- Mensagem do pedido ---------- */

function montarMensagemPedido() {
    const linhas = ["*NOVO PEDIDO · THE FLAVOR GRILL* 🍔", ""];

    for (const linha of carrinho) {
        const item = buscarItem(linha.id);
        const totalLinha = calcularPrecoUnitario(linha) * linha.quantidade;
        linhas.push("▪️ " + linha.quantidade + "x *" + item.nome + "*" + (linha.combo ? " (COMBO)" : "") + " · " + formatarPreco(totalLinha));
        if (linha.combo) {
            linhas.push("   + batata + refri lata" + (linha.refri ? ": " + linha.refri : ""));
        }
        if (ehPorcao(linha.id)) {
            linhas.push("   + molho grátis");
        }
        if (linha.observacao) {
            linhas.push("   Obs.: " + linha.observacao);
        }
    }

    linhas.push("", "*Subtotal:* " + formatarPreco(calcularSubtotal()), "");
    linhas.push("*Nome:* " + lerCampo("nome"));

    const ehEntrega = formularioPedido.elements.tipo.value === "entrega";
    if (ehEntrega) {
        linhas.push("*Entrega em:* " + lerCampo("rua") + ", " + lerCampo("numero") + " · " + lerCampo("bairro"));
        if (lerCampo("referencia")) {
            linhas.push("*Referência:* " + lerCampo("referencia"));
        }
    } else {
        linhas.push("*Retirada no local*");
    }

    let pagamento = formularioPedido.elements.pagamento.value;
    if (pagamento === "Dinheiro" && lerCampo("troco")) {
        pagamento += " (troco para " + formatarPreco(Number(lerCampo("troco"))) + ")";
    } else if (pagamento === "Cartão") {
        pagamento += " (na entrega)";
    }
    linhas.push("*Pagamento:* " + pagamento);

    if (lerCampo("observacoes")) {
        linhas.push("*Observações:* " + lerCampo("observacoes"));
    }
    if (ehEntrega) {
        linhas.push("", "Aguardo a confirmação da taxa de entrega e do total. 🙏");
    }
    return linhas.join("\n");
}

function criarLinkWhatsApp(mensagem) {
    return "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensagem);
}

/* ---------- Eventos ---------- */

formularioPedido.addEventListener("change", atualizarFormulario);
formularioPedido.addEventListener("input", lembrarDadosDoCliente);

// O evento submit só acontece se todos os campos obrigatórios estiverem válidos
formularioPedido.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (contarItens() === 0) {
        return;
    }

    const link = criarLinkWhatsApp(montarMensagemPedido());
    const novaAba = window.open(link, "_blank");
    if (novaAba) {
        novaAba.opener = null;
    } else {
        // Se o navegador bloquear a nova aba, abre na mesma
        window.location.href = link;
    }
    mostrarAviso("Abrindo o WhatsApp… é só tocar em enviar!");
});

document.getElementById("link-whatsapp").href = criarLinkWhatsApp("Olá! Vim pelo site da The Flavor Grill. 🍔");

preencherDadosSalvos();
atualizarFormulario();

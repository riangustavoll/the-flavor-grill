/*
  carrinho.js
  Guarda os itens escolhidos, salva no localStorage (para não perder ao
  recarregar a página) e desenha a sacola na tela.
*/

const linhasSacola = document.getElementById("linhas-sacola");
const sacola = document.getElementById("sacola");
const etapaItens = document.getElementById("etapa-itens");
const etapaFinalizar = document.getElementById("etapa-finalizar");
const botaoContinuar = document.getElementById("continuar");
const botaoFinalizar = document.getElementById("finalizar");
const botaoEsvaziar = document.getElementById("esvaziar-sacola");
const tituloSacola = document.getElementById("sacola-titulo");

/* ---------- Leitura e gravação no localStorage ---------- */

function lerDoArmazenamento(chave, valorPadrao) {
    try {
        const texto = localStorage.getItem(chave);
        return texto ? JSON.parse(texto) : valorPadrao;
    } catch (erro) {
        // Navegação anônima ou armazenamento bloqueado: segue sem salvar
        return valorPadrao;
    }
}

function salvarNoArmazenamento(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        console.warn("Não foi possível salvar no navegador:", erro);
    }
}

// Ao abrir a página, recupera a sacola salva (ignorando itens que saíram do cardápio)
let carrinho = lerDoArmazenamento(CHAVE_CARRINHO, []).filter(linha => buscarItem(linha.id));

/* ---------- Cálculos ---------- */

function calcularPrecoUnitario(linha) {
    return buscarItem(linha.id).preco + (linha.combo ? PRECO_COMBO : 0);
}

function calcularSubtotal() {
    let subtotal = 0;
    for (const linha of carrinho) {
        subtotal += calcularPrecoUnitario(linha) * linha.quantidade;
    }
    return subtotal;
}

function contarItens() {
    return carrinho.reduce((total, linha) => total + linha.quantidade, 0);
}

/* ---------- Alterações na sacola ---------- */

function adicionarAoCarrinho(novaLinha) {
    // Se já existe uma linha igual (mesmo item, combo e observação), só soma a quantidade
    const linhaIgual = carrinho.find(linha =>
        linha.id === novaLinha.id &&
        linha.combo === novaLinha.combo &&
        linha.refri === novaLinha.refri &&
        linha.observacao === novaLinha.observacao
    );

    if (linhaIgual) {
        linhaIgual.quantidade = Math.min(linhaIgual.quantidade + novaLinha.quantidade, 50);
    } else {
        carrinho.push(novaLinha);
    }
    atualizarSacola();
}

function esvaziarCarrinho() {
    carrinho = [];
    atualizarSacola();
}

/* ---------- Desenho da sacola (com textContent, nunca innerHTML) ---------- */

function criarLinhaSacola(linha, posicao) {
    const item = buscarItem(linha.id);
    const elementoLinha = criarElemento("li", "linha");

    elementoLinha.append(
        criarElemento("span", "linha-nome", item.nome + (linha.combo ? " (combo)" : "")),
        criarElemento("span", "linha-preco", formatarPreco(calcularPrecoUnitario(linha) * linha.quantidade))
    );

    // Detalhes digitados pelo cliente entram como texto puro (textContent)
    const detalhes = [];
    if (linha.combo) {
        detalhes.push("Combo: + batata + refri lata" + (linha.refri ? " (" + linha.refri + ")" : ""));
    }
    if (ehPorcao(linha.id)) {
        detalhes.push("+ molho grátis");
    }
    if (linha.observacao) {
        detalhes.push("Obs.: " + linha.observacao);
    }
    if (detalhes.length > 0) {
        const textoDetalhes = criarElemento("span", "linha-detalhes");
        detalhes.forEach(function (detalhe, indice) {
            if (indice > 0) {
                textoDetalhes.append(document.createElement("br"));
            }
            textoDetalhes.append(detalhe);
        });
        elementoLinha.append(textoDetalhes);
    }

    const controles = criarElemento("div", "linha-controles");
    const quantidade = criarElemento("div", "quantidade");
    quantidade.setAttribute("role", "group");
    quantidade.setAttribute("aria-label", "Quantidade de " + item.nome);

    const botaoMenos = criarElemento("button", "", "−");
    botaoMenos.type = "button";
    botaoMenos.dataset.acao = "diminuir";
    botaoMenos.dataset.posicao = posicao;
    botaoMenos.setAttribute("aria-label", "Diminuir " + item.nome);

    const botaoMais = criarElemento("button", "", "+");
    botaoMais.type = "button";
    botaoMais.dataset.acao = "aumentar";
    botaoMais.dataset.posicao = posicao;
    botaoMais.setAttribute("aria-label", "Aumentar " + item.nome);

    quantidade.append(botaoMenos, criarElemento("span", "", String(linha.quantidade)), botaoMais);

    const botaoRemover = criarElemento("button", "link-acao", "Remover");
    botaoRemover.type = "button";
    botaoRemover.dataset.acao = "remover";
    botaoRemover.dataset.posicao = posicao;
    botaoRemover.setAttribute("aria-label", "Remover " + item.nome);

    controles.append(quantidade, botaoRemover);
    elementoLinha.append(controles);
    return elementoLinha;
}

function criarSacolaVazia() {
    const vazia = criarElemento("li", "sacola-vazia");
    const imagem = document.createElement("img");
    imagem.src = "assets/images/logo.webp";
    imagem.alt = "";
    vazia.append(imagem, "Sua sacola está vazia.", document.createElement("br"), "Bora escolher um burguer?");
    return vazia;
}

function atualizarSacola() {
    salvarNoArmazenamento(CHAVE_CARRINHO, carrinho);

    const totalItens = contarItens();
    const subtotal = calcularSubtotal();

    document.getElementById("contador-sacola").textContent = totalItens;
    document.getElementById("subtotal").textContent = formatarPreco(subtotal);
    document.getElementById("barra-sacola").hidden = totalItens === 0;
    document.getElementById("barra-quantidade").textContent = "Ver sacola · " + totalItens + (totalItens === 1 ? " item" : " itens");
    document.getElementById("barra-total").textContent = formatarPreco(subtotal);
    botaoContinuar.disabled = totalItens === 0;
    botaoEsvaziar.hidden = totalItens === 0;

    linhasSacola.replaceChildren();
    if (totalItens === 0) {
        linhasSacola.append(criarSacolaVazia());
        mostrarEtapaItens();
        return;
    }
    carrinho.forEach(function (linha, posicao) {
        linhasSacola.append(criarLinhaSacola(linha, posicao));
    });
}

// Delegação de eventos: um único ouvinte trata os botões de todas as linhas
linhasSacola.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) {
        return;
    }
    const linha = carrinho[Number(botao.dataset.posicao)];

    switch (botao.dataset.acao) {
        case "aumentar":
            linha.quantidade = Math.min(linha.quantidade + 1, 50);
            break;
        case "diminuir":
            linha.quantidade -= 1;
            if (linha.quantidade < 1) {
                carrinho.splice(Number(botao.dataset.posicao), 1);
            }
            break;
        case "remover":
            carrinho.splice(Number(botao.dataset.posicao), 1);
            break;
    }
    atualizarSacola();
});

botaoEsvaziar.addEventListener("click", function () {
    esvaziarCarrinho();
    mostrarAviso("Sacola esvaziada");
});

/* ---------- Etapas da sacola: itens -> finalizar ---------- */

function mostrarEtapaItens() {
    etapaItens.hidden = false;
    etapaFinalizar.hidden = true;
    botaoContinuar.hidden = false;
    botaoFinalizar.hidden = true;
    tituloSacola.textContent = "Sua sacola";
}

function mostrarEtapaFinalizar() {
    etapaItens.hidden = true;
    etapaFinalizar.hidden = false;
    botaoContinuar.hidden = true;
    botaoFinalizar.hidden = false;
    tituloSacola.textContent = "Finalizar pedido";
    document.getElementById("cliente-nome").focus();
}

function abrirSacola() {
    mostrarEtapaItens();
    abrirCamada(sacola);
}

document.getElementById("abrir-sacola").addEventListener("click", abrirSacola);
document.getElementById("botao-barra-sacola").addEventListener("click", abrirSacola);
botaoContinuar.addEventListener("click", function () {
    if (contarItens() > 0) {
        mostrarEtapaFinalizar();
    }
});
document.getElementById("voltar-sacola").addEventListener("click", mostrarEtapaItens);

atualizarSacola();

/*
  cardapio.js
  Monta o cardápio na tela a partir de dados.js e controla a janela
  onde o cliente personaliza o item (combo, observação e quantidade).
*/

const listaCardapio = document.getElementById("lista-cardapio");

const janelaItem = document.getElementById("janela-item");
const janelaTitulo = document.getElementById("janela-titulo");
const janelaDescricao = document.getElementById("janela-descricao");
const opcaoCombo = document.getElementById("opcao-combo");
const caixaCombo = document.getElementById("item-combo");
const campoRefri = document.getElementById("campo-refri");
const entradaRefri = document.getElementById("item-refri");
const entradaObservacao = document.getElementById("item-observacao");
const textoQuantidade = document.getElementById("item-quantidade");
const textoPrecoItem = document.getElementById("item-preco");

let itemSelecionado = null;
let quantidadeSelecionada = 1;

/* ---------- Criação dos elementos (sem innerHTML) ---------- */

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
        elemento.className = classe;
    }
    if (texto) {
        elemento.textContent = texto;
    }
    return elemento;
}

// Título do item com o "F" destacado em laranja. Ex.: "F Smash"
function criarTituloItem(nome) {
    const titulo = criarElemento("h4");
    if (nome.startsWith("F ")) {
        titulo.append(criarElemento("span", "destaque", "F"), " " + nome.slice(2));
    } else {
        titulo.textContent = nome;
    }
    return titulo;
}

function criarCartaoItem(item) {
    const cartao = criarElemento("article", "item");

    if (item.etiqueta) {
        cartao.append(criarElemento("span", "etiqueta", item.etiqueta));
    }

    cartao.append(criarTituloItem(item.nome), criarElemento("p", "", item.descricao));

    const rodape = criarElemento("div", "item-rodape");
    const botao = criarElemento("button", "botao-adicionar", "+ Adicionar");
    botao.type = "button";
    botao.dataset.idItem = item.id;
    botao.setAttribute("aria-label", "Adicionar " + item.nome);
    rodape.append(criarElemento("span", "preco", formatarPreco(item.preco)), botao);
    cartao.append(rodape);

    return cartao;
}

function criarCartaoMolhoGratis() {
    const cartao = criarElemento("article", "item item-promocao");
    const titulo = criarElemento("h4");
    titulo.append("Molho ", criarElemento("span", "destaque", "grátis"));
    cartao.append(
        criarElemento("span", "etiqueta", "Promoção"),
        titulo,
        criarElemento("p", "", "Na compra de qualquer porção, acompanha molho da casa sem custo extra.")
    );
    return cartao;
}

function criarBannerCombo() {
    const banner = criarElemento("div", "banner-combo");
    banner.id = "combo";
    const texto = criarElemento("div", "texto");
    texto.append(
        criarElemento("strong", "", "Combo individual"),
        "Qualquer burguer + batata + refri lata. É só marcar “Transformar em combo” quando adicionar o seu."
    );
    banner.append(criarElemento("div", "valor", "+" + formatarPreco(PRECO_COMBO).replace(",00", "")), texto);
    return banner;
}

function renderizarCardapio() {
    for (const categoria of CATEGORIAS) {
        // O banner do combo fica entre os burguers e as porções
        if (categoria.temMolhoGratis) {
            listaCardapio.append(criarBannerCombo());
        }

        const secao = criarElemento("section", "categoria");
        secao.id = categoria.id;
        secao.setAttribute("aria-label", categoria.nome);

        const grade = criarElemento("div", "itens");
        if (categoria.temMolhoGratis) {
            grade.append(criarCartaoMolhoGratis());
        }
        for (const item of categoria.itens) {
            grade.append(criarCartaoItem(item));
        }

        secao.append(criarElemento("h3", "", categoria.nome), grade);
        listaCardapio.append(secao);
    }
}

/* ---------- Janela de personalização ---------- */

function atualizarJanelaItem() {
    const precoUnitario = itemSelecionado.preco + (caixaCombo.checked ? PRECO_COMBO : 0);
    textoQuantidade.textContent = quantidadeSelecionada;
    textoPrecoItem.textContent = formatarPreco(precoUnitario * quantidadeSelecionada);
    campoRefri.hidden = !caixaCombo.checked;
}

function abrirJanelaItem(idItem) {
    itemSelecionado = buscarItem(idItem);
    quantidadeSelecionada = 1;

    janelaTitulo.textContent = itemSelecionado.nome;
    janelaDescricao.textContent = itemSelecionado.descricao;
    opcaoCombo.hidden = !itemSelecionado.podeSerCombo;
    caixaCombo.checked = false;
    entradaRefri.value = "";
    entradaObservacao.value = "";

    atualizarJanelaItem();
    abrirCamada(janelaItem);
    document.getElementById("item-adicionar").focus();
}

// Delegação de eventos: um único ouvinte para todos os botões "Adicionar"
listaCardapio.addEventListener("click", function (evento) {
    const botao = evento.target.closest(".botao-adicionar");
    if (botao) {
        abrirJanelaItem(botao.dataset.idItem);
    }
});

caixaCombo.addEventListener("change", atualizarJanelaItem);

document.getElementById("item-mais").addEventListener("click", function () {
    quantidadeSelecionada = Math.min(quantidadeSelecionada + 1, 20);
    atualizarJanelaItem();
});

document.getElementById("item-menos").addEventListener("click", function () {
    quantidadeSelecionada = Math.max(quantidadeSelecionada - 1, 1);
    atualizarJanelaItem();
});

document.getElementById("item-adicionar").addEventListener("click", function () {
    adicionarAoCarrinho({
        id: itemSelecionado.id,
        quantidade: quantidadeSelecionada,
        combo: Boolean(itemSelecionado.podeSerCombo && caixaCombo.checked),
        refri: entradaRefri.value.trim(),
        observacao: entradaObservacao.value.trim()
    });
    fecharCamadas();
    mostrarAviso(quantidadeSelecionada + "x " + itemSelecionado.nome + " na sacola");
});

renderizarCardapio();

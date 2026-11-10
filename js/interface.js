/*
  interface.js
  Comportamentos gerais da página: menu hambúrguer, abas do cardápio,
  abrir/fechar janelas (sacola e item) e aviso rápido (toast).
*/

const botaoMenu = document.getElementById("botao-menu");
const menuPrincipal = document.getElementById("menu-principal");
const fundoEscuro = document.getElementById("fundo-escuro");
const avisoRapido = document.getElementById("aviso");

/* ---------- Menu hambúrguer (telas pequenas) ---------- */

function abrirOuFecharMenu(abrir) {
    menuPrincipal.classList.toggle("aberto", abrir);
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
}

botaoMenu.addEventListener("click", function () {
    const estaAberto = botaoMenu.getAttribute("aria-expanded") === "true";
    abrirOuFecharMenu(!estaAberto);
});

// Delegação de eventos: um único ouvinte na lista fecha o menu ao escolher qualquer link
menuPrincipal.addEventListener("click", function (evento) {
    if (evento.target.closest("a")) {
        abrirOuFecharMenu(false);
    }
});

/* ---------- Abas do cardápio: destaca a categoria visível ---------- */

const abas = Array.from(document.querySelectorAll(".aba"));
let indiceAbaAtual = 0;

function atualizarAbaAtiva() {
    let indiceVisivel = 0;
    abas.forEach(function (aba, indice) {
        const secao = document.querySelector(aba.getAttribute("href"));
        if (secao && secao.getBoundingClientRect().top < 200) {
            indiceVisivel = indice;
        }
    });

    if (indiceVisivel !== indiceAbaAtual) {
        indiceAbaAtual = indiceVisivel;
        abas.forEach((aba, indice) => aba.setAttribute("aria-current", String(indice === indiceVisivel)));
        // No celular as abas rolam na horizontal: mantém a aba ativa à vista
        const barraAbas = abas[0].parentElement;
        barraAbas.scrollTo({ left: Math.max(0, abas[indiceVisivel].offsetLeft - barraAbas.offsetLeft - 20), behavior: "smooth" });
    }
}

window.addEventListener("scroll", atualizarAbaAtiva, { passive: true });

/* ---------- Abrir e fechar camadas (janela do item e sacola) ---------- */

let elementoComFocoAntes = null;

function abrirCamada(elemento) {
    elementoComFocoAntes = document.activeElement;
    elemento.classList.add("aberto");
    elemento.setAttribute("aria-hidden", "false");
    fundoEscuro.classList.add("aberto");
    document.body.style.overflow = "hidden";
}

function fecharCamadas() {
    document.querySelectorAll(".janela, .sacola").forEach(function (elemento) {
        elemento.classList.remove("aberto");
        elemento.setAttribute("aria-hidden", "true");
    });
    fundoEscuro.classList.remove("aberto");
    document.body.style.overflow = "";
    // Devolve o foco para o botão que abriu a camada (importante para quem navega pelo teclado)
    if (elementoComFocoAntes) {
        elementoComFocoAntes.focus();
    }
}

fundoEscuro.addEventListener("click", fecharCamadas);

document.querySelectorAll("[data-fechar]").forEach(function (botao) {
    botao.addEventListener("click", fecharCamadas);
});

document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
        fecharCamadas();
        abrirOuFecharMenu(false);
    }
});

/* ---------- Aviso rápido ---------- */

let temporizadorAviso;

function mostrarAviso(mensagem) {
    avisoRapido.textContent = mensagem;
    avisoRapido.classList.add("visivel");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => avisoRapido.classList.remove("visivel"), 2600);
}

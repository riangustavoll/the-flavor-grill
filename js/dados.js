/*
  dados.js
  Configurações da loja e itens do cardápio.
  Para mudar preços, telefone ou itens, edite apenas este arquivo.
*/

// Número no formato internacional, só dígitos: 55 (Brasil) + 83 (DDD) + número
const NUMERO_WHATSAPP = "5583998650388";

// Valor acrescentado quando o cliente transforma um burguer em combo (batata + refri lata)
const PRECO_COMBO = 15;

// Chaves usadas para salvar dados no localStorage
const CHAVE_CARRINHO = "flavorgrill.carrinho";
const CHAVE_CLIENTE = "flavorgrill.cliente";

const CATEGORIAS = [
    {
        id: "categoria-flavor",
        nome: "Menu Flavor",
        itens: [
            {
                id: "smash",
                nome: "F Smash",
                preco: 19.90,
                podeSerCombo: true,
                descricao: "2 smashes de 80g, 2x cheddar, maionese da casa, farofa de bacon crocante, picles artesanal e cebola roxa."
            },
            {
                id: "classico",
                nome: "F Clássico",
                preco: 23.90,
                podeSerCombo: true,
                descricao: "Burguer de 160g, brioche amanteigado, cheddar e maionese da casa."
            },
            {
                id: "salada",
                nome: "F Salada",
                preco: 25.90,
                podeSerCombo: true,
                descricao: "Burguer 160g, pão brioche amanteigado, cheddar cremoso, picles artesanal, alface, tomate, cebola roxa e maionese da casa."
            }
        ]
    },
    {
        id: "categoria-premium",
        nome: "Menu Premium",
        itens: [
            {
                id: "bacon",
                nome: "F Bacon",
                preco: 28.90,
                podeSerCombo: true,
                descricao: "Burguer 160g, nosso brioche, farofa de bacon, cheddar, cebola caramelizada, maionese de bacon e bacon em tirinhas."
            },
            {
                id: "crispy",
                nome: "F Crispy",
                preco: 33.90,
                podeSerCombo: true,
                descricao: "Burguer 160g, brioche amanteigado, delicioso creme de milho, mix de couve, maionese de alho e bacon em tiras."
            },
            {
                id: "prime",
                nome: "F Prime",
                preco: 35.90,
                podeSerCombo: true,
                descricao: "Burguer 160g, brioche amanteigado, cheddar cremoso, onion rings, rúcula temperada e maionese defumada."
            },
            {
                id: "quatro-queijos",
                nome: "F 4 Queijos",
                preco: 39.90,
                podeSerCombo: true,
                etiqueta: "2 burguers",
                descricao: "2 burguers 160g, nosso brioche, catupiry, parmesão, mussarela, cheddar, molho de tomate defumado e maionese verde."
            }
        ]
    },
    {
        id: "categoria-porcoes",
        nome: "Porções",
        temMolhoGratis: true,
        itens: [
            { id: "batata", nome: "Batata Frita", preco: 15.90, descricao: "Porção de batata frita." },
            { id: "nuggets", nome: "Nuggets", preco: 17.90, descricao: "Porção de nuggets de frango." },
            { id: "onion-rings", nome: "Onion Rings", preco: 18.90, descricao: "Porção de anéis de cebola empanados." },
            { id: "iscas", nome: "Iscas de Frango", preco: 28.90, descricao: "Porção de iscas de frango empanadas." }
        ]
    }
];

// Formata um número como moeda brasileira. Ex.: 19.9 -> "R$ 19,90"
function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Procura um item do cardápio pelo id. Retorna undefined se não existir.
function buscarItem(idItem) {
    for (const categoria of CATEGORIAS) {
        const itemEncontrado = categoria.itens.find(item => item.id === idItem);
        if (itemEncontrado) {
            return itemEncontrado;
        }
    }
    return undefined;
}

// Diz se o item é uma porção (porções acompanham molho grátis)
function ehPorcao(idItem) {
    const categoriaPorcoes = CATEGORIAS.find(categoria => categoria.temMolhoGratis);
    return categoriaPorcoes.itens.some(item => item.id === idItem);
}

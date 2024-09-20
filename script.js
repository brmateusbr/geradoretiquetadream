const produtos = {}; // Armazena produtos

// Função para carregar produtos da planilha
async function carregarProdutos() {
    const url = 'https://docs.google.com/spreadsheets/d/1wO7TRDOSikvVZ2GCjXDSSqXpX8kbhNKXY_0P8jW7GMM/export?format=csv';
    const response = await fetch(url);
    const data = await response.text();
    const rows = data.split('\n').slice(1); // Ignora o cabeçalho

    rows.forEach(row => {
        const [ean, descricao, preco, codigoProduto] = row.split(',');
        produtos[ean] = { descricao, preco, codigoProduto };
    });
}

// Função para adicionar uma nova linha à tabela
function adicionarProduto() {
    const produtosTable = document.getElementById("produtosTable").getElementsByTagName("tbody")[0];
    const novaLinha = produtosTable.insertRow();
    const celulaEAN = novaLinha.insertCell();
    const celulaNome = novaLinha.insertCell();
    const celulaPreco = novaLinha.insertCell();
    const celulaQuantidade = novaLinha.insertCell();
    const celulaAcoes = novaLinha.insertCell();

    celulaEAN.innerHTML = '<input type="text" class="ean-input" placeholder="EAN">';
    celulaNome.innerHTML = '<input type="text" class="nome-input" placeholder="Nome" readonly>';
    celulaPreco.innerHTML = '<input type="number" class="preco-input" value="0.00" step="0.01">';
    celulaQuantidade.innerHTML = '<input type="number" class="quantidade-input" min="1" value="1">';
    celulaAcoes.innerHTML = '<button class="removerProduto">Remover</button>';

    // Remover a linha
    celulaAcoes.querySelector(".removerProduto").addEventListener("click", () => {
        novaLinha.remove();
    });

    // Buscar o nome do produto ao inserir EAN
    celulaEAN.querySelector('.ean-input').addEventListener('blur', function() {
        const ean = this.value;
        buscarProdutoPorEAN(ean, novaLinha);
    });
}

// Função para buscar o nome do produto por EAN
function buscarProdutoPorEAN(ean, linha) {
    if (produtos[ean]) {
        linha.querySelector('.nome-input').value = produtos[ean].descricao;
    } else {
        alert('Produto não encontrado.');
    }
}

// Função para gerar as etiquetas ZPL
function gerarEtiquetas() {
    const produtosTable = document.getElementById("produtosTable").getElementsByTagName("tbody")[0];
    const linhasProdutos = produtosTable.querySelectorAll("tr");
    let zplCode = '';
    const posicoesX = [33, 315, 595];

    let produtoIndex = 0;

    linhasProdutos.forEach((linha) => {
        const ean = linha.querySelector("td:nth-child(1) input").value;
        const nome = linha.querySelector("td:nth-child(2) input").value;
        const preco = linha.querySelector("td:nth-child(3) input").value;
        const quantidade = parseInt(linha.querySelector("td:nth-child(4) input").value, 10);

        for (let j = 0; j < quantidade; j++) {
            if (produtoIndex % 3 === 0) {
                zplCode += '\n^XA\n';
            }

            const posicaoX = posicoesX[produtoIndex % 3];
            zplCode += `^CF0,17
^FO${posicaoX},85^BY^BEN,70,10,50^BY2^FD${ean}^FS
^FO${posicaoX - 13},19^A0N,20^FDR$ ${preco}^FS
^FO${posicaoX - 13},40^A0N,0^FD- ${nome}^FS`;

            produtoIndex++;

            if (produtoIndex % 3 === 0) {
                zplCode += '\n^XZ\n';
            }
        }
    });

    if (produtoIndex % 3 !== 0) {
        zplCode += '\n^XZ\n';
    }

    if (zplCode) {
        baixarArquivoZPL(zplCode);
    } else {
        alert("Nenhum produto adicionado.");
    }
}

// Função para baixar o código ZPL gerado
function baixarArquivoZPL(zplCode) {
    const blob = new Blob([zplCode], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'etiquetas.zpl';
    link.click();
}

// Adicionar evento ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    const adicionarProdutoButton = document.getElementById("adicionarProduto");
    const gerarEtiquetasButton = document.getElementById("gerarEtiquetas");

    adicionarProdutoButton.addEventListener("click", adicionarProduto);
    gerarEtiquetasButton.addEventListener("click", gerarEtiquetas);

    // Carregar produtos ao iniciar a página
    carregarProdutos();
});

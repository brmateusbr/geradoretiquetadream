let numEtiquetas = 0;
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

function adicionarCampo() {
    const novoCampo = document.createElement('div'); // Cria uma nova div
    novoCampo.className = 'produto'; // Define a classe da div
    novoCampo.innerHTML = `
        <input type="text" name="ean_${numEtiquetas}" placeholder="EAN" required onblur="buscarProduto(this.value, ${numEtiquetas})">
        <input type="text" id="nome_${numEtiquetas}" placeholder="Nome do Produto" readonly>
        <input type="number" name="quantidade_${numEtiquetas}" placeholder="Quantidade" min="1" value="1" required>
        <button type="button" class="remover" onclick="removerCampo(this)">Remover</button>
    `;
    document.getElementById('campos').appendChild(novoCampo); // Adiciona a nova div ao contêiner
    numEtiquetas++; // Incrementa o número de etiquetas
}

function removerCampo(button) {
    button.parentElement.remove();
    numEtiquetas--; // Decrementa o número de etiquetas
}

function buscarProduto(ean, index) {
    const nomeField = document.getElementById(`nome_${index}`);
    if (produtos[ean]) {
        nomeField.value = produtos[ean].descricao;
    } else {
        nomeField.value = "Produto não encontrado!";
        nomeField.style.color = "red";
    }
}

function gerarEtiquetas() {
    const etiquetas = [];
    const posicoesX = [33, 315, 595];

    for (let i = 0; i < numEtiquetas; i++) {
        const ean = document.querySelector(`input[name="ean_${i}"]`).value;
        const quantidade = parseInt(document.querySelector(`input[name="quantidade_${i}"]`).value, 10);
        const produto = produtos[ean];

        if (produto) {
            const preco = produto.preco.replace(',', '.'); // Ajuste de preço se necessário
            const codigoProduto = produto.codigoProduto;
            const descricao = produto.descricao;

            for (let j = 0; j < quantidade; j++) {
                const posicaoX = posicoesX[(etiquetas.length) % 3];
                etiquetas.push(`
^CF0,17
^FO${posicaoX},85^BY^BEN,70,10,50^BY2^FD${ean}^FS
^FO${posicaoX - 13},19^A0N,20^FDR$ ${preco} - ${codigoProduto}^FS
^FO${posicaoX - 13},40^A0N,0^FD- ${descricao}^FS
^FO${posicaoX - 13},58^A0N,0^FD${descricao}^FS
`);
                // Adiciona o ^XZ após cada 3 etiquetas
                if ((etiquetas.length) % 3 === 0) {
                    etiquetas.push("^XZ\n^XA\n"); // Finaliza e inicia uma nova etiqueta
                }
            }
        }
    }

    // Se houver etiquetas, adiciona o final
    if (etiquetas.length > 0) {
        etiquetas.push("^XZ");
    }

    // Exibe o resultado
    document.getElementById('resultado').textContent = etiquetas.join('');
}

// Carregar os produtos ao iniciar a página
carregarProdutos();

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
    const novoCampo = document.createElement('div');
    novoCampo.className = 'produto';
    novoCampo.innerHTML = `
        <input type="text" name="ean_${numEtiquetas}" placeholder="EAN" required onblur="buscarProduto(this.value, ${numEtiquetas})">
        <input type="text" id="nome_${numEtiquetas}" placeholder="Nome do Produto" readonly>
        <input type="number" name="quantidade_${numEtiquetas}" placeholder="Quantidade" min="1" value="1" required>
        <button type="button" class="remover" onclick="removerCampo(this)">Remover</button>
    `;
    document.getElementById('campos').appendChild(novoCampo);
    numEtiquetas++;
}

function removerCampo(button) {
    button.parentElement.remove();
    numEtiquetas--;
}

function buscarProduto(ean, index) {
    const nomeField = document.getElementById(`nome_${index}`);
    if (produtos[ean]) {
        nomeField.value = produtos[ean].descricao;
    } else 

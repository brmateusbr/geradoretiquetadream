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

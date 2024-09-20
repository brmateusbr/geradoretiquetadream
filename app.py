from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

# Função para carregar produtos da planilha
def carregar_produtos():
    url = 'https://docs.google.com/spreadsheets/d/1wO7TRDOSikvVZ2GCjXDSSqXpX8kbhNKXY_0P8jW7GMM/export?format=csv'
    df = pd.read_csv(url)
    df['EAN'] = df['EAN'].astype(str)
    return df.set_index('EAN').to_dict(orient='index')

# Carregar os produtos no início
produtos = carregar_produtos()

# Rota para buscar o nome do produto
@app.route('/buscar', methods=['GET'])
def buscar_produto():
    ean = request.args.get('ean')
    if ean in produtos:
        nome = produtos[ean]['Descrição']
        return jsonify({'nome': nome})
    return jsonify({'nome': None})

# Função para gerar etiquetas
def gerar_etiqueta(produtos):
    etiquetas = ""
    posicoes_x = [33, 315, 595]
    
    for i, (ean, preco, codigo_produto, descricao) in enumerate(produtos):
        posicao_x = posicoes_x[i % 3]
        
        etiquetas += f"""
^CF0,17
^FO{posicao_x},85^BY^BEN,70,10,50^BY2^FD{ean}^FS
^FO{posicao_x - 13},19^A0N,20^FDR$ {preco} - {codigo_produto}^FS
^FO{posicao_x - 13},40^A0N,0^FD- {descricao}^FS
^FO{posicao_x - 13},58^A0N,0^FD{descricao}^FS
"""
    
    return f"^XA\n{etiquetas}^XZ" if produtos else ""

# Rota principal
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        produtos_lista = []
        for i in range(int(request.form['num_etiquetas'])):
            ean = request.form[f'ean_{i}']
            quantidade = int(request.form[f'quantidade_{i}'])
            produto = produtos.get(ean)

            if produto:
                nome = produto['Descrição']
                preco = produto['Preço'].replace(',', '.')
                codigo_produto = produto['Código de Produto']

                produtos_lista.extend([(ean, preco, codigo_produto, nome)] * quantidade)

        etiquetas = gerar_etiqueta(produtos_lista)
        return render_template('index.html', etiquetas=etiquetas)

    return render_template('index.html', etiquetas=None)

if __name__ == '__main__':
    app.run(debug=True)

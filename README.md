# Operação Gaivota

Um pedido de desculpa interativo, desnecessariamente elaborado e preparado para publicação estática na Vercel.

## Personalizar antes de enviar

### 1. Nome

Abre `script.js` e altera:

```js
nome: "",
```

Por exemplo:

```js
nome: "Marta",
```

Deixa vazio para a abertura mostrar apenas “Olá.”

### 2. Fotografia do Becas

O projeto inclui `becas.svg` como marcador temporário.

A forma mais simples é:

1. Adicionar a fotografia à raiz com o nome `becas.jpg`.
2. No `index.html`, substituir `./becas.svg` por `./becas.jpg`.

Recomenda-se uma imagem quadrada ou próxima de quadrada.

### 3. Mensagem copiada

Em `script.js`, altera `respostaCopiada` para a frase que o botão final deve copiar.

O botão apenas copia texto para a área de transferência. Não envia mensagens, não abre sessões e não recolhe dados.

## Publicar na Vercel

1. Importar este repositório na Vercel.
2. Manter o framework como **Other**.
3. Não é necessário comando de build.
4. Publicar.

O endereço sugerido é `operacao-gaivota.vercel.app`, caso esteja disponível.

## Estrutura

- `index.html` — conteúdo e páginas do pedido de desculpa
- `styles.css` — design responsivo
- `script.js` — navegação, escolhas e botão de copiar
- `becas.svg` — fotografia temporária
- `gaivota.svg` — favicon
- `vercel.json` — configuração mínima da Vercel

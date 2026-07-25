# Operação Gaivota

Um pedido de desculpa interativo, desnecessariamente elaborado e preparado para publicação na Vercel.

## O que foi adicionado

A pessoa pode selecionar várias conclusões e uma sentença final. Ao carregar em **“Enviar decisão e continuar”**, o site envia apenas essas escolhas para um webhook privado do Discord.

O webhook nunca é colocado no JavaScript público: fica guardado como variável de ambiente na Vercel.

O envio é informado claramente na página antes do botão. O conteúdo enviado não inclui nome, conta do Instagram, localização ou texto escrito pela visitante.

## Configurar onde recebes as escolhas

### 1. Criar um webhook no Discord

1. Cria ou escolhe um canal privado no teu servidor.
2. Abre as definições do canal.
3. Entra em **Integrações → Webhooks → Novo webhook**.
4. Copia o URL do webhook.

### 2. Adicionar o segredo à Vercel

No projeto da Vercel, abre **Settings → Environment Variables** e adiciona:

```text
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

Aplica a variável a **Production** e volta a fazer deploy.

Opcionalmente, limita os pedidos ao domínio oficial:

```text
ALLOWED_ORIGIN=https://operacao-gaivota.vercel.app
```

Não coloques o URL do webhook no `script.js`, no GitHub ou em qualquer ficheiro público.

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

O projeto já utiliza a fotografia `becas.jpg` existente na raiz. Para a trocar, substitui esse ficheiro por outra imagem com o mesmo nome. Recomenda-se uma imagem quadrada ou próxima de quadrada.

### 3. Mensagem copiada

Em `script.js`, altera `respostaCopiada` para a frase que o botão final deve copiar.

O botão de copiar apenas coloca texto na área de transferência. O envio das escolhas acontece separadamente e só depois de a visitante carregar em **“Enviar decisão e continuar”**.

## Publicar na Vercel

1. Importa este repositório na Vercel.
2. Mantém o framework como **Other**.
3. Não é necessário comando de build.
4. Adiciona a variável `DISCORD_WEBHOOK_URL`.
5. Publica.

## Testar o envio

Depois do deploy:

1. Abre o site.
2. Seleciona algumas conclusões.
3. Escolhe uma sentença final.
4. Carrega em **“Enviar decisão e continuar”**.
5. Confirma que aparece uma mensagem no canal privado do Discord.

Se o webhook não estiver configurado, o site avisa que o envio falhou, mas continua a permitir copiar a resposta final.

## Estrutura

- `index.html` — conteúdo e páginas do pedido de desculpa
- `styles.css` — design responsivo
- `script.js` — navegação, escolhas, envio e botão de copiar
- `api/resposta.js` — função serverless que envia as escolhas ao Discord
- `becas.jpg` — fotografia do Becas
- `gaivota.svg` — favicon
- `vercel.json` — configuração mínima da Vercel

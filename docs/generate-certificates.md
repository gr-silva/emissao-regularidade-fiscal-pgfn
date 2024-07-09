# Emissão de Regularidade Fiscal

## Sobre o projeto

Este projeto consiste na implementação de um sistema que gera certidões de regularidade fiscal para CPFs e CNPJs utilizando `Express.js` e `Puppeteer.js`. O objetivo é automatizar a emissão de certidões de regularidade fiscal através do portal governamental Regularize (https://www.regularize.pgfn.gov.br/).

## Etapas para Emissão

- Acessar o site da PGFN
- Inserir CPF ou CNPJ
- Se a certidão para o CPF ou CNPJ já foi emitida, gerar uma nova certidão
- Salvar o PDF da certidão em uma pasta temporária
- Publicar PDF da certidão
- Retornar JSON com o link para o download

## Funcionalidades

1. Recebimento de Dados;
2. Validação de CPF/CNPJ;
3. Automação da Emissão de Certidões;
4. Armazenamento na S3;
5. Retorno em JSON;
6. Gestão de Erros e Paralelismo

## Utilização do Projeto

1. Inicie o Servidor da API com Express na raiz do projeto.

```bash
cd regularidade-fiscal-pgfn
npm run server
```

2. Envie uma requisição POST para `/gerar-certidoes` com um array de CPFs ou CNPJs no corpo da requisição.

```JavaScript
// Exemplo de requisição

fetch("http://localhost:3000/gerar-certidoes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: ["12345678901", "12345678000199"],
})

```

3. Receba a resposta com o status de cada solicitação, links para download e motivos de erros.

```json
{
  "12345678901": {
    "status": "sucesso",
    "certidao": "https://s3.amazonaws.com/emissao-regularidade-fiscal-pgfn/Certidao-12345678901.pdf",
    "motivo_erro": null
  },
  "12345678000199": {
    "status": "falha",
    "certidao": null,
    "motivo_erro": "CPF ou CNPJ inválido."
  }
}
```

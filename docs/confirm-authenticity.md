# Confirmação de Autenticidade

## Sobre o projeto

Este projeto consiste na implementação de um sistema que confirma a autenticidade das certidões de regularidade fiscal para CPFs e CNPJs utilizando `Express.js` e `Puppeteer.js`. O objetivo é automatizar a validação das certidões de regularidade fiscal através do portal governamental Regularize (https://www.regularize.pgfn.gov.br/).

## Etapas para Confirmação de Autenticidade

- Acessar o site de confirmação de autenticidade da PGFN
- Inserir CPF (caso a certidão foi emitida para um CPF) ou CNPJ (caso a certidão foi emitida para um CNPJ)
- Inserir Código de Controle da certidão
- Inserir Data da Emissão da certidão
- Inserir Hora da Emissão da certidão
- Selecionar Tipo de Certidão como "Negativa"
- Clicar em "Consultar"
- Aguardar retorno da página de resultado
- Retornar JSON com informações de autenticidade

## Funcionalidades

1. Recebimento de Dados;
2. Validação de CPF/CNPJ;
3. Automação da Confirmação de Autenticidade de Certidões;
4. Retorno em JSON;
5. Gestão de Erros e Paralelismo

## Utilização do Projeto

1. Inicie o Servidor da API com Express na raiz do projeto.

```bash
cd regularidade-fiscal-pgfn
npm run server
```

2. Envie uma requisição POST para `/confirmar-autenticidade` com um JSON contendo objetos de CPFs e/ou CNPJs com suas respectivas informações das certidões fiscais.

```JavaScript
// Exemplo de requisição

fetch("http://localhost:3000/confirmar-autenticidade", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: {
    "12345678901": {
      "control_code": "E535.85A3.78B0.7652",
      "date_of_issue": "02/07/2024",
      "issue_time": "10:30:00",
      "type_of_certificate": "Negativa",
    },
    "12345678000199": {
      "control_code": "E535.85A3.78B0.7652",
      "date_of_issue": "01/07/2024",
      "issue_time": "10:45:00",
      "type_of_certificate": "Negativa",
    }
  },
})

```

3. Receba a resposta com o status de cada solicitação, codigos de controle, datas de emissão, horarios de emissão, motivos de erros e observações.

```json
{
  "12345678901": {
    "codigo_controle": "E535.85A3.78B0.7652",
    "data_emissao": "02/07/2024",
    "hora_emissao": "10:30:00",
    "status": "sucesso",
    "motivo_erro": null,
    "observacao": "Certidão Negativa emitida em 02/07/2024, com validade até 29/12/2024."
  },
  "12345678000199": {
    "codigo_controle": "E535.85A3.78B0.7652",
    "data_emissao": "01/07/2024",
    "hora_emissao": "10:45:00",
    "status": "falha",
    "motivo_erro": "CPF ou CNPJ inválido.",
    "observacao": null
  }
}
```

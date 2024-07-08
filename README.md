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

## Estrutura do Projeto

```bash
emissao-regularidade-fiscal-pgfn/
│
├── downloads/ # Diretório temporário para armazenar os PDFs
├── PGFN/ # Diretório que contém funções da automação dentro da PGFN
│ └── AWS/
│   └── s3Client.js # Arquivo contendo funções do Client da S3
│ └── configs/
│   └── selectors/
│     └── index.js/ # Arquivo contendo objeto de seletores do site da PGFN
│   └── general.js/ # Arquivo contendo objetos de configuração do robô
│ └── src/
│   └── index.js/ # Arquivo contendo funções e lógicas do robô
│ └── utils/
│   └── cnpj/
│     └── clear-cnpj-chars.js # Funções de limpeza de caracteres não numéricos do CNPJ
│     └── validate-cnpj.js # Funções de validação de CNPJ
│   └── cpf/
│     └── clear-cpf-chars.js # Funções de limpeza de caracteres não numéricos do CPF
│     └── validate-cpf.js # Funções de validação de CPF
│ └── WebRobot/
│   └── src/
│     └── WebRobot.js # Funções e lógicas abstraídas do Puppeteer
│   └── index.js # Arquivo de inicialização da classe WebRobot
├── src/
│ └── routes
│   └── confirm-certificates.js # Arquivo de rota para confirmar certidões
│   └── generate-certificates.js # Arquivo de rota para gerar certidões
│ └── server.js # Arquivo de inicialização da API do servidor com Express
```

## Instalação

1. Clone o Repositório do Projeto

```bash
git clone https://github.com/gr-silva/emissao-regularidade-fiscal-pgfn
```

2. Instalação das dependências

```bash
cd emissao-regularidade-fiscal-pgfn
npm install
```

## Utilização do Projeto

1. Inicie o Servidor da API com Express

```bash
npm run server
```

2. Envie uma requisição POST para `/gerar-certidoes` com um array de CPFs ou CNPJs no corpo da requisição

```JavaScript
// Exemplo de requisição

fetch("http://localhost:3000/gerar-certidoes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: {
    "documentNumbers": ["12345678901", "12345678000199"]
  },
})

```

3. Receba a resposta com o status de cada solicitação, links para download e motivos de erros

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

## Tarefas

### A Fazer

- [x] Criar estrutura do projeto
- [x] Criar funções utilitárias para validação CNPJ e CPF
- [x] Criar funções utilitárias para limpeza de caracteres não numéricos do CNPJ e CPF
- [x] Mapear seletores do processo
- [x] Criar funcionalidades iniciais do processo
- [ ] Realizar testes e correções de bugs das funcionalidades iniciais do processo
- [x] Criar funções para publicar PDFs
- [ ] Verificar permissões do Bucket S3
- [x] Criar rota para iniciar o processo
- [ ] Atualizar README com informações do processo de Confirmação de Autenticidade

### Próximas Features

- [x] Implementar paralelismo do robô
- [ ] Escrever teste de funções utilitárias
- [ ] Escrever testes das funcionalidades do robô
- [x] Criar processo de confirmação de autenticidade das certidões

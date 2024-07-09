# Regularidade Fiscal PGFN

## Documentação

- [Emissão de Regularidade Fiscal](docs/generate-certificates.md)
- [Confirmação de Autenticidade](docs/confirm-authenticity.md)

## Estrutura do Projeto

```bash
emissao-regularidade-fiscal-pgfn/
│
├── docs/ # Diretório para documentações
│ └── confirm-authenticity.md # Documentação para iniciar a confirmação de autenticidade
│ └── generate-certificates.md # Documentação para iniciar a emissão de certidoes
├── downloads/ # Diretório temporário para armazenar os PDFs
├── PGFN/ # Diretório que contém funções da automação dentro da PGFN
│ └── AWS/
│   └── s3-client.js # Arquivo contendo funções do Client da S3
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
│   └── helpers/
│     └── create-chunk-array.js # Funções de divisão de um array em pedacos
│ └── WebRobot/
│   └── src/
│     └── web-robot.js # Funções e lógicas abstraídas do Puppeteer
│   └── index.js # Arquivo de inicialização da classe WebRobot
├── src/
│ └── configs/
│   └── swagger-config.js # Arquivo de configuração do Swagger
│ └── routes
│   └── confirm-certificates.js # Arquivo de rota para confirmar certidões
│   └── generate-certificates.js # Arquivo de rota para gerar certidões
│ └── server.js # Arquivo de inicialização da API do servidor com Express
├── .env # Arquivo de configuração das variáveis de ambiente
├── package.json # Arquivo de configuração do projeto
├── package-lock.json # Arquivo de configuração do projeto
└── README.md # Documentação geral do projeto

```

## Instalação

1. Clone o Repositório do Projeto

```bash
git clone https://github.com/gr-silva/regularidade-fiscal-pgfn
```

2. Instalação das dependências

```bash
cd regularidade-fiscal-pgfn
npm install
```

## Tarefas

### A Fazer

- [x] Criar estrutura do projeto
- [x] Criar funções utilitárias para validação CNPJ e CPF
- [x] Criar funções utilitárias para limpeza de caracteres não numéricos do CNPJ e CPF
- [x] Mapear seletores do processo
- [x] Criar funcionalidades iniciais do processo
- [x] Realizar testes e correções de bugs das funcionalidades iniciais do processo
- [x] Criar funções para publicar PDFs
- [x] Verificar permissões do Bucket S3
- [x] Criar rota para iniciar o processo
- [x] Implementar paralelismo do robô
- [x] Criar processo de confirmação de autenticidade das certidões
- [x] Realizar testes e correções de bugs das funcionalidades iniciais do processo de autenticidade
- [x] Documentar APIs
- [ ] Atualizar README com informações do processo de Confirmação de Autenticidade

### Requisitos do Projeto

- [x] Receber array de CPF/CNPJ
- [x] Validar CPF/CNPJ recebido
- [x] Realizar processamento do CPF/CNPJ
- [x] Publicar PDF da certidão e deixar acessível com link para download
- [x] Retornar JSON com corpo da requisição
- [x] Gestão de erros
- [x] Implementar Paralelismo
- [x] Documentação do Código
- [x] Publicar no GitHub
- [x] Endpoint para confirmar autenticidade
- [x] Criar a automação de confirmar autenticidade
- [x] Levantar os requisitos
- [x] Documentar endpoint

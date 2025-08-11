# API de Backend do Spotify

Um serviço backend em Node.js que fornece autenticação OAuth do Spotify e dados musicais por meio de endpoints RESTful.

# Deploy

https://spotify-backend-psi.vercel.app/

## Sonar

https://sonarcloud.io/project/overview?id=pefelippe_spotify-backend

![Visão Geral da API](api-overview.jpg)

## 🚀 Recursos

- **Integração com Spotify OAuth** - Autenticação segura com a API do Spotify
- **API RESTful** - Endpoints limpos e padronizados para fácil integração
- **TypeScript** - Tipagem completa e recursos modernos do JavaScript
- **Testes Abrangentes** - Cobertura de testes unitários, integração e E2E
- **Qualidade de Código** - Integração com ESLint, Prettier e SonarQube
- **Suporte a Docker** - Pronto para implantação containerizada

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta de Desenvolvedor do Spotify
- Credenciais do App do Spotify

## 🛠️ Instalação

1. **Clone o repositório**

   ```bash
   git clone <repository-url>
   cd spotify-backend
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configuração de Ambiente**
   Crie um arquivo `.env.local` com suas credenciais do Spotify:

   ```env
   SPOTIFY_CLIENT_ID=seu_client_id_spotify
   SPOTIFY_CLIENT_SECRET=seu_client_secret_spotify
   SPOTIFY_REDIRECT_URI=url-do-frontend/auth/callback
   ```

4. **Executar Script de Setup**
   ```bash
   npm run setup
   ```

## 🚀 Uso

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

### Testes

```bash
# Executar todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Testes E2E
npm run test:e2e

# Modo watch
npm run test:watch

# Relatório de cobertura
npm run test:coverage
```

## 📡 Endpoints da API

| Método | Endpoint         | Descrição                    |
| ------ | ---------------- | ---------------------------- |
| `GET`  | `/health`        | Verificação de status da API |
| `GET`  | `/auth/login`    | Login OAuth do Spotify       |
| `GET`  | `/auth/callback` | Callback OAuth do Spotify    |
| `POST` | `/auth/refresh`  | Renovação de token de acesso |

## 🏗️ Estrutura do Projeto

```
src/
├── config/          # Arquivos de configuração
├── controllers/     # Handlers das requisições
├── middleware/      # Middlewares do Express
├── routes/          # Definições de rotas da API
├── services/        # Regras de negócio
├── types/           # Definições de tipos TypeScript
└── utils/           # Funções utilitárias
```

## 🧪 Testes

O projeto inclui testes abrangentes com Jest:

- **Testes Unitários**: Teste de componentes individuais
- **Testes de Integração**: Teste dos endpoints da API
- **Testes E2E**: Teste do fluxo completo
- **Cobertura de Testes**: Relatórios detalhados de cobertura

## 🔧 Ferramentas de Desenvolvimento

- **ESLint** - Linting e padronização de código
- **Prettier** - Formatação de código
- **Husky** - Hooks do Git para garantia de qualidade
- **SonarQube** - Análise de qualidade de código

## 🐳 Docker

Build e execução com Docker:

```bash
# Build da imagem
docker build -t spotify-backend .

# Executar o container
docker run -p 3000:3000 spotify-backend
```

## 📝 Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia o servidor em produção
- `npm run test` - Executa todos os testes
- `npm run lint` - Verifica a qualidade do código
- `npm run format` - Formata o código com Prettier

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma branch de feature
3. Faça suas alterações
4. Execute os testes e o lint
5. Envie um pull request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

## 🔗 Links

- [Documentação do Spotify Developer](https://developer.spotify.com/documentation)
- [Documentação do Express.js](https://expressjs.com/)
- [Documentação do TypeScript](https://www.typescriptlang.org/)

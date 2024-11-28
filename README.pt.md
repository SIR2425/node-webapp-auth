> this file in english [file in english](./README.md)
# Aplicação Web: Implementação Progressiva de Autenticação e Segurança

Este repositório documenta a implementação progressiva de mecanismos de autenticação e segurança numa aplicação Node.js ao longo de várias versões. Cada versão adiciona melhorias incrementais para reforçar a segurança, desde a autenticação básica até à integração com bases de dados e gestão de sessões.

## Progresso por Versão

### Versão 1: Autenticação Básica com Cookies
- **Ficheiro:** `app_v_1.js`
- **Descrição:**
  - Introduziu a autenticação básica de utilizadores utilizando cookies não encriptados.
  - Os utilizadores são adicionados manualmente a um `Set` após o login com sucesso.
  - Rotas:
    - `/login`: Define um cookie para autenticação.
    - `/logout`: Limpa o cookie de autenticação.
    - `/protected`: Valida o cookie para permitir o acesso.
- **Limitações:**
  - Os cookies não são encriptados.
  - As credenciais dos utilizadores estão hardcoded e armazenadas em texto simples.
  - Não há proteção contra manipulação de cookies.

---

### Versão 2: Cookies Assinados para Garantir Integridade
- **Ficheiro:** `app_v_2.js`
- **Descrição:**
  - Atualizou para cookies assinados para prevenir manipulações.
  - Introduziu uma chave secreta para assinar os cookies.
  - As rotas permanecem iguais às da Versão 1.
- **Melhorias:**
  - Os cookies assinados garantem a integridade dos dados.
  - Proteção melhorada contra manipulação de cookies.
- **Limitações:**
  - Ainda utiliza palavras-passe em texto simples.
  - Não há encriptação para os dados dos cookies.

---

### Versão 2.X: Cookies Encriptados
- **Ficheiro:** `app_v_2_X.js`
- **Descrição:**
  - Adicionada encriptação aos cookies para maior confidencialidade.
  - Foram implementadas funções para encriptar e desencriptar valores de cookies.
- **Melhorias:**
  - Previne a exposição de dados sensíveis em cookies.
- **Limitações:**
  - A encriptação dos cookies é redundante se HTTPS for implementado.
  - Continua a depender de palavras-passe em texto simples.

---

### Versão 3: Limitação de Taxas e Helmet
- **Ficheiro:** `app_v_3.js`
- **Descrição:**
  - Adicionada limitação de taxas em tentativas de login usando `express-rate-limit`.
  - Adicionado o `helmet` para proteger cabeçalhos HTTP.
- **Melhorias:**
  - Mitiga ataques de força bruta com limitação de tentativas de login.
  - Protege contra vulnerabilidades comuns na web (e.g., XSS) através de cabeçalhos HTTP.
- **Limitações:**
  - Não há hashing de palavras-passe; estas continuam em texto simples.

---

### Versão 4: Hashing de Palavras-passe
- **Ficheiro:** `app_v_4.js`
- **Descrição:**
  - As palavras-passe são encriptadas com `bcryptjs` antes de serem armazenadas.
  - A autenticação compara agora a palavra-passe encriptada.
- **Melhorias:**
  - Armazenamento seguro de palavras-passe dos utilizadores.
- **Limitações:**
  - Os utilizadores ainda estão hardcoded.
  - Não há integração com armazenamento externo ou bases de dados.

---

### Versão 5: Variáveis de Ambiente
- **Ficheiro:** `app_v_5.js`
- **Descrição:**
  - Introduzido ficheiro `.env` para gerir configurações sensíveis (e.g., chaves secretas).
  - As limitações de taxa e os segredos dos cookies são configuráveis através de variáveis de ambiente.
- **Melhorias:**
  - Gestão mais simples de configurações da aplicação.
  - Reduz o risco de expor segredos no código-fonte.
- **Limitações:**
  - Ainda não há integração com bases de dados para gestão dinâmica de utilizadores.

---

### Versão 6: Integração com Base de Dados
- **Ficheiro:** `app_v_6.js`
- **Descrição:**
  - Integrada base de dados MongoDB para armazenamento dinâmico de utilizadores.
  - Adicionada rota de registo (`/register`) para criação de novos utilizadores.
  - As credenciais dos utilizadores são encriptadas e armazenadas na base de dados.
- **Melhorias:**
  - Gestão dinâmica de utilizadores através do MongoDB.
  - Armazenamento centralizado para melhor escalabilidade.
- **Limitações:**
  - Usa autenticação baseada em cookies, que pode ser melhorada com sessões.

---

### Versão 7: Gestão de Sessões
- **Ficheiro:** `app_v_7.js`
- **Descrição:**
  - Introduzida autenticação baseada em sessões com `express-session`.
  - Substituída autenticação baseada em cookies por armazenamento em sessões.
- **Melhorias:**
  - As sessões oferecem gestão de autenticação mais segura e escalável.
  - Reduz a dependência de cookies do lado do cliente para armazenar informações sensíveis.
- **Limitações:**
  - Requer melhorias adicionais para gestão de sessões distribuídas (e.g., Redis).

---

## Como Usar
### Dependências
1. Instale as dependências:

```bash
   npm install
```

### Ficheiro .env
A partir da versão 5, crie um ficheiro `.env` com as configurações necessárias (consulte `app_v_5.js` para detalhes).

### Base de Dados
A partir da versão 6, garanta que um servidor MongoDB está em execução.

### Executar o Servidor
```bash
node app_v_7.js
```
### utilizar a web app
Acesse a aplicação em http://localhost:3000.

### rotas implementadas (resumo)
| **Rota**      | **Descrição**                                        | **Acessibilidade** | **Requer Autenticação** |
|---------------|------------------------------------------------------|---------------------|--------------------------|
| `/`           | Rota raiz com mensagem de boas-vindas básica.        | Pública             | Não                      |
| `/login`      | Login do utilizador. Redireciona para `/protected`.  | Pública             | Não                      |
| `/logout`     | Faz logout e redireciona para a página de login.     | Restrita            | Sim                      |
| `/register`   | Registo de novos utilizadores.                       | Pública             | Não (restrito na v7)     |
| `/protected`  | Rota segura acessível apenas a utilizadores com login. | Restrita            | Sim                      |



### Trabalho Futuro (Possível)
* Implementar autenticação baseada em tokens (e.g., JWT) para APIs sem estado.
* Adicionar autenticação multifatorial (MFA) para segurança reforçada.
* Integrar armazenamento de sessões distribuídas com Redis ou Memcached.
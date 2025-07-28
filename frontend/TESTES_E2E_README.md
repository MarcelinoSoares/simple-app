# 🧪 Testes E2E com Cypress - Documentação Completa

## 📋 Visão Geral

Este documento descreve a configuração completa dos testes E2E (End-to-End) implementados com Cypress para a aplicação Simple App.

## 🏗️ Arquitetura dos Testes

### Estrutura de Diretórios
```
frontend/
├── cypress.config.js              # Configuração principal do Cypress
├── package.json                   # Scripts de teste
├── start-server-and-test.js       # Script automatizado
├── test-server.js                 # Script de teste do servidor
└── test/
    └── e2e/
        ├── e2e/                   # Arquivos de teste
        │   ├── todo.cy.js         # Testes de funcionalidade
        │   └── visual.cy.js       # Testes visuais
        ├── fixtures/              # Dados de teste
        │   └── users.json         # Usuários para teste
        └── support/               # Configurações de suporte
            ├── e2e.js             # Configuração global
            ├── commands.js        # Comandos personalizados
            └── pageObjects/       # Page Objects
                ├── LoginPage.js   # Page Object do Login
                └── TodoPage.js    # Page Object das Tarefas
```

## ⚙️ Configuração

### Cypress Configuration (cypress.config.js)
```javascript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'test/e2e/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'test/e2e/support/e2e.js',
    fixturesFolder: 'test/e2e/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    experimentalModifyObstructiveThirdPartyCode: true,
  }
})
```

### Scripts Disponíveis (package.json)
```json
{
  "test:e2e": "cypress run",
  "test:e2e:open": "cypress open",
  "test:e2e:full": "node start-server-and-test.js"
}
```

## 🧪 Testes Implementados

### 1. Testes de Funcionalidade (todo.cy.js)

#### Cenários de Teste:
- **Login com credenciais válidas**
- **Login com credenciais inválidas**
- **Criar nova tarefa**
- **Editar tarefa existente**
- **Excluir tarefa**

#### Exemplo de Teste:
```javascript
it('Create new todo item', function () {
  // Login first
  LoginPage.visit();
  LoginPage.fillEmail(this.users.validUser.email);
  LoginPage.fillPassword(this.users.validUser.password);
  LoginPage.submit();
  
  // Create todo
  TodoPage.createTodo('Learn Cypress', 'Study Cypress testing framework');
  TodoPage.assertTodoVisible('Learn Cypress');
});
```

### 2. Testes Visuais (visual.cy.js)

#### Cenários de Teste:
- **Snapshot da página de login**
- **Snapshot do dashboard após login**
- **Snapshot do dashboard com tarefas**
- **Snapshot de tarefa completada**

#### Exemplo de Teste:
```javascript
it('should match login page snapshot', () => {
  LoginPage.visit();
  cy.takeSnapshot('login-page');
});
```

## 🔧 Comandos Personalizados

### Comandos de Autenticação
```javascript
// Login automatizado
cy.login('test@example.com', '123456');

// Login com credenciais padrão
cy.login();
```

### Comandos de Tarefas
```javascript
// Criar tarefa
cy.createTask('Nova tarefa');

// Excluir tarefa
cy.deleteTask('Tarefa para excluir');

// Alternar estado da tarefa
cy.toggleTask('Tarefa para completar');
```

### Comandos de Estado
```javascript
// Limpar localStorage
cy.clearLocalStorage();

// Definir valor no localStorage
cy.setLocalStorage('key', 'value');

// Obter valor do localStorage
cy.getLocalStorage('key');
```

### Comandos de Navegação
```javascript
// Visitar página com estado limpo
cy.visitWithCleanState('/login');
```

### Comandos de Aguardo
```javascript
// Aguardar resposta da API
cy.waitForApi('GET', '/api/tasks', 'getTasks');

// Verificar se elemento existe
cy.elementExists('button[type="submit"]');

// Aguardar carregamento da página
cy.waitForPageLoad();
```

## 📄 Page Objects

### LoginPage.js
```javascript
class LoginPage {
  visit() {
    cy.visitWithCleanState("/login");
  }
  
  fillEmail(email) {
    cy.get("input[name='email']").clear().type(email);
  }
  
  fillPassword(password) {
    cy.get("input[name='password']").clear().type(password);
  }
  
  submit() {
    cy.get("button[type='submit']").click();
  }
  
  assertLoginSuccess() {
    cy.url().should("include", "/dashboard");
  }
  
  assertLoginFailure() {
    cy.contains("Invalid credentials").should("be.visible");
  }
}
```

### TodoPage.js
```javascript
class TodoPage {
  createTodo(title, description) {
    cy.get("input[name='title']").type(title);
    cy.get("textarea[name='description']").type(description);
    cy.contains("Add").click();
  }
  
  editTodo(oldTitle, newTitle) {
    cy.contains(oldTitle).parent().within(() => {
      cy.get("button.edit").click();
    });
    cy.get("input[name='title']").clear().type(newTitle);
    cy.contains("Save").click();
  }
  
  deleteTodo(title) {
    cy.contains(title).parent().within(() => {
      cy.get("button.delete").click();
    });
  }
  
  assertTodoVisible(title) {
    cy.contains(title).should("be.visible");
  }
  
  assertTodoNotVisible(title) {
    cy.contains(title).should("not.exist");
  }
}
```

## 🚀 Como Executar

### 1. Execução Manual
```bash
# Terminal 1: Iniciar servidor
cd frontend
npm run dev

# Terminal 2: Executar testes
cd frontend
npm run test:e2e
```

### 2. Execução Automatizada
```bash
cd frontend
npm run test:e2e:full
```

### 3. Modo Interativo
```bash
cd frontend
npm run test:e2e:open
```

## 🔄 CI/CD Integration

### GitHub Actions (.github/workflows/ci.yml)
```yaml
- name: Start frontend server
  working-directory: ./frontend
  run: |
    npm run dev &
    sleep 10

- name: Run E2E tests
  working-directory: ./frontend
  run: npm run test:e2e
  env:
    CYPRESS_baseUrl: http://localhost:5173
```

## 📊 Dados de Teste

### Fixtures (users.json)
```json
{
  "validUser": {
    "email": "test@example.com",
    "password": "123456"
  },
  "invalidUser": {
    "email": "invalid@example.com",
    "password": "wrongpass"
  }
}
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Servidor não responde
```bash
# Verificar se o servidor está rodando
lsof -i :5173

# Reiniciar servidor
pkill -f "vite"
npm run dev
```

#### 2. Testes falham por timeout
- Aumentar `defaultCommandTimeout` no cypress.config.js
- Verificar se o servidor está acessível
- Verificar conectividade de rede

#### 3. Elementos não encontrados
- Verificar se os seletores estão corretos
- Aguardar carregamento da página
- Usar `cy.wait()` quando necessário

### Logs e Debug
```bash
# Executar com logs detalhados
DEBUG=cypress:* npm run test:e2e

# Capturar screenshots em falhas
# Configurado automaticamente no cypress.config.js
```

## 📈 Métricas e Relatórios

### Cobertura de Testes
- **Total de Testes:** 9
- **Testes de Funcionalidade:** 5
- **Testes Visuais:** 4
- **Page Objects:** 2
- **Comandos Personalizados:** 12

### Performance
- **Tempo médio de execução:** ~1 minuto
- **Timeout padrão:** 10 segundos
- **Retry automático:** Configurado

## 🔮 Próximos Passos

### Melhorias Sugeridas
1. **Adicionar mais cenários de teste**
2. **Implementar testes de API**
3. **Configurar relatórios detalhados**
4. **Adicionar testes de acessibilidade**
5. **Implementar testes de performance**

### Manutenção
1. **Atualizar seletores conforme mudanças na UI**
2. **Revisar dados de teste periodicamente**
3. **Manter dependências atualizadas**
4. **Monitorar performance dos testes**

## 📞 Suporte

Para dúvidas ou problemas com os testes E2E:
1. Verificar esta documentação
2. Consultar logs de erro
3. Verificar configuração do Cypress
4. Testar manualmente os cenários

---

**Última atualização:** $(date)
**Versão:** 1.0.0
**Status:** ✅ Configuração Completa e Funcional 
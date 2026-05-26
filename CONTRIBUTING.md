# Como Contribuir - Seu Passaporte de Entrada

Estamos felizes em receber você aqui e saber que está interessado em contribuir para o nosso projeto. Como um projeto de código aberto, cada contribuição é valorizada e ajuda a impulsionar o crescimento e a qualidade do nosso trabalho. Este guia foi criado para orientá-lo sobre como você pode participar e fazer parte da nossa comunidade de desenvolvimento. Estamos ansiosos para ver suas contribuições e trabalhar juntos para tornar nosso projeto ainda melhor!

## Código de Conduta

Para garantir um ambiente respeitável e inclusivo, leia e siga nosso [Código de Conduta](./CODE_OF_CONDUCT.md).

## Começando a Contribuir

Contribuir para o nosso projeto é fácil e estamos ansiosos para receber suas contribuições! Antes de entrarmos nos passos para instalação da aplicação, você precisará configurar algumas ferramentas e preparar seu ambiente de desenvolvimento.

Aqui está o que você precisa:

-   Uma conta no [GitHub](https://github.com/).
-   O *version control system* [Git](https://git-scm.com/) instalado.
-   Um IDE para o desenvolvimento. Recomendamos o [Visual Studio Code](https://code.visualstudio.com).
-   O [Node.js v22.11.0](https://nodejs.org/en) ou superior.
-   Java [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html).
-   [Android Studio](https://developer.android.com/studio?hl=pt-br)

## Instalação

### 1. Clonar o Repositório

O primeiro passo é clonar o repositório do projeto para o seu ambiente local.

1.  Abra um terminal.

2.  Execute o seguinte comando para clonar o repositório:
    ```bash
    git clone https://github.com/Bug-Busters-F/ProDesk-appMobile
    ```

3.  Navegue até o diretório do projeto:
    ```bash
    cd ProDesk-appMobile\\frontend
    ```

### 2. Instalar Dependências e Variáveis de Ambiente

Com o ambiente configurado, basta instalar as dependências:

 ```sh
 npm install
 ```

### 3. Rodar o Projeto

Execute a aplicação em modo de desenvolvimento:

```sh
npx expo start
```

### (OPCIONAL)
### 4. Gerando o APK (Build)

O APK precisa de uma URL pública para acessar o backend, já que o endereço local (`localhost`) não é acessível fora da máquina.

1. Acesse dashboard.ngrok.com/signup e crie sua conta.

2. Acesse dashboard.ngrok.com/get-started/your-authtoken e copie seu token.

3. Salve o token localmente. Isso só precisa ser feito uma vez.

```typescript
npx ngrok config add-authtoken <SEU_TOKEN_AQUI>
```

4. Inicie o ngrok apontando para a porta do backend:

```typescript
npx ngrok http 3000
```

5. Copie a URL gerada e atualize o arquivo `frontend/services/api.ts`.

```typescript
// baseURL: Platform.OS === 'android' ? 'http://10.0.2.2:3000/ProDeskApi' : 'http://localhost:3000/ProDeskApi'
baseURL: 'https://URL_DO_NGROK/ProDeskApi'
```

Observação: A URL do ngrok muda toda vez que a sessão é reiniciada. Sempre gere um novo APK após reiniciar o ngrok.

### Abra outro terminal
6. Faça login com a conta da equipe:

```bash
eas login
```

7. Com o backend rodando e o ngrok ativo, execute:

```bash
npm run android-build
```

Após a build finalizar, o QR code e o link para download do APK estará disponível no terminal e no painel do [EAS](https://expo.dev).
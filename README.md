# MOBILE 009 - Avisos em Tempo Real

Atividade de desenvolvimento mobile de **Hugo Oliveira da Silva e Eloá Khadijah Silva Amâncio de Souza - 3º AMS-DS**, baseada no material MOBILE_009, do Prof. Maromo.

App Expo/React Native para enviar avisos ao Supabase e receber novas inserções em tempo real, usando `Alert.alert` com o aplicativo aberto.

## Funcionalidades

- Formulário com título e mensagem e validação de campos vazios.
- Inserção na tabela `public.notifications`.
- Escuta de eventos `INSERT` usando Supabase Realtime.
- Alerta na tela dos aplicativos abertos e conectados ao mesmo banco.
- Indicador de conexão, carregamento e mensagens de erro.
- Remoção da assinatura Realtime ao desmontar a tela.

## Executar o projeto pronto

O Supabase desta atividade já está criado e configurado na organização **Holiveira0x**. A tabela `notifications`, o RLS e o Realtime estão ativos. A URL e a chave **publishable pública** ficam em `src/config/supabase.json`; não é necessário criar `.env` para usar este banco.

```bash
git clone https://github.com/HugoOliveira0/Mobile-009-Notificacoes.git
cd Mobile-009-Notificacoes
npm ci
npm start
```

Abra o Expo Go no celular e escaneie o QR Code. Use Expo Go compatível com o **SDK 58**. Se a rede local bloquear o acesso ao computador, rode `npm run start:tunnel`.

## Preparar outro Supabase (opcional)

1. Crie ou escolha um projeto dedicado à atividade.
2. Abra **SQL Editor**, copie o conteúdo de [`supabase/setup.sql`](supabase/setup.sql) e execute.
3. Confirme no Table Editor a tabela `notifications`, com `id`, `title`, `body` e `created_at`.
4. Confirme em Publications que a tabela está na publicação `supabase_realtime`.
5. Em **Project Settings > API** (ou **Connect**), copie a URL do projeto e a chave pública `anon` ou publishable. **Não use a chave `service_role` nem uma chave secreta.**

O SQL mantém o acesso público aos avisos da aula com RLS habilitado, limitado a **SELECT e INSERT**. Clientes do aplicativo não podem alterar ou apagar registros. O título aceita até 120 caracteres e a mensagem até 2.000; campos em branco são rejeitados também no banco. Utilize dados fictícios; em um sistema real, implemente autenticação e políticas por usuário ou perfil.

## Executar no celular

Requisitos: Node.js LTS compatível com o SDK Expo do projeto, npm e Expo Go atualizado no celular.

```bash
npm ci
```

Somente para conectar outro banco, copie `.env.example` para `.env` na raiz (no Windows, `copy .env.example .env`; no macOS/Linux, `cp .env.example .env`) e preencha:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

Depois, inicie o Expo:

```bash
npm start
```

Escaneie o QR Code no Expo Go. Se a rede bloquear a conexão local, use o comando da aula:

```bash
npm run start:tunnel
```

O Expo poderá solicitar a instalação do pacote de túnel `@expo/ngrok`. Após modificar o `.env`, reinicie o Expo e recarregue o aplicativo.

## Teste da atividade

1. Abra o app em dois celulares apontando para o mesmo projeto Supabase.
2. Aguarde o status **Conectado e escutando avisos** nos dois.
3. Em um celular, preencha `Mudança de sala` e `A próxima aula será no laboratório 2.` e toque em **DISPARAR ALERTA**.
4. Confira o registro na tabela e o alerta com título e mensagem no outro celular.
5. Insira outro registro pelo Table Editor para confirmar o alerta em ambos, sem atualizar a tela.
6. Teste os campos vazios e uma falha de conexão.

O remetente também escuta os eventos do banco. O app não busca avisos antigos: recebe apenas novas inserções enquanto estiver conectado.

## Estrutura da aula

```text
App.js
src/
  services/supabase.js
  helper/notificationsHelper.js
supabase/setup.sql
.env.example
```

O PDF contém um slide de teste que menciona permissões, vibração e push. A implementação e o resumo final da própria aula usam **alertas internos**, sem push, vibração ou execução em segundo plano. Este projeto segue esse código: não é necessário instalar `expo-notifications` nem pedir permissão ao sistema. As funções do helper mantêm os nomes utilizados pelo professor.

A interface e os três arquivos principais seguem a aula. Foram adicionados configuração pública pronta com sobrescrita opcional por `.env`, tratamento de falhas e proteção contra envio duplicado por toque rápido. As permissões de banco foram limitadas a ler/enviar, pois a atividade não precisa editar/apagar avisos.

## Verificações locais

```bash
npm run lint
npm run typecheck
npx expo-doctor
npx expo export --platform android
```

A exportação do JavaScript não gera APK. Os alertas nativos devem ser conferidos no Expo Go em um celular; o teste entre clientes descrito abaixo valida o backend e o recebimento pelo SDK.

### Resultado da validação

- Lint e checagem de tipos passaram.
- Exportação do bundle Android concluída.
- Um envio real pela chave publishable foi salvo no banco e recebido por dois clientes conectados ao Supabase Realtime, incluindo o remetente.
- A leitura do registro retornou o título e o conteúdo esperados.
- O banco rejeitou título em branco e impediu UPDATE e DELETE anônimos.
- RLS ativo e tabela incluída na publicação `supabase_realtime`.
- O verificador de segurança do Supabase não apontou alertas.

O teste de integração usa o mesmo SDK e backend do aplicativo. A caixa de alerta nativa ainda requer conferência no Expo Go em um aparelho Android/iOS.

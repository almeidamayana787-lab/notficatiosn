# Nubank (timer de notificação local)

App Expo (React Native) para agendar notificações locais em segundos.

## Desenvolvimento

```bash
npm install
npx expo start
```

Abra no **Expo Go** (SDK alinhado ao `package.json`).

## Build .ipa no GitHub Actions (macOS + Xcode, sem EAS)

O workflow **iOS IPA (GitHub macOS + Xcode)** usa os **runners `macos-14`** do GitHub com **Xcode**: `expo prebuild`, CocoaPods e `xcodebuild` para gerar o **`.ipa`**. **Não usa** Expo EAS nem token da Expo.

Para instalar em **iPhone físico**, a Apple exige **assinatura**. Configure estes **Secrets** no repositório (*Settings → Secrets and variables → Actions*):

| Secret | Descrição |
|--------|-----------|
| `APPLE_TEAM_ID` | Team ID (10 caracteres) em [developer.apple.com](https://developer.apple.com) |
| `IOS_CERTIFICATE_BASE64` | Certificado de distribuição ou desenvolvimento **.p12** em Base64 |
| `IOS_CERTIFICATE_PASSWORD` | Senha do .p12 |
| `IOS_PROVISION_PROFILE_BASE64` | Arquivo **.mobileprovision** (mesmo Bundle ID `com.nubanktestios.com`) em Base64 |
| `KEYCHAIN_PASSWORD` | Senha qualquer para o keychain temporário no CI (ex.: string aleatória longa) |

**Gerar Base64 no terminal (Linux/macOS):**

```bash
base64 -w0 certificado.p12
base64 -w0 perfil.mobileprovision
```

Depois: **Actions → iOS IPA (GitHub macOS + Xcode) → Run workflow**. O artefato **nubank-ios-ipa** contém `Nubank.ipa`.

> **Nota:** Runners macOS consomem minutos de Actions (fator 10× em relação ao Linux no plano pago). Repositórios públicos têm minutos gratuitos com limites.

## Sideloady

Com o `.ipa` já assinado (como neste fluxo), você pode instalar no dispositivo conforme seu fluxo habitual; o Sideloady costuma ser usado para reinstalar ou contas de desenvolvimento.

## CI (TypeScript)

O workflow **CI** roda `npm ci` e `tsc` em Ubuntu a cada push na `main`.

# Nubank (timer de notificação local)

App Expo (React Native) para agendar notificações locais em segundos.

## Desenvolvimento

```bash
npm install
npx expo start
```

Abra no **Expo Go** (SDK alinhado ao `package.json`).

### Importante: dois workflows diferentes

| Workflow | O que faz | Gera `.ipa`? |
|----------|-----------|----------------|
| **Typecheck** | Ubuntu: `npm ci` + `tsc` (roda em **todo push** na `main`) | **Não** — só valida TypeScript |
| **iOS IPA (GitHub macOS + Xcode)** | macOS: `expo prebuild` + Xcode | **Sim** (artefato **nubank-ios-ipa**), se você **disparar manualmente** |

Se o push ficou “verde” mas você não vê `.ipa`, você olhou o log do **Typecheck**. O `.ipa` só aparece no job **iOS IPA**, em **Actions → escolher esse workflow → Run workflow**.

## Build .ipa no GitHub Actions (macOS + Xcode, sem EAS)

O workflow **iOS IPA (GitHub macOS + Xcode)** roda em **`macos-15`** (Xcode **16.1+**, exigido pelo React Native / Expo 54). Faz `expo prebuild`, CocoaPods e `xcodebuild` **sem assinatura** no CI. **Não** usa Expo EAS, **não** usa token da Expo e **não** exige secrets Apple no repositório.

1. **Actions** → **iOS IPA (GitHub macOS + Xcode)** → **Run workflow**
2. Baixe o artefato **nubank-ios-ipa** (`Nubank.ipa`)
3. No seu computador, abra o `.ipa` no **Sideloadly**, faça login com sua **Apple ID** e instale no iPhone (a assinatura é feita aí)

### Limitações do Xcode

Em alguns runners/versões do Xcode, build **sem** certificado pode falhar. Nesse caso o job falha e pode ser gerado o artefato **ios-build-logs** com trechos de log para análise. Se precisar, gere o projeto com `npx expo prebuild` no Mac e arquive/exporte pelo Xcode, ou ajuste o scheme em [`.github/workflows/ios-ipa-macos.yml`](.github/workflows/ios-ipa-macos.yml) (`WORKSPACE` / `SCHEME`).

> Runners macOS consomem mais minutos de Actions que Linux (fator 10× em planos pagos). Repositórios públicos têm cota gratuita com limites.

## Typecheck (TypeScript)

O workflow **Typecheck** roda `npm ci` e `tsc` em Ubuntu a cada push na `main`. É independente do build iOS.

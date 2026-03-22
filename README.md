# Nubank (timer de notificação local)

App Expo (React Native) para agendar notificações locais em segundos.

## Desenvolvimento

```bash
npm install
npx expo start
```

Abra no **Expo Go** (SDK alinhado ao `package.json`).

## EAS (build .ipa) — primeira vez

1. Conta em [expo.dev](https://expo.dev).
2. No projeto:

   ```bash
   npx eas init
   ```

   Isso adiciona `expo.extra.eas.projectId` no `app.json` / `app.config` — **commit esse arquivo**.

3. Configure credenciais Apple no painel EAS ou com `eas credentials` (assinatura do iOS).

4. **GitHub:** em *Settings → Secrets and variables → Actions*, crie `EXPO_TOKEN` com um [access token](https://expo.dev/accounts/~/settings/access-tokens) da Expo.

5. Rode o workflow **EAS iOS IPA** em *Actions* (manual). O artefato **nubank-ios-ipa** contém `Nubank.ipa`.

O perfil usado é `preview` (`distribution: internal` no `eas.json`). Ajuste perfis em `eas.json` se precisar de App Store / TestFlight.

## Sideloady

O IPA do EAS já vem assinado; use Sideloady para instalar no dispositivo quando fizer sentido para testes locais. Para publicação na App Store, use fluxo EAS Submit / TestFlight.

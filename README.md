# Base44 App

## Dokumentacja dla developerów

- Pełna mapa plików i opis platform: `docs/DEVELOPER_DOCUMENTATION.md`
- Setup Supabase i RLS: `docs/SUPABASE_SETUP.md`
- Raport spójności architektury: `docs/ARCHITECTURE_CONSISTENCY_CHECK.md`

## Stripe (subskrypcje)

Aplikacja ma wdrożoną bramkę Stripe dla planów subskrypcyjnych.

### Wymagane sekrety funkcji

Ustaw w środowisku funkcji:

- `STRIPE_SECRET_KEY` (`sk_test_...` / `sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
- `APP_URL` (opcjonalne; fallback dla URL sukcesu/anulowania)

> Nigdy nie zapisuj kluczy Stripe bezpośrednio w repozytorium. Jeśli klucz został ujawniony, zrotuj go w Stripe Dashboard.

### Skąd wziąć `STRIPE_WEBHOOK_SECRET`

1. Stripe Dashboard → **Developers** → **Webhooks**.
2. **Add endpoint** i podaj URL funkcji `stripeWebhook`.
3. Wybierz eventy:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Otwórz endpoint i kliknij **Reveal** przy **Signing secret**.
5. Skopiuj wartość `whsec_...` do `STRIPE_WEBHOOK_SECRET`.

### Przepływ płatności

1. Frontend (`/subscription`) wywołuje funkcję `createCheckoutSession`.
2. Funkcja tworzy/odczytuje klienta Stripe i checkout session (`mode: subscription`).
3. Użytkownik wraca na `/subscription?payment=success|cancelled`.
4. Stripe wysyła webhook do `stripeWebhook`, gdzie podpis jest weryfikowany przez `STRIPE_WEBHOOK_SECRET`.
5. Profil użytkownika jest aktualizowany (`subscription_tier`, `subscription_expiry_date`).

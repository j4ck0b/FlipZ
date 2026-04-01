# Weryfikacja zgodności struktury FlipCardZ z aktualnym repo

## Zakres sprawdzenia
Porównano opis przekazany przez użytkownika z aktualnym kodem aplikacji (`src/`, `functions/`, konfiguracja routingu).

## 1) Strony (Pages)

### ✅ Zgodne / obecne
- Publiczne strony: `/`, `/login`, `/auth/callback`.
- Chronione strony: `/home`, `/card-exchange`, `/brick-exchange`, `/diecast-exchange`, `/figure-exchange`, `/collectible-exchange`, `/profile/:userId?`, `/messages`, `/favorites`, `/my-listings`, `/subscription`.
- Panel admina: `/admin` (chroniony przez `AdminRoute`).

### ⚠️ Różnice
- W opisie masz `Login/AuthCallback` (skrótowo), a w kodzie są to dwie osobne ścieżki: `/login` i `/auth/callback`.
- Jest dodatkowa ścieżka `/subscription/success`, której nie ma w Twoim opisie.
- W opisie „AdminPanel (/admin) [TYLKO ADMIN]”, ale w kodzie dostęp do panelu ma `admin` oraz rola magazynowa (`employee`) z odpowiednimi uprawnieniami panelowymi (`canAccessWarehousePanel`).

## 2) Layout i auth

### ✅ Zgodne
- `Layout` zawiera Header, menu użytkownika, panel powiadomień i `FloatingChat`.
- `AuthContext` utrzymuje sesję i wystawia m.in. `user`, `profile`, `isAdmin`, `signOut`, `updateProfile`.

### ⚠️ Różnice
- Uprawnienia panelu admina są bardziej granularne niż prosty podział user/admin (występują też role `moderator`, `employee` i osobne flagi panelowe z tabeli `panel_access`).

## 3) Komponenty

### ✅ Zgodne (przykłady)
- `cards/`: `CardItem`, `CardFilters`, `CardDetailSheet`, `ListingModal`.
- `trade/`: m.in. `TradeOfferModal`, `TradeProgressTracker`, `EscrowModeSelector`, `ProtectionTierSelector`, `PackagePhotoUpload`, `HubInspectionSimulator`, `HubVerificationPanel`, `InspectionReviewModal`, `FinalAcceptanceModal`, `FinalizeTradeModal`, `MockPaymentModal`, `MockShippingLabel`.
- `chat/`, `profile/`, `notifications/`, `exchange/`, `home/`, `ui/`.

### ⚠️ Różnice
- W kodzie jest `TradeFinalizationModal.jsx` (dodatkowo względem listy), a lista zawiera `FinalizeTradeModal` — obecne są oba pliki.

## 4) Funkcje backendowe

### ✅ Zgodne
Wszystkie funkcje z opisu występują w katalogu `functions/`:
- Stripe/płatności: `createCheckoutSession`, `stripeWebhook`, `createTradePayment`, `tradePaymentWebhook`, `checkPaymentStatus`.
- Wymiana/logistyka: `generateTradeId`, `generateShippingLabelsFromHub`, `canCancelTrade`, `cancelTrade`.
- Admin: `getAdminTrades`, `resetMonthlyTradeCounts`.
- Utilities: `compressImage`.

## 5) Proces wymiany (11 kroków)

### ⚠️ Częściowa zgodność
- W kodzie występują kluczowe etapy `accepted`, `payment`, `preparing_shipment`, `shipping_to_hub`, `hub_verification`, `shipping_to_users`, `packages_delivered`, `completed`, `failed`, `cancelled`.
- `offer_sent` występuje w warunkach UI, ale tracker postępu (`TradeProgressTracker`) nie renderuje pełnych 11 kroków z opisu (pokazuje uproszczony zestaw etapów).
- W różnych miejscach projektu używane są jednocześnie pola `status` i `progress_step`, więc opis procesu warto doprecyzować o to rozróżnienie.

## 6) Encje / model danych

### ⚠️ Największe rozbieżności
- Repo nie posiada jednego, jawnego pliku z pełnym schematem encji zgodnym 1:1 z Twoją listą (np. `src/api/entities.js` eksportuje ogólny klient `base44.entities`).
- Frontend (Supabase) odwołuje się do tabel takich jak: `profiles`, `card_listings`, `trade_offers`, `trade_conversations`, `favorites`, `messages`, `trades`, `conversations`.
- W opisie nazwy encji są „produktowe” (`CardListing`, `TradeOffer`, `LikedListing`, `TradeConversation`, itd.) — koncepcyjnie zgodne, ale nazewnictwo i miejscami zakres pól nie są 1:1 potwierdzone w tym repo.

## Wniosek końcowy
Opis jest **w dużej części trafny koncepcyjnie** (routing, główne moduły, większość komponentów i funkcji), ale **nie zgadza się w 100% implementacyjnie**. Największe rozjazdy dotyczą:
1. dokładnych ról i uprawnień panelu admin/magazyn,
2. szczegółów procesu wymiany (pełne 11 kroków vs uproszczony tracker),
3. warstwy encji/tabel (różnice nazewnictwa i brak jednego źródła prawdy 1:1 z listą).

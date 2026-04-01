# Dokumentacja techniczna FlipZ (pliki + platformy)

Dokument jest przeznaczony dla programistów do szybkiego onboardingu i pracy nad projektem.

## Platformy i środowiska

### 1) Frontend (Web SPA)
- **Stack**: React + Vite + Tailwind.
- **Kod**: `src/`, `public/`, pliki konfiguracyjne w katalogu głównym.
- **Uruchomienie lokalne**: `npm install && npm run dev`.

### 2) Backend serverless
- **Kod**: `functions/*.ts`.
- **Zakres**: płatności, webhooki, logika wymiany i zadania administracyjne.

### 3) Baza danych i auth (Supabase)
- **SQL setup**: `supabase/flipz_core_setup.sql` oraz `docs/SUPABASE_SETUP.md`.
- **Zakres**: tabele domenowe, RLS, dostęp panelowy i storage.

### 4) Płatności (Stripe)
- **Pliki**: `functions/createCheckoutSession.ts`, `functions/stripeWebhook.ts`, `functions/createTradePayment.ts`, `functions/tradePaymentWebhook.ts`, `functions/checkPaymentStatus.ts`.
- **Sekrety**: opisane w `README.md`.

### 5) Deployment
- **Vercel**: konfiguracja w `vercel.json`.
- **Budowanie**: przez skrypty npm i konfigurację Vite.

### 6) Platformy domenowe (sekcje giełdy)
- **Card Exchange**: `src/pages/CardExchange.jsx`.
- **Brick Exchange**: `src/pages/BrickExchange.jsx`.
- **Diecast Exchange**: `src/pages/DiecastExchange.jsx`.
- **Figure Exchange**: `src/pages/FigureExchange.jsx`.
- **Collectible Exchange**: `src/pages/CollectibleExchange.jsx`.

## Mapa plików (każdy plik w repo)

- `README.md` — Główny opis projektu i integracji (Stripe + uruchomienie).
- `components.json` — Konfiguracja generatora komponentów shadcn/ui.
- `docs/ARCHITECTURE_CONSISTENCY_CHECK.md` — Raport spójności architektury vs kod.
- `docs/DEVELOPER_DOCUMENTATION.md` — Ten dokument: mapa plików i platform dla zespołu developerskiego.
- `docs/SUPABASE_SETUP.md` — Checklist konfiguracji Supabase i RLS.
- `eslint.config.js` — Konfiguracja reguł lintingu ESLint.
- `functions/canCancelTrade.ts` — Funkcja backend/serverless: `canCancelTrade`.
- `functions/cancelTrade.ts` — Funkcja backend/serverless: `cancelTrade`.
- `functions/checkPaymentStatus.ts` — Funkcja backend/serverless: `checkPaymentStatus`.
- `functions/compressImage.ts` — Funkcja backend/serverless: `compressImage`.
- `functions/createCheckoutSession.ts` — Funkcja backend/serverless: `createCheckoutSession`.
- `functions/createTradePayment.ts` — Funkcja backend/serverless: `createTradePayment`.
- `functions/generateShippingLabelsFromHub.ts` — Funkcja backend/serverless: `generateShippingLabelsFromHub`.
- `functions/generateTradeId.ts` — Funkcja backend/serverless: `generateTradeId`.
- `functions/getAdminTrades.ts` — Funkcja backend/serverless: `getAdminTrades`.
- `functions/resetMonthlyTradeCounts.ts` — Funkcja backend/serverless: `resetMonthlyTradeCounts`.
- `functions/stripeWebhook.ts` — Funkcja backend/serverless: `stripeWebhook`.
- `functions/tradePaymentWebhook.ts` — Funkcja backend/serverless: `tradePaymentWebhook`.
- `index.html` — Punkt wejścia HTML dla SPA.
- `jsconfig.json` — Aliasy importów i ustawienia JS dla IDE.
- `manifest.json` — Manifest aplikacji webowej/PWA.
- `package-lock.json` — Lockfile npm (spięte wersje zależności).
- `package.json` — Zależności i skrypty npm.
- `postcss.config.js` — Konfiguracja pipeline PostCSS.
- `public/favicon.svg` — Favicon aplikacji.
- `public/logo.svg` — Logo aplikacji.
- `src/App.css` — Style komponentu App.
- `src/App.jsx` — Główny komponent aplikacji i konfiguracja tras.
- `src/Layout.jsx` — Layout globalny (nawigacja, nagłówki, slot dla stron).
- `src/api/base44Client.js` — Konfiguracja klienta API Base44.
- `src/api/entities.js` — Warstwa encji API.
- `src/api/integrations.js` — Integracje z usługami zewnętrznymi.
- `src/assets/react.svg` — Asset SVG wykorzystywany przez frontend.
- `src/components/LanguageProvider.jsx` — Provider języków/internacjonalizacji.
- `src/components/UserNotRegisteredError.jsx` — Komunikat błędu dla użytkownika bez pełnej rejestracji.
- `src/components/cards/CardDetailSheet.jsx` — Komponent domeny kart/ogłoszeń: `CardDetailSheet`.
- `src/components/cards/CardFilters.jsx` — Komponent domeny kart/ogłoszeń: `CardFilters`.
- `src/components/cards/CardItem.jsx` — Komponent domeny kart/ogłoszeń: `CardItem`.
- `src/components/cards/ListingModal.jsx` — Komponent domeny kart/ogłoszeń: `ListingModal`.
- `src/components/chat/ChatPanel.jsx` — Komponent czatu: `ChatPanel`.
- `src/components/chat/FloatingChat.jsx` — Komponent czatu: `FloatingChat`.
- `src/components/exchange/ExchangeView.jsx` — Komponent widoków giełdy/wymiany: `ExchangeView`.
- `src/components/home/QuickPostModal.jsx` — Komponent strony głównej: `QuickPostModal`.
- `src/components/notifications/NotificationPanel.jsx` — Komponent systemu powiadomień: `NotificationPanel`.
- `src/components/notifications/NotificationProvider.jsx` — Komponent systemu powiadomień: `NotificationProvider`.
- `src/components/notifications/NotificationSound.jsx` — Komponent systemu powiadomień: `NotificationSound`.
- `src/components/profile/EditProfileModal.jsx` — Komponent domeny profilu: `EditProfileModal`.
- `src/components/profile/ProfileListings.jsx` — Komponent domeny profilu: `ProfileListings`.
- `src/components/profile/ProfileStats.jsx` — Komponent domeny profilu: `ProfileStats`.
- `src/components/trade/EscrowModeSelector.jsx` — Komponent procesu wymiany: `EscrowModeSelector`.
- `src/components/trade/FinalAcceptanceModal.jsx` — Komponent procesu wymiany: `FinalAcceptanceModal`.
- `src/components/trade/FinalizeTradeModal.jsx` — Komponent procesu wymiany: `FinalizeTradeModal`.
- `src/components/trade/HubInspectionSimulator.jsx` — Komponent procesu wymiany: `HubInspectionSimulator`.
- `src/components/trade/HubVerificationPanel.jsx` — Komponent procesu wymiany: `HubVerificationPanel`.
- `src/components/trade/InspectionReviewModal.jsx` — Komponent procesu wymiany: `InspectionReviewModal`.
- `src/components/trade/MockPaymentModal.jsx` — Komponent procesu wymiany: `MockPaymentModal`.
- `src/components/trade/MockShippingLabel.jsx` — Komponent procesu wymiany: `MockShippingLabel`.
- `src/components/trade/PackagePhotoUpload.jsx` — Komponent procesu wymiany: `PackagePhotoUpload`.
- `src/components/trade/ProtectionTierSelector.jsx` — Komponent procesu wymiany: `ProtectionTierSelector`.
- `src/components/trade/TradeFinalizationModal.jsx` — Komponent procesu wymiany: `TradeFinalizationModal`.
- `src/components/trade/TradeOfferModal.jsx` — Komponent procesu wymiany: `TradeOfferModal`.
- `src/components/trade/TradeProgressTracker.jsx` — Komponent procesu wymiany: `TradeProgressTracker`.
- `src/components/ui/accordion.jsx` — Komponent UI `accordion` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/alert-dialog.jsx` — Komponent UI `alert-dialog` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/alert.jsx` — Komponent UI `alert` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/aspect-ratio.jsx` — Komponent UI `aspect-ratio` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/avatar.jsx` — Komponent UI `avatar` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/badge.jsx` — Komponent UI `badge` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/breadcrumb.jsx` — Komponent UI `breadcrumb` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/button.jsx` — Komponent UI `button` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/calendar.jsx` — Komponent UI `calendar` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/card.jsx` — Komponent UI `card` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/carousel.jsx` — Komponent UI `carousel` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/chart.jsx` — Komponent UI `chart` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/checkbox.jsx` — Komponent UI `checkbox` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/collapsible.jsx` — Komponent UI `collapsible` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/command.jsx` — Komponent UI `command` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/context-menu.jsx` — Komponent UI `context-menu` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/dialog.jsx` — Komponent UI `dialog` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/drawer.jsx` — Komponent UI `drawer` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/dropdown-menu.jsx` — Komponent UI `dropdown-menu` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/form.jsx` — Komponent UI `form` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/hover-card.jsx` — Komponent UI `hover-card` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/input-otp.jsx` — Komponent UI `input-otp` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/input.jsx` — Komponent UI `input` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/label.jsx` — Komponent UI `label` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/menubar.jsx` — Komponent UI `menubar` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/navigation-menu.jsx` — Komponent UI `navigation-menu` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/pagination.jsx` — Komponent UI `pagination` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/popover.jsx` — Komponent UI `popover` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/progress.jsx` — Komponent UI `progress` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/radio-group.jsx` — Komponent UI `radio-group` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/resizable.jsx` — Komponent UI `resizable` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/scroll-area.jsx` — Komponent UI `scroll-area` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/select.jsx` — Komponent UI `select` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/separator.jsx` — Komponent UI `separator` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/sheet.jsx` — Komponent UI `sheet` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/sidebar.jsx` — Komponent UI `sidebar` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/skeleton.jsx` — Komponent UI `skeleton` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/slider.jsx` — Komponent UI `slider` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/sonner.jsx` — Komponent UI `sonner` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/switch.jsx` — Komponent UI `switch` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/table.jsx` — Komponent UI `table` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/tabs.jsx` — Komponent UI `tabs` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/textarea.jsx` — Komponent UI `textarea` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/toast.jsx` — Komponent UI `toast` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/toaster.jsx` — Komponent UI `toaster` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/toggle-group.jsx` — Komponent UI `toggle-group` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/toggle.jsx` — Komponent UI `toggle` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/tooltip.jsx` — Komponent UI `tooltip` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/components/ui/use-toast.jsx` — Komponent UI `use-toast` (prymityw wielokrotnego użytku, głównie shadcn/Radix).
- `src/hooks/use-mobile.jsx` — Hook wykrywania urządzeń mobilnych/breakpointów.
- `src/index.css` — Globalne style aplikacji.
- `src/lib/AuthContext.jsx` — Kontekst sesji, ról i autoryzacji użytkownika.
- `src/lib/NavigationTracker.jsx` — Śledzenie przejść nawigacyjnych.
- `src/lib/PageNotFound.jsx` — Widok 404.
- `src/lib/VisualEditAgent.jsx` — Integracja visual-editing/agenta edycji.
- `src/lib/app-params.js` — Parametry i stałe aplikacyjne.
- `src/lib/query-client.js` — Konfiguracja klienta cache/zapytań.
- `src/lib/utils.js` — Biblioteka funkcji pomocniczych.
- `src/main.jsx` — Bootstrap React (createRoot + mount).
- `src/pages.config.js` — Rejestr mapowania nazw stron na komponenty.
- `src/pages/AdminDashboard.jsx` — Strona routingu `AdminDashboard` (widok domenowy).
- `src/pages/AdminPanel.jsx` — Strona routingu `AdminPanel` (widok domenowy).
- `src/pages/AuthCallback.jsx` — Strona routingu `AuthCallback` (widok domenowy).
- `src/pages/BrickExchange.jsx` — Strona routingu `BrickExchange` (widok domenowy).
- `src/pages/CardExchange.jsx` — Strona routingu `CardExchange` (widok domenowy).
- `src/pages/CollectibleExchange.jsx` — Strona routingu `CollectibleExchange` (widok domenowy).
- `src/pages/DiecastExchange.jsx` — Strona routingu `DiecastExchange` (widok domenowy).
- `src/pages/Favorites.jsx` — Strona routingu `Favorites` (widok domenowy).
- `src/pages/FigureExchange.jsx` — Strona routingu `FigureExchange` (widok domenowy).
- `src/pages/Home.jsx` — Strona routingu `Home` (widok domenowy).
- `src/pages/Landing.jsx` — Strona routingu `Landing` (widok domenowy).
- `src/pages/Login.jsx` — Strona routingu `Login` (widok domenowy).
- `src/pages/Messages.jsx` — Strona routingu `Messages` (widok domenowy).
- `src/pages/MyListings.jsx` — Strona routingu `MyListings` (widok domenowy).
- `src/pages/Profile.jsx` — Strona routingu `Profile` (widok domenowy).
- `src/pages/Subscription.jsx` — Strona routingu `Subscription` (widok domenowy).
- `src/pages/SubscriptionSuccess.jsx` — Strona routingu `SubscriptionSuccess` (widok domenowy).
- `src/utils.js` — Globalne utility frontendowe.
- `src/utils/index.ts` — Dodatkowe utility (TypeScript).
- `supabase/flipz_core_setup.sql` — Bazowy skrypt SQL dla struktur Supabase.
- `tailwind.config.js` — Konfiguracja Tailwind CSS.
- `vercel.json` — Konfiguracja wdrożenia na Vercel.
- `vite.config.js` — Konfiguracja bundlera Vite.

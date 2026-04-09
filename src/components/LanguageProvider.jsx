import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  pl: {
    // Menu i Nawigacja
    home: "Strona główna",
    myCollection: "Moja kolekcja",
    messages: "Wiadomości",
    profile: "Profil",
    logout: "Wyloguj się",
    settings: "Ustawienia",

    // Sekcja Hero (Landing Page)
    escrowProcess: "Proces Escrow",
    secureTrading: "Bezpieczna Wymiana",
    whoCareAboutItems: "Dla kolekcjonerów z pasją",
    secureEscrowDesc: "Chronimy Twoje karty na każdym etapie wymiany.",
    getStartedFree: "Zacznij za darmo",
    seeHowItWorks: "Zobacz jak to działa",

    // Jak to działa (Steps)
    createAgreement: "Utwórz umowę",
    createAgreementDesc: "Ustal warunki wymiany z drugim użytkownikiem.",
    sendToEscrow: "Wyślij do Escrow",
    sendToEscrowDesc: "Wyślij swoje karty do naszego centrum weryfikacji.",
    verification: "Weryfikacja",
    verificationDesc: "Nasi eksperci sprawdzą autentyczność i stan kart.",
    safeDelivery: "Bezpieczna dostawa",
    safeDeliveryDesc: "Po weryfikacji karty trafiają do nowych właścicieli.",

    // Dlaczego my (Features)
    escrowProtection: "Ochrona Escrow",
    escrowProtectionDesc: "Twoje przedmioty są bezpieczne w naszym systemie depozytowym.",
    verificationProcess: "Proces weryfikacji",
    verificationProcessDesc: "Każda karta przechodzi rygorystyczne sprawdzenie autentyczności.",
    builtForCollectors: "Stworzone dla kolekcjonerów",
    builtForCollectorsDesc: "Aplikacja zaprojektowana przez pasjonatów dla pasjonatów.",
    growingCommunity: "Rosnąca społeczność",
    growingCommunityDesc: "Dołącz do tysięcy użytkowników wymieniających się kartami.",

    // Cennik (Pricing)
    transparentPricing: "Przejrzysty cennik",
    freeAccountDesc: "Podstawowe funkcje dla każdego użytkownika.",
    subscriptionDesc: "Wybierz plan dopasowany do Twoich potrzeb.",
    mostPopular: "Najpopularniejszy",
    noHiddenFees: "Brak ukrytych opłat",
    perExchange: "za wymianę",
    standardEscrow: "Standardowy depozyt",
    basicVerification: "Podstawowa weryfikacja",
    standardDelivery: "Standardowa wysyłka",
    enhancedProtection: "Zwiększona ochrona",
    detailedVerification: "Szczegółowa weryfikacja",
    prioritySupport: "Wsparcie priorytetowe",
    maximumProtection: "Maksymalna ochrona",
    professionalAuth: "Profesjonalna autentykacja",
    premiumSupport: "Wsparcie Premium",
    insuranceIncluded: "Ubezpieczenie w cenie",

    // Sekcje dodatkowe
    whatYouCanTrade: "Czym możesz się wymieniać?",
    differentCollectibles: "Obsługujemy karty TCG, sportowe i wiele innych.",
    howSecureWorks: "Jak działają zabezpieczenia?",
    safetyTransparency: "Bezpieczeństwo i przejrzystość to nasze priorytety.",
    whyChoose: "Dlaczego warto wybrać FlipCardZ?",
    builtOnTrust: "Zbudowane na zaufaniu",
    trustEssential: "Zaufanie jest kluczowe w świecie kolekcjonerskim.",
    startTradingConfidence: "Wymieniaj się bez obaw",
    joinCommunity: "Dołącz do naszej społeczności",
    createFreeAccount: "Załóż darmowe konto",
    exploreMarketplace: "Przeglądaj ogłoszenia",

    // Stopka i Inne
    terms: "Regulamin",
    privacy: "Prywatność",
    contact: "Kontakt",
    allRightsReserved: "Wszelkie prawa zastrzeżone",

    // Ogólne funkcje aplikacji
    title: "FlipCardZ",
    tagline: "Bezpieczna wymiana kart",
    searchPlaceholder: "Szukaj...",
    categories: "Kategorie",
    allCategories: "Wszystkie kategorie",
    signIn: "Zaloguj się",
    signOut: "Wyloguj się",
    save: "Zapisz",
    cancel: "Anuluj",
    loading: "Ładowanie...",
    error: "Błąd",
    success: "Sukces!",
    myProfile: "Mój profil",
    myListings: "Moje ogłoszenia",
    myTrades: "Moje wymiany",
    createListing: "Wystaw kartę",
    editListing: "Edytuj ogłoszenie",
    deleteListing: "Usuń ogłoszenie",
    updateListing: "Zaktualizuj",
    listItem: "Wystaw przedmiot",
    listingCreated: "Ogłoszenie wystawione!",
    listingUpdated: "Zaktualizowano!",
    noListings: "Brak ogłoszeń",
    condition: "Stan",
    rarity: "Rzadkość",
    value: "Wartość",
    description: "Opis",
    category: "Kategoria",
    tradeOnly: "Tylko wymiana",
    chat: "Czat",
    send: "Wyślij",
    typeMessage: "Napisz wiadomość...",
    uploadImages: "Dodaj zdjęcia",
    setDisplayNameFirst: "Ustaw najpierw nazwę wyświetlaną w profilu.",

    // Dashboard / MyListings
    myDashboard: "Mój panel",
    manageListing: "Zarządzaj ogłoszeniami i wymianami",
    newListing: "Nowe ogłoszenie",
    listings: "Ogłoszenia",
    noListingsYet: "Brak ogłoszeń",
    startByListing: "Zacznij od wystawienia swojej pierwszej karty",
    incomingOffers: "Przychodzące oferty",
    myOffers: "Moje oferty",
    noOffersYet: "Brak przychodzących ofert",
    tradeOffersAppear: "Oferty wymiany pojawią się tutaj",
    noOffersMade: "Nie złożyłeś jeszcze żadnych ofert",
    yourOffersAppear: "Twoje wysłane oferty pojawią się tutaj",
    edit: "Edytuj",
    delete: "Usuń",
    markAsSold: "Oznacz jako sprzedaną",
    markAsTraded: "Oznacz jako wymienioną",


    // Trade flow
    wants: "Chce",
    to: "Do",
    for: "Za",
    theirOffer: "Ich oferta",
    accept: "Akceptuj",
    decline: "Odrzuć",
    completePayment: "Zapłać",
    bothPaidReady: "Obie strony zapłaciły ✓",
    waitingFor: "Oczekiwanie na",
    viewShippingLabel: "Pokaż etykietę",
    iHaveSentPackage: "Wysłałem paczkę",
    packageSent: "Paczka wysłana ✓",
    skipToHubInspection: "Symuluj inspekcję hubu",
    everythingOK: "Wszystko OK",
    viewDetails: "Szczegóły",
    inspectionAccepted: "Inspekcja zaakceptowana ✓",
  }

};

export const LanguageProvider = ({ children }) => {
  const [language] = useState('pl');

  const t = (key) => {
    return translations.pl[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export default LanguageProvider;

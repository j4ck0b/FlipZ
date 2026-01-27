import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  pl: {
    // Ogólne
    title: "FlipCardZ",
    tagline: "Wymieniaj się kartami kolekcjonerskimi bezpiecznie i łatwo",
    searchPlaceholder: "Szukaj kart, kategorii...",
    categories: "Kategorie",
    allCategories: "Wszystkie kategorie",
    signIn: "Zaloguj się",
    signOut: "Wyloguj się",
    save: "Zapisz",
    cancel: "Anuluj",
    loading: "Ładowanie...",
    error: "Wystąpił błąd",
    success: "Sukces!",
    settings: "Ustawienia",
    language: "Język",
    notifications: "Powiadomienia",

    // Profil i Ogłoszenia
    myProfile: "Mój profil",
    myListings: "Moje ogłoszenia",
    myTrades: "Moje wymiany",
    createListing: "Wystaw kartę",
    editListing: "Edytuj ogłoszenie",
    deleteListing: "Usuń ogłoszenie",
    updateListing: "Zaktualizuj ogłoszenie",
    listItem: "Wystaw przedmiot",
    confirmDelete: "Czy na pewno chcesz usunąć to ogłoszenie?",
    listingCreated: "Ogłoszenie zostało wystawione!",
    listingUpdated: "Ogłoszenie zaktualizowane!",
    setDisplayNameFirst: "Najpierw ustaw swoją nazwę wyświetlaną w profilu",
    noListings: "Nie znaleziono żadnych ogłoszeń",
    
    // Szczegóły Karty
    condition: "Stan",
    rarity: "Rzadkość",
    value: "Szacowana wartość",
    listingDate: "Data wystawienia",
    description: "Opis",
    lookingFor: "Szukam",
    category: "Kategoria",
    itemNamePlaceholder: "np. Charizard Base Set 1st Edition",
    descriptionPlaceholder: "Opisz przedmiot, stan, szczególne detale...",
    whatLookingForPlaceholder: "Opisz, jakie przedmioty zaakceptujesz w zamian...",
    priceRange: "Zakres wartości",
    allConditions: "Wszystkie stany",
    allRarities: "Wszystkie rzadkości",
    filter: "Filtruj",
    clearFilters: "Wyczyść filtry",
    tradeOnly: "Tylko wymiana",
    markAsSold: "Oznacz jako sprzedane",
    edit: "Edytuj",

    // Wymiany i Czat
    sendOffer: "Wyślij ofertę wymiany",
    viewDetails: "Zobacz szczegóły",
    tradeRequested: "Wysłano ofertę wymiany",
    tradeAccepted: "Zaakceptowano wymianę",
    tradeRejected: "Odrzucono wymianę",
    tradeCompleted: "Wymiana zakończona",
    status: "Status",
    actions: "Akcje",
    accept: "Akceptuj",
    reject: "Odrzuć",
    chat: "Czat",
    send: "Wyślij",
    typeMessage: "Wpisz wiadomość...",
    noMessages: "Brak wiadomości",
    noOffersMade: "Nie złożono ofert",
    yourOffersAppear: "Twoje oferty wymiany pojawią się tutaj",

    // Komponenty UI
    uploadImages: "Dodaj zdjęcia",
    maxImages: "Maksymalnie 5 zdjęć",
    required: "To pole jest wymagane",
    minChars: "Minimum {min} znaki",
    sortBy: "Sortuj według",
    newest: "Najnowsze",
    valueLowHigh: "Wartość: od najniższej",
    valueHighLow: "Wartość: od najwyższej"
  }
};

export const LanguageProvider = ({ children }) => {
  // Blokujemy język na 'pl'
  const [language] = useState('pl');

  const t = (key) => {
    // Zawsze zwraca polskie tłumaczenie
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
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  pl: {
    // Nagłówki i ogólne
    title: "FlipCardZ",
    tagline: "Wymieniaj się kartami bezpiecznie",
    searchPlaceholder: "Szukaj kart...",
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
    
    // Profil i Ogłoszenia
    myProfile: "Mój profil",
    myListings: "Moje ogłoszenia",
    myTrades: "Moje wymiany",
    createListing: "Wystaw kartę",
    editListing: "Edytuj ogłoszenie",
    deleteListing: "Usuń ogłoszenie",
    updateListing: "Zaktualizuj ogłoszenie",
    listItem: "Wystaw przedmiot",
    edit: "Edytuj",
    markAsSold: "Oznacz jako sprzedane",
    confirmDelete: "Czy na pewno chcesz usunąć?",
    listingCreated: "Ogłoszenie wystawione!",
    listingUpdated: "Zaktualizowano!",
    setDisplayNameFirst: "Ustaw nazwę w profilu",
    noListings: "Brak ogłoszeń",

    // Karta i Filtry
    condition: "Stan",
    rarity: "Rzadkość",
    value: "Wartość",
    listingDate: "Dodano",
    description: "Opis",
    lookingFor: "Szukam",
    category: "Kategoria",
    itemNamePlaceholder: "np. Charizard Base Set",
    descriptionPlaceholder: "Opisz kartę...",
    whatLookingForPlaceholder: "Co chcesz w zamian?",
    priceRange: "Zakres wartości",
    allConditions: "Wszystkie stany",
    allRarities: "Wszystkie rzadkości",
    filter: "Filtruj",
    clearFilters: "Wyczyść",
    tradeOnly: "Tylko wymiana",
    
    // Wymiany i Czat
    sendOffer: "Wyślij ofertę",
    viewDetails: "Szczegóły",
    tradeRequested: "Oferta wysłana",
    tradeAccepted: "Zaakceptowano",
    tradeRejected: "Odrzucono",
    tradeCompleted: "Zakończono",
    status: "Status",
    actions: "Akcje",
    accept: "Akceptuj",
    reject: "Odrzuć",
    chat: "Czat",
    send: "Wyślij",
    typeMessage: "Napisz...",
    noMessages: "Brak wiadomości",
    noOffersMade: "Nie złożono ofert",
    yourOffersAppear: "Tu pojawią się Twoje oferty",

    // UI
    uploadImages: "Dodaj zdjęcia",
    maxImages: "Max 5 zdjęć",
    required: "Wymagane",
    sortBy: "Sortuj",
    newest: "Najnowsze",
    valueLowHigh: "Wartość: rosnąco",
    valueHighLow: "Wartość: malejąco"
  }
};

export const LanguageProvider = ({ children }) => {
  // Wymuszamy język polski
  const [language] = useState('pl');

  const t = (key) => {
    // Jeśli klucza brakuje w tłumaczeniach, zwróć go z dużej litery, żeby nie było pustego miejsca
    if (translations.pl[key]) {
      return translations.pl[key];
    }
    console.warn(`Brakujący klucz tłumaczenia: ${key}`);
    return key.charAt(0).toUpperCase() + key.slice(1);
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

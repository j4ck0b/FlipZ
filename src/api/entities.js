import { base44 } from './base44Client';

// Eksportujemy narzędzia tak, aby reszta komponentów (np. Home.jsx) nie widziała różnicy
export const Query = base44.entities;
export const User = base44.auth;

// Dodatkowe skróty dla integracji, jeśli Twoja strona ich szuka
export const Core = base44.functions;

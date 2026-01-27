import { base44 } from './base44Client';

// Eksportujemy Query i User, żeby reszta aplikacji ich używała
export const Query = base44.entities; 
export const User = base44.auth;

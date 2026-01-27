import { base44 } from './base44Client';

export const Core = base44.integrations.Core;
export const UploadFile = base44.integrations.Core.UploadFile;
// Resztę (LLM, SMS) zostawiamy pustą, bo Supabase ich nie ma domyślnie
export const SendEmail = async () => console.log("Email logic needed");
export const InvokeLLM = async () => ({ data: "LLM not configured" });

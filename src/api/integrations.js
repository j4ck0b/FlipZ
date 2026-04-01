import { flipzApi } from './apiClient';

export const Core = flipzApi.integrations.Core;
export const UploadFile = flipzApi.integrations.Core.UploadFile;
// Resztę (LLM, SMS) zostawiamy pustą, bo Supabase ich nie ma domyślnie
export const SendEmail = async () => console.log("Email logic needed");
export const InvokeLLM = async () => ({ data: "LLM not configured" });

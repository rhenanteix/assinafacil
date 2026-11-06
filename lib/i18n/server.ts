import { cookies } from "next/headers";
import { localeCookie, resolveLocale, translator } from "./shared";

export async function getLocale() {
  return resolveLocale((await cookies()).get(localeCookie)?.value);
}
export async function getTranslator() {
  return translator(await getLocale());
}

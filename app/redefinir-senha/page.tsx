import { RecoveryForm } from "@/components/shared/RecoveryForm";
export const metadata = { title: "Redefinir senha", robots: { index: false }, referrer: "no-referrer" as const };
export default function Reset() { return <RecoveryForm reset />; }

import type { Metadata } from "next";
import { ConfirmedPageContent } from "@/components/auth/auth-page-content";

export const metadata: Metadata = { title: "Email подтверждён" };

export default function ConfirmedPage() {
  return <ConfirmedPageContent />;
}

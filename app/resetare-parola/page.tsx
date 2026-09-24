import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Resetarea parolei",
  description: "Alege o parola noua pentru contul tau edu3d.",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Suspense fallback={<div className="card h-64 animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

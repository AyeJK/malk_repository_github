"use client";

import { Suspense } from "react";
import ResetPasswordInner from "./ResetPasswordInner";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
} 
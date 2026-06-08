'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="flex-grow flex items-center justify-center py-16 bg-slate-50">
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/tool"
        afterSignUpUrl="/tool"
      />
    </div>
  );
}

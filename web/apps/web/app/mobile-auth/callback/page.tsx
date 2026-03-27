'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function MobileAuthCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}

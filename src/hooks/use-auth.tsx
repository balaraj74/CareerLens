
'use client';

// This file is now a proxy for the hooks in firebase-provider.
// This is done to avoid a large refactor of all components using these hooks.
export { useAuth, useFirebase } from '@/lib/firebase-provider';

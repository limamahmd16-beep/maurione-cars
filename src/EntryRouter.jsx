import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import SafeEntry from './SafeEntry.jsx';
import { auth, firebaseReady } from './lib/firebase.js';

export default function EntryRouter({ children }) {
  const [authState, setAuthState] = useState(() => {
    if (!firebaseReady || !auth) return 'signed-out';
    if (auth.currentUser) return 'authenticated';
    return 'checking';
  });

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setAuthState('signed-out');
      return undefined;
    }

    return onAuthStateChanged(auth, user => {
      setAuthState(user ? 'authenticated' : 'signed-out');
    });
  }, []);

  // The cars interface is public, so keep it rendered while Firebase restores
  // the session. This removes the blank white frame that used to appear
  // between login/session restoration and the actual site.
  if (authState === 'checking' || authState === 'authenticated') {
    return <>{children}</>;
  }

  return <SafeEntry>{children}</SafeEntry>;
}

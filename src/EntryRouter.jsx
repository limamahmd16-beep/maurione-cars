import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import SafeEntry from './SafeEntry.jsx';
import UserGate from './UserGate.jsx';
import { auth, firebaseReady } from './lib/firebase.js';

export default function EntryRouter({ children }) {
  const [authState, setAuthState] = useState(() =>
    firebaseReady && auth ? 'checking' : 'signed-out'
  );

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setAuthState('signed-out');
      return undefined;
    }

    return onAuthStateChanged(auth, user => {
      setAuthState(user ? 'authenticated' : 'signed-out');
    });
  }, []);

  // Do not render the old welcome screen while Firebase is restoring an
  // existing session. This prevents authenticated users from seeing the
  // introductory page again after login/reload.
  if (authState === 'checking') return null;

  if (authState === 'authenticated') {
    return <UserGate>{children}</UserGate>;
  }

  return <SafeEntry>{children}</SafeEntry>;
}

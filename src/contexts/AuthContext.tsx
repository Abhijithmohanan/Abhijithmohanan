import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';

type AuthState = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string;
};

type AuthContextValue = AuthState & { refreshAdminClaim: () => Promise<void> };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    error: '',
  });

  useEffect(() => {
    let active = true;
    let latestUpdate = 0;
    const unsubscribe = onIdTokenChanged(
      auth,
      async (user) => {
        const updateId = ++latestUpdate;
        if (!user) {
          if (active) setState({ user: null, isAdmin: false, isLoading: false, error: '' });
          return;
        }

        if (active) {
          setState((current) => ({
            ...current,
            user,
            isAdmin: false,
            isLoading: current.user?.uid === user.uid ? current.isLoading : true,
            error: '',
          }));
        }

        try {
          const token = await user.getIdTokenResult();
          if (active && updateId === latestUpdate) {
            setState({
              user,
              isAdmin: token.claims.admin === true,
              isLoading: false,
              error: '',
            });
          }
        } catch {
          if (active && updateId === latestUpdate) {
            setState({
              user,
              isAdmin: false,
              isLoading: false,
              error: 'Your account is signed in, but its access permissions could not be verified.',
            });
          }
        }
      },
      () => {
        if (active) {
          setState({
            user: null,
            isAdmin: false,
            isLoading: false,
            error: 'Your sign-in session could not be verified. Please sign in again.',
          });
        }
      },
    );

    return () => {
      active = false;
      latestUpdate += 1;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      refreshAdminClaim: async () => {
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdTokenResult(true);
        setState((current) => ({
          ...current,
          user: auth.currentUser,
          isAdmin: token.claims.admin === true,
          error: '',
        }));
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}

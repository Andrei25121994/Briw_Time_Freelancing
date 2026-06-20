import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const clearSupabaseAuthStorage = () => {
  const storageScopes = [window.localStorage, window.sessionStorage];

  for (const storage of storageScopes) {
    const keysToRemove: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      throw new Error('Username-ul trebuie sa aiba minim 3 caractere.');
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });
    if (error) throw error;
  };

  const verifySignUpCode = async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'signup',
    });
    if (error) throw error;
  };

  const resolveEmailFromIdentifier = async (identifier: string) => {
    const normalized = identifier.trim().toLowerCase();
    if (normalized.includes('@')) return normalized;

    const { data, error } = await (supabase.rpc('get_email_for_login', {
      input_username: normalized,
    }) as any);

    if (error) {
      throw new Error('Login-ul cu username necesita migrarea din Supabase. Foloseste email-ul sau aplica SQL-ul nou.');
    }

    if (!data) {
      throw new Error('Username inexistent. Verifica username-ul sau foloseste email-ul.');
    }

    return String(data).toLowerCase();
  };

  const signIn = async (identifier: string, password: string) => {
    const email = await resolveEmailFromIdentifier(identifier);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    clearSupabaseAuthStorage();
    setUser(null);
    setLoading(false);
    if (error) throw error;
  };

  return { user, loading, signUp, verifySignUpCode, signIn, signOut };
}

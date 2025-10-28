import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export async function signUp(email: string, password: string, name: string) {
  try {
    // Call our server endpoint for signup
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-9e45f1d5/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    
    // Now sign in the user
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) throw signInError;
    
    return { data: sessionData, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}

export async function signInWithGoogle() {
  try {
    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error);
  return { error };
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error };
  }
}

export async function getAccessToken() {
  const { session } = await getCurrentSession();
  return session?.access_token || null;
}

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email,
      access_token: session.access_token,
      user_metadata: session.user.user_metadata
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

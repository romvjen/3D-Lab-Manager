import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile with role from profiles table
  const fetchUserProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Still set auth user even if profile fetch fails
        setUser(authUser);
        return;
      }

      // Merge auth user with profile data (including role)
      setUser({
        ...authUser,
        role: profile?.role || 'student',
        fullName: profile?.full_name,
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(authUser);
    }
  };

  // Restore session on refresh
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetchUserProfile(session?.user || null);
      setLoading(false);
    };

    init();

    // Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      await fetchUserProfile(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signup = async ({ firstName, lastName, email, password }) => {
    // Create Auth Account
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };

    const authUser = data?.user;
    if (!authUser) return { success: false, error: "Signup failed." };

    // Insert user into profiles table
    const fullName = `${firstName} ${lastName}`.trim();
    await supabase.from("profiles").upsert({
      id: authUser.id,
      full_name: fullName,
      role: "student",
    });

    return { success: true };
  };

  //
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

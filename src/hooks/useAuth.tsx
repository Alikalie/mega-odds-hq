 import { useState, useEffect, createContext, useContext, ReactNode } from "react";
 import { User, Session } from "@supabase/supabase-js";
 import { supabase } from "@/integrations/supabase/client";
 
 type UserStatus = "pending" | "approved" | "blocked";
 type SubscriptionTier = "free" | "vip" | "special";
 type UserRole = "user" | "admin";
 
 interface Profile {
   id: string;
   email: string;
   full_name: string | null;
   avatar_url: string | null;
   subscription: SubscriptionTier;
   status: UserStatus;
   created_at: string;
   updated_at: string;
 }
 
 interface AuthContextType {
   user: User | null;
   session: Session | null;
   profile: Profile | null;
   role: UserRole;
   isLoading: boolean;
   isAdmin: boolean;
   isApproved: boolean;
   isVip: boolean;
   isSpecial: boolean;
   signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
   signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
   signOut: () => Promise<void>;
   refreshProfile: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [user, setUser] = useState<User | null>(null);
   const [session, setSession] = useState<Session | null>(null);
   const [profile, setProfile] = useState<Profile | null>(null);
   const [role, setRole] = useState<UserRole>("user");
   const [isLoading, setIsLoading] = useState(true);
 
   const fetchProfile = async (userId: string) => {
     try {
       const { data, error } = await supabase
         .from("profiles")
         .select("*")
         .eq("id", userId)
         .maybeSingle();
 
       if (error) {
         console.error("Error fetching profile:", error);
         return;
       }
 
       if (data) {
         setProfile(data as Profile);
       }
     } catch (err) {
       console.error("Error in fetchProfile:", err);
     }
   };
 
   const fetchRole = async (userId: string) => {
     try {
       const { data, error } = await supabase
         .from("user_roles")
         .select("role")
         .eq("user_id", userId);
 
       if (error) {
         console.error("Error fetching role:", error);
         return;
       }
 
       if (data && data.length > 0) {
         const isAdmin = data.some((r) => r.role === "admin");
         setRole(isAdmin ? "admin" : "user");
       }
     } catch (err) {
       console.error("Error in fetchRole:", err);
     }
   };
 
   const refreshProfile = async () => {
     if (user) {
       await Promise.all([fetchProfile(user.id), fetchRole(user.id)]);
     }
   };
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
 
         if (session?.user) {
           setTimeout(() => {
             fetchProfile(session.user.id);
             fetchRole(session.user.id);
           }, 0);
         } else {
           setProfile(null);
           setRole("user");
         }
       }
     );
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
       
       if (session?.user) {
         Promise.all([
           fetchProfile(session.user.id),
           fetchRole(session.user.id),
         ]).finally(() => {
           setIsLoading(false);
         });
       } else {
         setIsLoading(false);
       }
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signUp = async (email: string, password: string, fullName: string) => {
     const redirectUrl = `${window.location.origin}/`;
     
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: redirectUrl,
         data: {
           full_name: fullName,
         },
       },
     });
 
     return { error };
   };
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
 
     return { error };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
     setProfile(null);
     setRole("user");
   };
 
   const isAdmin = role === "admin";
   const isApproved = profile?.status === "approved";
   const isVip = profile?.subscription === "vip" || profile?.subscription === "special";
   const isSpecial = profile?.subscription === "special";
 
   return (
     <AuthContext.Provider
       value={{
         user,
         session,
         profile,
         role,
         isLoading,
         isAdmin,
         isApproved,
         isVip,
         isSpecial,
         signUp,
         signIn,
         signOut,
         refreshProfile,
       }}
     >
       {children}
     </AuthContext.Provider>
   );
 };
 
 export const useAuth = () => {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
 };
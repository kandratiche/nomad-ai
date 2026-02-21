import supabase from "@/lib/supabaseClient";
import { Alert } from "react-native";
import { t } from "i18next";

export interface IRegisterUser {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUpdateUser {
  name?: string;
  avatar_url?: string;
  phone_number?: string;
  auth_provide?: string;
  verified?: boolean;
  home_city?: string
  preference_pace?: string;
  preference_budget?: string;
  preference_safety?: string;
  places_saved?: number;
  guides_booked?: number;
  trips_completed?: number;
  interests?: string;
  languages?: string;
}

export async function registerUserApi(props: IRegisterUser) {
  const { email, password, confirmPassword, name } = props;

  if (!email || !password || !confirmPassword || !name) {
    Alert.alert(t("userRegister.register"), t("userRegister.fillAllFields"));
    return null;
  }

  if (password !== confirmPassword) {
    Alert.alert(t("userRegister.register"), t("userRegister.passwordsDoNotMatch"));
    return null;
  }

  if (password.length < 6) {
    Alert.alert(t("userRegister.register"), t("userRegister.passwordMinLength"));
    return null;
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.log("Auth error:", authError);
      Alert.alert(t("userRegister.registrationFailed"), authError?.message || "");
      return null;
    }

    const userId = authData.user.id;

    // Wait for the auth trigger to create the public.users row
    let profileData = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 500));
      const { data, error } = await supabase
        .from("users")
        .update({ name, languages: "en" })
        .eq("id", userId)
        .select()
        .single();
      if (data && !error) { profileData = data; break; }
      console.log(`Profile update attempt ${attempt + 1} failed:`, error?.message);
    }

    return {
      auth: authData.user,
      profile: profileData,
    };
  } catch (err: any) {
    console.error("Unexpected register error:", err);
    Alert.alert(
      t("userRegister.register"),
      err.message || t("userRegister.somethingWrong")
    );
    return null;
  }
}

export async function loginUserApi(props: ILoginUser) {
  const { email, password } = props;

  if (!email || !password) {
    Alert.alert(t("userLogin.loginButton"), t("userLogin.fillAllFields"));
    return null;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert(t("userLogin.loginButton"), error.message);
      return null;
    }

    return data;
  } catch (err: any) {
    Alert.alert(t("userLogin.loginButton"), err.message || t("userLogin.somethingWrong"));
    return null;
  }
}

export async function updateUserApi(props: IUpdateUser) {
   try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      Alert.alert(t("userProfile.updateFailed"), t("userProfile.userNotFound"));
      return null;
    }

    const updateData: Record<string, any> = {};
    for (const key in props) {
      if (props[key as keyof IUpdateUser] !== undefined) {
        updateData[key] = props[key as keyof IUpdateUser];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .single();

    if (error) {
      console.log("User table update error:", error);
      Alert.alert(t("userProfile.updateFailed"), error.message);
      return null;
    }

    return data;
  } catch (err: any) {
    console.error("Unexpected error updating user:", err);
    Alert.alert(
      t("userProfile.updateFailed"),
      err.message || t("userProfile.somethingWrong")
    );
    return null;
  }
}
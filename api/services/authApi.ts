import { Alert } from "react-native";
import { t } from "i18next";
import { clearSession, saveSession, setSessionUser, getSession } from "@/lib/authSession";
import { loginApi, logoutApi, meApi, registerApi } from "@/api/authApi";
import { updateCurrentUserApi } from "@/api/usersApi";

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
  home_city?: string;
  preference_pace?: string;
  preference_budget?: string;
  preference_safety?: string;
  places_saved?: number;
  guides_booked?: number;
  trips_completed?: number;
  interests?: string[] | string;
  languages?: string;
  roles?: string;
  guide_info?: Record<string, unknown>;
}

function pickAuthToken(payload: any): string | null {
  if (!payload || typeof payload !== "object") return null;
  return (
    payload?.accessToken ||
    payload?.token ||
    payload?.jwt ||
    payload?.jwtToken ||
    payload?.data?.accessToken ||
    payload?.data?.token ||
    payload?.data?.jwt ||
    null
  );
}

function pickUser(payload: any): any {
  return (
    payload?.user ||
    payload?.createdUser.user ||
    payload?.profile ||
    payload?.userDto ||
    payload?.userDTO ||
    payload?.account ||
    payload?.me ||
    payload?.data?.user ||
    payload?.data?.profile ||
    null
  );
}

async function resolveAuthResult(payload: any, invalidMessageTitle: string): Promise<{ user: any; accessToken: string } | null> {
  const accessToken = pickAuthToken(payload);
  console.log("accessToken: ", accessToken);
  if (!accessToken) {
    Alert.alert(invalidMessageTitle, "Invalid backend auth response: token is missing");
    console.log(11);
    return null;
  }

  let profile = pickUser(payload);

  console.log("Auth profile payload: ", profile);

  await saveSession({ accessToken, user: profile || null });

  if (!profile) {
    try {
      profile = await meApi();
    } catch {
      profile = null;
    }
  }

  if (!profile) {
    await clearSession();
    Alert.alert(invalidMessageTitle, "Invalid backend auth response: user is missing");
    return null;
  }

  await saveSession({ accessToken, user: profile });
  return { user: profile, accessToken };
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
    const payload = await registerApi({ email, password, name });
    console.log("payload: ", payload);
    return resolveAuthResult(payload, t("userRegister.registrationFailed"));
  } catch (err: any) {
    console.error("Unexpected register error:", err);
    Alert.alert(t("userRegister.register"), err.message || t("userRegister.somethingWrong"));
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
    const payload = await loginApi({ email, password });
    return resolveAuthResult(payload, t("userLogin.loginButton"));
  } catch (err: any) {
    Alert.alert(t("userLogin.loginButton"), err.message || t("userLogin.somethingWrong"));
    return null;
  }
}

export async function getCurrentUserApi(): Promise<any | null> {
  const session = await getSession();
  if (!session?.accessToken) return null;

  try {
    const user = await meApi();
    await setSessionUser(user);
    return user;
  } catch (err) {
    console.warn("Failed to fetch current user:", err);
    return session.user || null;
  }
}

export async function logoutUserApi(): Promise<void> {
  await logoutApi();
  await clearSession();
}

export async function updateUserApi(props: IUpdateUser) {
  try {
    const updateData: Record<string, unknown> = {};

    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return null;
    }

    const profile = await updateCurrentUserApi(updateData);
    await setSessionUser(profile);
    return profile;
  } catch (err: any) {
    console.error("Unexpected error updating user:", err);
    Alert.alert(t("userProfile.updateFailed"), err.message || t("userProfile.somethingWrong"));
    return null;
  }
}

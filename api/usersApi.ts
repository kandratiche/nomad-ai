import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";
import { getSession, setSessionUser } from "@/lib/authSession";
import { apiClient } from "@/lib/apiClient";

export async function updateCurrentUserApi(updateData: Record<string, unknown>): Promise<any> {
  const session = await getSession();
  const currentUser = session?.user || {};
  const userId = currentUser?.id as string | undefined;

  const optimisticUser = { ...currentUser, ...updateData };
  await setSessionUser(optimisticUser);

  if (!userId) {
    return optimisticUser;
  }

  const payload = await apiClient.patch<ApiEnvelope<any> | null>(
    buildBackendPath(`/users/${userId}`),
    updateData,
  );

  if (payload == null) {
    return optimisticUser;
  }

  const updatedFromBackend = unwrapData(payload);
  if (updatedFromBackend == null) {
    return optimisticUser;
  }

  const mergedUser = { ...optimisticUser, ...updatedFromBackend };
  await setSessionUser(mergedUser);
  return mergedUser;
}

export async function getUserProfileApi(userId: string): Promise<any> {
  const payload = await apiClient.get<ApiEnvelope<any>>(buildBackendPath(`/users/${userId}`));
  return unwrapData(payload);
}

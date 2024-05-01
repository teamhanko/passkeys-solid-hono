import { tenant } from "@teamhanko/passkeys-sdk";
import db from "../db";

const passkeyApi = tenant({
  apiKey: process.env.PASSKEYS_API_KEY!,
  tenantId: process.env.PASSKEYS_TENANT_ID!,
});

async function startServerPasskeyRegistration(userID: string) {
  const user = db.users.find((user) => user.id === userID);
  if (!user) {
    throw new Error("User not found");
  }
  const createOptions = await passkeyApi.registration.initialize({
    userId: user.id,
    username: user.email || "",
  });

  return createOptions;
}

async function finishServerPasskeyRegistration(credential: any) {
  await passkeyApi.registration.finalize(credential);
}

async function startServerPasskeyLogin() {
  const options = await passkeyApi.login.initialize();
  return options;
}

async function finishServerPasskeyLogin(options: any) {
  const response = await passkeyApi.login.finalize(options);
  return response;
}

export {
  startServerPasskeyRegistration,
  finishServerPasskeyRegistration,
  startServerPasskeyLogin,
  finishServerPasskeyLogin,
};

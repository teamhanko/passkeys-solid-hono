import * as jose from "jose";

const getUserID = async (token: string): Promise<string | undefined> => {
  try {
    const payload = jose.decodeJwt(token);
    const userID = payload.sub;
    return userID;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return undefined;
  }
};

export default getUserID;

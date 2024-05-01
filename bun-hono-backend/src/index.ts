import { Hono, Context } from "hono";
import { cors } from "hono/cors";
import db from "./db";
import { setUser, clearUserSession } from "./lib/auth";
import { getCookie, deleteCookie, setCookie } from "hono/cookie";
import { v4 as uuidv4 } from "uuid";
import {
  finishServerPasskeyLogin,
  finishServerPasskeyRegistration,
  startServerPasskeyLogin,
  startServerPasskeyRegistration,
} from "./lib/passkey";
import { checkAuth } from "./middleware/middleware";
import getUserID from "./lib/get-user-id";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/login", async (c: Context) => {
  const { email, password } = await c.req.json();
  const user = db.users.find((user) => user.email === email);
  if (!user || user.password !== password) {
    return c.json({ message: "Invalid username or password" }, 401);
  }
  const sessionId = uuidv4();
  setUser(sessionId, user);
  console.log(sessionId);
  setCookie(c, "sessionId", sessionId, { httpOnly: true });
  return c.json({ message: "Login successful" });
});

app.post("/logout", (c) => {
  const sessionId = getCookie(c, "sessionId");
  if (!sessionId) {
    return c.json({ message: "No session to log out from" }, 400);
  }

  clearUserSession(sessionId);
  deleteCookie(c, "sessionId");
  return c.json({ message: "Logout successful" });
});

// passkeys

app.post("/passkeys/register", checkAuth, async (c: Context) => {
  const user = await c.get('user');
  console.log(user)  
  const userID = user?.id;

  if (!userID) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const { start, finish, credential } = await c.req.json();
  if (start) {
    const user = db.users.find((user) => user.id === c.get("user").id);
    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }
    const createOptions = await startServerPasskeyRegistration(user.id);
    return c.json({ createOptions });
  }
  if (finish) {
    await finishServerPasskeyRegistration(credential);
    return c.json({ message: "Registration successful" });
  }
  return c.json({ message: "Invalid request" }, 400);
});

app.post("/passkeys/login", async (c: Context) => {
  const { start, finish, options } = await c.req.json();
  try {
    if (start) {
      const loginOptions = await startServerPasskeyLogin();
      return c.json({ loginOptions });
    }
    if (finish) {
      const jwtToken = await finishServerPasskeyLogin(options);
      const userID = await getUserID(jwtToken?.token ?? "");
      const user = db.users.find((user) => user.id === userID);

      if (!user) {
        return c.json({ message: "Invalid user" }, 401);
      }

      const sessionId = uuidv4();
      setUser(sessionId, user);

      console.log(sessionId);
      setCookie(c, "sessionId", sessionId, { httpOnly: true });
      return c.json({ message: "Passkey Login successful" });
    }
  } catch (error) {
    return c.json(
      { message: "An error occurred during the passkey login process." },
      500
    );
  }
});

export default app;

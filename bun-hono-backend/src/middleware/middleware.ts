import { Hono, Context } from "hono";
import { getUser } from '../lib/auth';
import { getCookie } from "hono/cookie";


const restrictToLoggedinUserOnly = async (c: Context, next: Function) => {
  const userUid = getCookie(c, 'sessionId');

  if (!userUid) {
    return c.json({ message: "Unauthorized: No active session found" }, 401);
  }

  const user = await getUser(userUid);

  if (!user) {
    return c.json({ message: "Unauthorized: Session invalid or expired" }, 401);
  }

  c.set('user', user);
  await next();
}

const checkAuth = async (c: Context, next: Function) => {
  const userUid = getCookie(c, 'sessionId');

  if (!userUid) {
    return c.json({ message: "Unauthorized: No active session found" }, 401);
  }

  const user = await getUser(userUid); // Ensure getUser is async or handle accordingly

  c.set('user', user);
  await next();
}

export { restrictToLoggedinUserOnly, checkAuth };
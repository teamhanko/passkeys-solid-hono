const sessionIdToUserMap = new Map<string, any>();

const setUser = (id: string, user: any) => {
  sessionIdToUserMap.set(id, user);
};

const getUser = (id: string) => {
  return sessionIdToUserMap.get(id);
};

const clearUserSession = (id: string) => {
  sessionIdToUserMap.delete(id);
};

export { setUser, getUser, clearUserSession };

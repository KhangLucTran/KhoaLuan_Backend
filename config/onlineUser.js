const onlineUsers = new Map();

module.exports = {
  addUser: (userId, socketId) => onlineUsers.set(userId, socketId),
  removeUser: (socketId) => {
    const userId = [...onlineUsers.entries()].find(
      ([, id]) => id === socketId
    )?.[0];
    if (userId) onlineUsers.delete(userId);
  },
  getUserSocket: (userId) => onlineUsers.get(userId),
  getAllUsers: () => [...onlineUsers.entries()],
};

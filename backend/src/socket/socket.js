// In-memory map: userId (string) -> socketId (string)
const userSocketMap = {};

const initSocket = (io) => {
  io.on('connection', (socket) => {
    // Client must pass userId as a handshake query param: io('...', { query: { userId } })
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`[Socket] User ${userId} connected → socket ${socket.id}`);
    }

    socket.on('disconnect', () => {
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        console.log(`[Socket] User ${userId} disconnected`);
      }
    });
  });
};

/**
 * Returns the active socketId for a given userId, or undefined if offline.
 */
const getSocketId = (userId) => userSocketMap[userId.toString()];

module.exports = { initSocket, getSocketId };

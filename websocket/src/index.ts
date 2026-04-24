const rooms = new Map<string,
  {
    players: Map<string, { ready: boolean, wpm: number, accuracy: number, finished: boolean }>,
    gameStarted: boolean
  }
>();

const server = Bun.serve<{ roomId: string; userId: string }>({
  port: 3001,
  fetch(req, server) {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId")!;
    const userId = url.searchParams.get("userId")!;
    return server.upgrade(req, { data: { roomId, userId } }) ? undefined : new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    open(ws) {
      ws.subscribe(ws.data.roomId);
      if (!rooms.has(ws.data.roomId)) rooms.set(ws.data.roomId, { players: new Map(), gameStarted: false });
      rooms.get(ws.data.roomId)!.players.set(ws.data.userId, { ready: false, wpm: 0, accuracy: 0, finished: false });
      server.publish(ws.data.roomId, JSON.stringify({ type: 'player_count', count: rooms.get(ws.data.roomId)!.players.size }));
    },
    message(ws, message) {
      const msg = JSON.parse(message.toString());
      const room = rooms.get(ws.data.roomId);
      if (!room) return;

      if (msg.type === 'ready') {
        room.players.get(ws.data.userId)!.ready = true;
        if (Array.from(room.players.values()).every(p => p.ready)) {
          server.publish(ws.data.roomId, JSON.stringify({ type: 'start_countdown' }));
        }
      }

      if (msg.type === 'typing_update') {
        server.publish(ws.data.roomId, JSON.stringify({
          type: 'opponent_update',
          userId: ws.data.userId,
          userName: msg.userName,
          wpm: msg.wpm,
          accuracy: msg.accuracy,
          progress: msg.progress
        }));
      }

      if (msg.type === 'finish') {
        server.publish(ws.data.roomId, JSON.stringify({
          type: 'opponent_finished',
          userId: ws.data.userId,
          wpm: msg.wpm,
          accuracy: msg.accuracy
        }));
      }

    },
    close(ws) {
      rooms.get(ws.data.roomId)?.players.delete(ws.data.userId);
      ws.unsubscribe(ws.data.roomId);
    }
  },
});
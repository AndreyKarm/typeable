// This is a websocket server that handles the game logic for the Duel component.
const rooms = new Map<string,
  {
    // Map of player IDs to player data
    players: Map<string, { ready: boolean, wpm: number, accuracy: number, finished: boolean }>,
    // Whether the game has started
    gameStarted: boolean
  }
>();

// This is the server that handles the websocket connection
const server = Bun.serve<{ roomId: string; userId: string }>({
  port: 3001,
  // This is the function that handles the websocket connection
  fetch(req, server) {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId")!;
    const userId = url.searchParams.get("userId")!;
    return server.upgrade(req, { data: { roomId, userId } }) ? undefined : new Response("Upgrade failed", { status: 500 });
  },
  // This is the function that handles the websocket connection
  websocket: {
    // This is the function that handles the websocket connection
    open(ws) {
      // Subscribe to the room
      ws.subscribe(ws.data.roomId);
      // Check if the room exists, and if not, create it
      if (!rooms.has(ws.data.roomId)) rooms.set(ws.data.roomId, { players: new Map(), gameStarted: false });
      // Add the player to the room
      rooms.get(ws.data.roomId)!.players.set(ws.data.userId, { ready: false, wpm: 0, accuracy: 0, finished: false });
      // Publish the player count to the room
      server.publish(ws.data.roomId, JSON.stringify({ type: 'player_count', count: rooms.get(ws.data.roomId)!.players.size }));
    },
    // This is the function that handles the websocket message
    message(ws, message) {
      // Parse the message as JSON
      const msg = JSON.parse(message.toString());
      // Check if the message is a player count message
      const room = rooms.get(ws.data.roomId);
      // Check if the room exists
      if (!room) return;

      // Check if the message is a player count message
      if (msg.type === 'ready') {
        // Check if the player is already in the room
        room.players.get(ws.data.userId)!.ready = true;
        // Check if all players are ready
        if (Array.from(room.players.values()).every(p => p.ready)) {
          server.publish(ws.data.roomId, JSON.stringify({ type: 'start_countdown' }));
        }
      }

      // "player_count" message
      if (msg.type === 'typing_update') {
        // Check if the player is in the room
        server.publish(ws.data.roomId, JSON.stringify({
          type: 'opponent_update',
          userId: ws.data.userId,
          userName: msg.userName,
          wpm: msg.wpm,
          accuracy: msg.accuracy,
          progress: msg.progress
        }));
      }

      // "player_count" message
      if (msg.type === 'finish') {
        // Check if the player is in the room
        server.publish(ws.data.roomId, JSON.stringify({
          type: 'opponent_finished',
          userId: ws.data.userId,
          wpm: msg.wpm,
          accuracy: msg.accuracy
        }));
      }
    },
    // This is the function that handles the websocket close
    close(ws) {
      // Check if the room exists
      rooms.get(ws.data.roomId)?.players.delete(ws.data.userId);
      // Check if the room is empty
      ws.unsubscribe(ws.data.roomId);
    }
  },
});
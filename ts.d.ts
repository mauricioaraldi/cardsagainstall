interface ServerToClientEvents {
  message: (message: string) => void;
  test: () => void;
}

interface ClientToServerEvents {
  message: () => void;
  test: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  message: string;
}

interface Card {
  id: string,
  text: string,
  version: string,
}
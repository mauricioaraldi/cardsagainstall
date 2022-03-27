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
  id: string;
  selectedAs?: number;
  text: string;
  version: string;
}

interface Question {
  id: string;
  pick: number;
  text: string;
  version: string;
}

interface Player {
  name: string;
  score: number;
  status: string;
}
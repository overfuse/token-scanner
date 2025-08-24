import type {
  IncomingWebSocketMessage,
  OutgoingWebSocketMessage,
  GetScannerResultParams,
  PairStatsSubscriptionMessage,
  PairSubscriptionMessage,
} from "./types";

const WS_URL = "wss://api-rs.dexcelerate.com/ws";

export type MessageHandler = (msg: IncomingWebSocketMessage) => void;

export class ScannerWebSocket {
  private socket: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();

  connect() {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.socket = new WebSocket(WS_URL);
    this.socket.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as IncomingWebSocketMessage;
        this.handlers.forEach((h) => h(data));
      } catch {
        // ignore
      }
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  send(message: OutgoingWebSocketMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
  }

  on(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  subscribeScanner(filter: GetScannerResultParams) {
    this.send({ event: "scanner-filter", data: filter });
  }

  unsubscribeScanner(filter: GetScannerResultParams) {
    this.send({ event: "unsubscribe-scanner-filter", data: filter });
  }

  subscribePairStats(payload: PairStatsSubscriptionMessage["data"]) {
    this.send({ event: "subscribe-pair-stats", data: payload });
  }

  unsubscribePairStats(payload: PairStatsSubscriptionMessage["data"]) {
    this.send({ event: "unsubscribe-pair-stats", data: payload });
  }

  subscribePair(payload: PairSubscriptionMessage["data"]) {
    this.send({ event: "subscribe-pair", data: payload });
  }

  unsubscribePair(payload: PairSubscriptionMessage["data"]) {
    this.send({ event: "unsubscribe-pair", data: payload });
  }
}

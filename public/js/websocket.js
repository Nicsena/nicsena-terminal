/* A Friendly WebSocket */

// WebSockets are awesome, but they have a nasty habit of disconnecting
// and not waking back up. This class is a wrapper around WebSocket that
// handles automatic reconnection.

class FriendlyWebSocket {
  // optional customization of the websocket path
  constructor({ path = "/", url } = {}) {
    this.path = path;
    this.url = url;
    this.connect();
    this.connected = false;
    this._listeners = {
      message: new Set(),
      open: new Set(),
      close: new Set()
    };
  }

  connect() {
    let protocol = 'ws://';
    if (location.protocol === 'https:') {
      protocol = 'wss://';
    }
    
    let url = this.url || (protocol + location.host + this.path);
    
    this.socket = new WebSocket(url);

    // Connection opened
    this.socket.addEventListener("open", event => {
      console.log("connected!");
      this.connected = true;
      this._emit('open');
    });

    
    this.socket.addEventListener("close", event => {
      console.log("disconnected!");
      this.connected = false;
      // the server went away, try re-connecting in 2 seconds.
      this._emit('close');
      setTimeout(() => this.connect(), 2000);
      
    });

    // Listen for messages
    this.socket.addEventListener("message", event => {
      // tell the listeners about it
      this._emit('message', event.data);
    });
  }

  _emit(type, data) {
    this._listeners[type].forEach(handler => {
      // don't let one listener spoil the batch
      try {
        handler(data);
      } catch (e) {
        console.warn("error in message handler", e);
      }
    });
  }
  
  on(type, handler) {
    if (type in this._listeners) {
      this._listeners[type].add(handler);
    }
  }

  off(type, handler) {
    if (type === "message") {
      this.messageHandlers.delete(handler);
    }
  }

  send(message) {
    if (this.connected) {
      this.socket.send(message);
    }
  }
}

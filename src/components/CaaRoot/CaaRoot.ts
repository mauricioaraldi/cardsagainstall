// @ts-nocheck
// import { io, Socket } from 'socket.io-client';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../CaaGame/CaaGame';
import '../CaaMenu/CaaMenu';

@customElement('caa-root')
export class CaaRoot extends LitElement {
  @property({ type: String }) title = 'Cards Against All';
  @property({ type: String }) currentPage = 'menu';
  @property({ type: String }) playerName = '';
  @property({ type: Array }) hand = [];

  // socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('ws://localhost:3000');
  socket: any = io('ws://localhost:3000');
  static styles = css`
    input {
      margin-bottom: 16px;
    }
  `;

  onNavigate(ev: any) {
    this.currentPage = ev.detail;
  }

  onStart() {
    this.socket.emit('playerName', this.playerName);

    this.socket.on('hand', cards => {
      this.hand = cards;
    });

    this.currentPage = 'game';
  }

  renderPage() {
    switch (this.currentPage) {
      case 'game':
        return html`<caa-game .hand=${this.hand} @navigate=${this.onNavigate} />`;

      default:
        return html`
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value="${this.playerName}"
            @change=${e => (this.playerName = e.target.value)}
          />
          <caa-menu @navigate=${this.onNavigate} @start=${this.onStart} />
        `;
    }
  }

  render() {
    return html`
      <h1>${this.title}</h1>

      ${this.renderPage()}
    `;
  }
}

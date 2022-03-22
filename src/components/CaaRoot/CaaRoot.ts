import { io } from '../../../node_modules/socket.io/client-dist/socket.io.js';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../CaaGame/CaaGame';
import '../CaaMenu/CaaMenu';

@customElement('caa-root')
export class CaaRoot extends LitElement {
  @property({ type: String }) title = 'Cards Against All';
  @property({ type: String }) currentPage = 'menu';

  socket = io('ws://localhost:3000');
  static styles = css``;

  connectedCallback() {
    super.connectedCallback()

    this.socket.on('message', (arg: any) => {
      console.log('Received message:', arg);
    });

    this.socket.emit('test', 'THIS IS THE TEST');
  }

  onNavigate(ev: any) {
    this.currentPage = ev.detail;
  }

  onStart() {
    this.currentPage = 'game';
  }

  renderPage() {
    switch (this.currentPage) {
      case 'game':
        return html`<caa-game @navigate=${this.onNavigate} />`;

      default:
        return html`
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

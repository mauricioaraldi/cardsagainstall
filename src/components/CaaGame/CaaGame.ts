import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('caa-game')
export class CaaGame extends LitElement {
  static styles = css``;

  onReturnToMenu() {
    const event = new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: 'menu',
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <main>
        <button @click=${this.onReturnToMenu}>Back</button>

        <div>MAP</div>
      </main>
    `;
  }
}

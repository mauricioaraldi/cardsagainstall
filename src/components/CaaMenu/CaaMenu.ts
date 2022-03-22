import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('caa-menu')
export class CaaMenu extends LitElement {
  static styles = css``;

  onStart() {
    const event = new Event('start', { bubbles: true, composed: true });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <nav>
        <button @click=${this.onStart}>Start</button>
      </nav>
    `;
  }
}

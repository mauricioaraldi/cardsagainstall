import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('caa-game')
export class CaaGame extends LitElement {
  @property({ type: Array }) hand: Card[] = [];

  static styles = css`
    #hand {
      bottom: 0;
      display: flex;
      left: 0;
      margin: 0;
      padding: 8px;
      position: absolute;
      right: 0;
    }

    .card {
      align-items: flex-start;
      background: #F0F0F0;
      border: 1px solid #000000;
      cursor: pointer;
      display: flex;
      font-size: 18px;
      min-height: 80px;
      flex-direction: column;
      justify-content: space-between;
      padding: 8px;
    }

    .card:not(:last-child) {
      margin-right: 8px;
    }

    .card span:last-child {
      font-size: 8px;
    }
  `;

  onReturnToMenu() {
    const event = new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: 'menu',
    });
    this.dispatchEvent(event);
  }

  buildHand() {
    return this.hand
      .map(
        card => html`<li class="card">
          <span>${card.text}</span>
          <span>${card.version}</span>
        </li>`
      );
  }

  render() {
    return html`
      <main>
        <button @click=${this.onReturnToMenu}>Back</button>

        <ul id="hand">
          ${this.buildHand()}
        </ul>
      </main>
    `;
  }
}

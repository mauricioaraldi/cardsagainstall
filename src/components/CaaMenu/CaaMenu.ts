import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('caa-menu')
export class CaaMenu extends LitElement {
  @property({ type: Boolean }) show: boolean = false;

  static styles = css`
    nav {
      background-color: #FFFFFF;
      bottom: 0;
      display: none;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    nav.show {
      display: block;
    }

    header {
      display: flex;
    }

    header > h2 {
      flex-grow: 1;
    }

    header > button {
      width: 40px;
    }
  `;

  onCloseMenu() {
    const event = new CustomEvent('closeMenu', {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  onChangeDevice() {
    const event = new CustomEvent('changeDevice', {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  render() {
    return html`
      <nav class="${this.show ? 'show' : ''}">
        <header>
          <h2>MENU</h2>
          <button @click=${this.onCloseMenu}>X</button>
        </header>

        <button @click=${this.onChangeDevice}>Change device</button>
      </nav>
    `;
  }
}

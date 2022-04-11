import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('caa-menu')
export class CaaMenu extends LitElement {
  @property({ type: Boolean }) show: boolean = false;
  @property({ type: Array }) players: Player[] = [];
  @property({ type: Boolean }) isKickingPlayer: boolean = false;

  static styles = css`
    nav {
      background-color: #FFFFFF;
      bottom: 0;
      display: none;
      flex-direction: column;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    nav.overmenu {
      z-index: 2;
    }

    nav.show {
      display: flex;
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

    nav > button:not(:first-child) {
      margin-top: 16px;
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

  onToggleKickPlayerMenu(state: boolean) {
    this.isKickingPlayer = state;
  }

  onKickPlayer(name: string) {
    const kickPlayerEvent = new CustomEvent('kickPlayer', {
      bubbles: true,
      composed: true,
      detail: name,
    });

    this.dispatchEvent(kickPlayerEvent);

    const closeMenuEvent = new CustomEvent('closeMenu', {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(closeMenuEvent);
  }

  renderKickPlayerMenu() {
    if (!this.isKickingPlayer) {
      return html``;
    }

    return html`
      <nav class="overmenu show">
        <header>
          <h2>Select a player to kick</h2>
          <button @click=${() => this.onToggleKickPlayerMenu(false)}>X</button>
        </header>

        ${this.players.map(player => html`
          <button @click=${() => this.onKickPlayer(player.name)}>${player.name}</button>
        `)}
      </nav>
    `;
  }

  render() {
    return html`
      <nav class="${this.show ? 'show' : ''}">
        <header>
          <h2>MENU</h2>
          <button @click=${this.onCloseMenu}>X</button>
        </header>

        <button @click=${this.onChangeDevice}>Change device</button>
        <button @click=${() => this.onToggleKickPlayerMenu(true)}>Kick player</button>

        ${this.renderKickPlayerMenu()}
      </nav>
    `;
  }
}

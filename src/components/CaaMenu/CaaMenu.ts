import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import globalStyles from '../../globalStyles.js';
import styleVars from '../../stylesVariables.js';

@customElement('caa-menu')
export class CaaMenu extends LitElement {
  @property({ type: Boolean }) show: boolean = false;
  @property({ type: Array }) players: Player[] = [];
  @property({ type: Boolean }) isKickingPlayer: boolean = false;

  static styles = [
    globalStyles,
    css`
      nav {
        background-color: ${styleVars.color.white};
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
        width: 60px;
      }

      nav > div {
        display: flex;
        flex-direction: column;
        padding: ${styleVars.spacing.xl};
      }

      nav > div > button:not(:first-child) {
        margin-top: ${styleVars.spacing.xl};
      }
    `
  ];

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

    this.onToggleKickPlayerMenu(false);
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

        <div>
          <button @click=${this.onChangeDevice}>Change device</button>
          <button @click=${() => this.onToggleKickPlayerMenu(true)}>Kick player</button>
        </div>

        ${this.renderKickPlayerMenu()}
      </nav>
    `;
  }
}

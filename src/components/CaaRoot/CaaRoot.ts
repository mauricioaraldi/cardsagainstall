// @ts-nocheck
// import { io, Socket } from 'socket.io-client';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../CaaGame/CaaGame';

@customElement('caa-root')
export class CaaRoot extends LitElement {
  @property({ type: String }) title: string = 'Cards Against All';
  @property({ type: String }) currentPage: string = 'menu';
  @property({ type: String }) playerName: string = '';
  @property({ type: String }) deviceCode: string = '';
  @property({ type: Array }) hand: Card[] = [];
  @property({ type: Object }) question?: Card;
  @property({ type: Boolean }) cardsLocked: boolean = false;
  @property({ type: Array }) players: Player[] = [];
  @property({ type: Array }) answers: any[] | null = null;
  @property({ type: Boolean }) pickingAnswer: boolean = false;
  @property({ type: Boolean }) master: boolean = false;
  @property({ type: Boolean }) isChangingDevice: boolean = false;

  // socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('ws://localhost:3000');
  isAuthenticating: boolean = false;
  address: string = '@@ENV_BACK_END_ADDRESS@@';
  socket: any = io(
    this.address.includes('@@')
      ? `http://${location.hostname}:3000`
      : this.address
  );
  static styles = css`
    main {
      display: flex;
      flex-direction: column;
    }

    button,
    input {
      margin-bottom: 16px;
    }

    #change-device-button {
      background-color: none;
      border: none;
      text-decoration: underline;
    }

    #upload-menu {
      display: none;
      margin-top: 30px;
    }

    #other-options {
      margin-top: 30px;
    }
  `;

  onNavigate(ev: any) {
    this.currentPage = ev.detail;
  }

  onStart() {
    if (!this.playerName.trim()) {
      alert('Invalid name');
      return;
    }

    this.socket.emit('playerName', {
      userName: this.playerName.trim(),
      deviceCode: this.deviceCode,
    });

    this.authenticating = true;
  }

  onChooseCards(ev) {
    this.socket.emit(
      'chooseCards',
      ev.detail.map(card => card.id)
    );
  }

  onRevealAnswer() {
    this.socket.emit('revealAnswer');
  }

  onPickAnswer(ev) {
    this.socket.emit('pickAnswer', ev.detail.id);
  }

  onReset() {
    this.socket.emit('resetGames');
  }

  onChangeDevice() {
    this.socket.emit('changeDevice');
  }

  onKickPlayer(ev) {
    this.socket.emit('kickPlayer', ev.detail);
  }

  connectedCallback() {
    super.connectedCallback();
    this.socket.on('question', question => (this.question = question));

    this.socket.on('cardsLocked', isLocked => (this.cardsLocked = isLocked));

    this.socket.on('players', players => (this.players = players));

    this.socket.on('answers', answers => {
      this.answers = answers;
      this.requestUpdate();
    });

    this.socket.on('master', isMaster => {
      this.cardsLocked = isMaster;
      this.master = isMaster;
    });

    this.socket.on(
      'pickAnswer',
      isPickingAnswer => (this.pickingAnswer = isPickingAnswer)
    );

    this.socket.on('hand', cards => {
      this.hand = cards;
    });

    this.socket.on('enterGame', () => {
      this.currentPage = 'game';
    });

    this.socket.on('deviceCode', code => {
      alert(`Use this code on new device: ${code}`);
    });

    this.socket.on('error', message => {
      alert(message);
    });

    this.socket.on('kicked', () => {
      alert('You have been kicked');
      this.currentPage = 'menu';
    });
  }

  renderDeviceCode() {
    if (!this.isChangingDevice) {
      return html``;
    }

    return html`
      <input
        type="text"
        name="name"
        placeholder="Insert device code"
        value="${this.deviceCode}"
        @input=${e => (this.deviceCode = e.target.value)}
      />
    `;
  }

  renderDeviceCodeButton() {
    if (this.isChangingDevice) {
      html``;
    }

    return html`<button
      id="change-device-button"
      @click=${() => (this.isChangingDevice = true)}
    >
      Changing device?
    </button>`;
  }

  renderPage() {
    switch (this.currentPage) {
      case 'game':
        return html`<caa-game
          .hand=${this.hand}
          .question=${this.question}
          .players=${this.players}
          .cardsLocked=${this.cardsLocked}
          .answers=${this.answers}
          .pickingAnswer=${this.pickingAnswer}
          .master=${this.master}
          @changeDevice=${this.onChangeDevice}
          @chooseCards=${this.onChooseCards}
          @kickPlayer=${this.onKickPlayer}
          @navigate=${this.onNavigate}
          @revealAnswer=${this.onRevealAnswer}
          @pickAnswer=${this.onPickAnswer}
        ></caa-game>`;

      default:
        return html`
          <main>
            <h1>${this.title}</h1>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value="${this.playerName}"
              @input=${e => (this.playerName = e.target.value)}
            />

            ${this.renderDeviceCode()}

            <button
              ${this.isAuthenticating ? 'disabled' : ''}
              @click=${this.onStart}
            >
              Start
            </button>

            ${this.renderDeviceCodeButton()}

            <div id="upload-menu">
              <label>
                <span>Upload deck</span>
                <input type="file" />
              </label>
            </div>

            <div id="other-options">
              <button @click=${this.onReset}>Reset games</button>
            </div>
          </main>
        `;
    }
  }

  render() {
    return html` ${this.renderPage()} `;
  }
}

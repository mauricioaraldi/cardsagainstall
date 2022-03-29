// @ts-nocheck
// import { io, Socket } from 'socket.io-client';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../CaaGame/CaaGame';
import '../CaaMenu/CaaMenu';

@customElement('caa-root')
export class CaaRoot extends LitElement {
  @property({ type: String }) title: string = 'Cards Against All';
  @property({ type: String }) currentPage: string = 'menu';
  @property({ type: String }) playerName: string = '';
  @property({ type: Array }) hand: Card[] = [];
  @property({ type: Object }) question?: Card;
  @property({ type: Boolean }) cardsLocked: boolean = false;
  @property({ type: Array }) players: Player[] = [];
  @property({ type: Array }) answers: any[] | null = null;
  @property({ type: Boolean }) pickingAnswer: boolean = false;
  @property({ type: Boolean }) master: boolean = false;

  // socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('ws://localhost:3000');
  address: string = '@@ENV_BACK_END_ADDRESS@@';
  socket: any = io(
    this.address.includes('@@')
      ? `http://${location.hostname}:3000`
      : this.address
  );
  static styles = css`
    input {
      margin-bottom: 16px;
    }

    #upload-menu {
      display: none;
      margin-top: 200px;
    }

    #other-options {
      margin-top: 100px;
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

  onReset(){
    this.socket.emit('resetGames');
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
          @navigate=${this.onNavigate}
          @chooseCards=${this.onChooseCards}
          @revealAnswer=${this.onRevealAnswer}
          @pickAnswer=${this.onPickAnswer}
        ></caa-game>`;

      default:
        return html`
          <h1>${this.title}</h1>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value="${this.playerName}"
            @change=${e => (this.playerName = e.target.value)}
          />
          <caa-menu
            @navigate=${this.onNavigate}
            @start=${this.onStart}
          ></caa-menu>

          <div id="upload-menu">
            <label>
              <span>Upload deck</span>
              <input type="file" />
            </label>
          </div>

          <div id="other-options">
            <button @click=${this.onReset}>Reset games</button>
          </div>
        `;
    }
  }

  render() {
    return html` ${this.renderPage()} `;
  }
}

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
  @property({ type: Array }) answers: any[] = [];
  @property({ type: Boolean }) pickingAnswer: boolean = false;

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

  onChooseCards(ev) {
    this.socket.emit('chooseCards', ev.detail.map(card => card.id));
  }

  onRevealAnswer() {
    this.socket.emit('revealAnswer');
  }

  onPickAnswer(ev) {
    this.socket.emit('pickAnswer', ev.detail.id);
  }

  connectedCallback() {
    super.connectedCallback()
    this.socket.on('question', question => this.question = question);

    this.socket.on('cardsLocked', isLocked => this.cardsLocked = isLocked);

    this.socket.on('players', players => this.players = players);

    this.socket.on('answers', answers => {
      this.answers = answers;
      this.requestUpdate();
    });

    this.socket.on('master', isMaster => this.cardsLocked = isMaster);

    this.socket.on('pickAnswer', isPickingAnswer => this.pickingAnswer = isPickingAnswer);
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
          @navigate=${this.onNavigate}
          @chooseCards=${this.onChooseCards}
          @revealAnswer=${this.onRevealAnswer}
          @pickAnswer=${this.onPickAnswer}
        ></caa-game>`;

      default:
        return html`
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value="${this.playerName}"
            @change=${e => (this.playerName = e.target.value)}
          />
          <caa-menu @navigate=${this.onNavigate} @start=${this.onStart}></caa-menu>
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

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../CaaCard/CaaCard';

@customElement('caa-game')
export class CaaGame extends LitElement {
  @property({ type: Array }) hand: Card[] = [];
  @property({ type: Array }) selectedCards: Card[] = [];
  @property({ type: Object }) question?: Question;
  @property({ type: Boolean }) cardsLocked: boolean = false;
  @property({ type: Boolean }) pickingAnswer: boolean = false;
  @property({ type: Array }) players: Player[] = [];
  @property({ type: Array }) answers: any[] | null = null;

  static styles = css`
    #players {
      background-color: #ffffff;
      border: 1px solid #000000;
      list-style-type: none;
      padding: 8px;
      position: absolute;
      right: 0;
      text-align: left;
    }

    #players > li {
      color: #00ff00;
      display: flex;
    }

    #players > li.choosing {
      color: #ff0000;
    }

    #players > li:not(:last-child) {
      margin-bottom: 4px;
    }

    #players > li > span {
      margin-left: auto;
      padding-left: 4px;
    }

    #answers {
      display: flex;
      justify-content: space-around;
    }

    h2 {
      display: block;
      font-size: 14px;
    }

    #hand-container {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
    }

    #hand {
      display: flex;
      margin: 0;
      padding: 8px;
    }

    caa-card[question='true'] {
      display: inline-block;
    }

    .card-container {
      list-style-type: none;
    }

    .card-container:not(:last-child) {
      margin-right: 8px;
    }
  `;

  onSelectCard(card: Card) {
    if (this.cardsLocked) {
      return;
    }

    if (card.selectedAs) {
      this.selectedCards.splice(card.selectedAs - 1, 1);
      card.selectedAs = 0;

      this.selectedCards.forEach(
        (card, index) => (card.selectedAs = index + 1)
      );
    } else {
      const pick = this.question ? this.question.pick : 1;

      if (this.selectedCards.length + 1 > pick) {
        return;
      }

      card.selectedAs = this.selectedCards.length + 1;
      this.selectedCards.push(card);
    }

    this.requestUpdate();
  }

  renderHand() {
    return this.hand.map(
      card => html`
        <li class="card-container" }>
          <caa-card
            selectedAs=${card.selectedAs}
            text=${card.text}
            version=${card.version}
            @click=${() => this.onSelectCard(card)}
          ></caa-card>
        </li>
      `
    );
  }

  renderPlayers() {
    return this.players.map(player => {
      const status = player.status === 'ready' ? 'V' : 'X';

      return html`
        <li class="${player.status}">
          (${player.score}) ${player.name} - ${player.status}
          <span>${player.status === 'master' ? 'O' : status}</span>
        </li>
      `;
    });
  }

  onChooseCards() {
    const event = new CustomEvent('chooseCards', {
      bubbles: true,
      composed: true,
      detail: this.selectedCards,
    });

    this.dispatchEvent(event);

    this.selectedCards = [];
  }

  renderChooseButton() {
    const pick = this.question ? this.question.pick : 1;

    if (this.selectedCards.length !== pick || this.cardsLocked) {
      return html``;
    }

    return html`<button @click=${this.onChooseCards}>Choose!</button>`;
  }

  onRevealAnswer() {
    const event = new CustomEvent('revealAnswer', {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  onPickAnswer(card: Card) {
    const event = new CustomEvent('pickAnswer', {
      bubbles: true,
      composed: true,
      detail: card,
    });

    this.dispatchEvent(event);
  }

  renderAnswers() {
    if (!this.answers) {
      return html``;
    }

    return this.answers.map(answer => {
      if (!answer.length) {
        return html`
          <caa-card .hidden=${true} @click=${this.onRevealAnswer}></caa-card>
        `;
      }

      const cards = answer.map(
        (card: Card) =>
          html`
            <caa-card 
              .text=${card.text}
              .version=${card.version}
              @click=${() => this.onPickAnswer(card)}
            ></caa-card>
          `
      );

      return html`<div>${cards}</div>`;
    });
  }

  renderAnswerTitle() {
    if (!this.answers) {
      return html``;
    }

    if (this.answers && !this.pickingAnswer) {
      return `Click to reveal answers`;
    }

    if (this.answers && !this.pickingAnswer) {
      return `Choose an answer`;
    }
  }

  render() {
    return html`
      <main>
        <caa-card
          .question=${true}
          .text=${this.question?.text}
          .version=${this.question?.version}
        ></caa-card>

        <h2>${this.renderAnswerTitle()}</h2>
        <div id="answers">${this.renderAnswers()}</div>

        <ul id="players">
          ${this.renderPlayers()}
        </ul>

        <div id="hand-container">
          ${this.renderChooseButton()}
          <ul id="hand">
            ${this.renderHand()}
          </ul>
        </div>
      </main>
    `;
  }
}

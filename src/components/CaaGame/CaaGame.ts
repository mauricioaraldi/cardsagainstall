import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../CaaCard/CaaCard';
import '../CaaMenu/CaaMenu';

import globalStyles from '../../globalStyles.js';
import styleVars from '../../stylesVariables.js';

@customElement('caa-game')
export class CaaGame extends LitElement {
  @property({ type: Array }) hand: Card[] = [];
  @property({ type: Array }) selectedCards: Card[] = [];
  @property({ type: Object }) question?: Question;
  @property({ type: Boolean }) cardsLocked: boolean = false;
  @property({ type: Boolean }) pickingAnswer: boolean = false;
  @property({ type: Array }) players: Player[] = [];
  @property({ type: Array }) answers: any[] | null = null;
  @property({ type: Boolean }) master: boolean = false;

  isShowingMenu: boolean = false;

  static styles = [
    globalStyles,
    css`
      .hidden {
        display: none;
      }

      aside {
        display: flex;
      }

      #menu-button {
        width: 40px;
      }

      #players {
        background-color: ${styleVars.color.white};
        border: 1px solid ${styleVars.color.black};
        flex-grow: 1;
        font-size: ${styleVars.font.xs};
        list-style-type: none;
        margin: 0;
        max-height: 50px;
        overflow: auto;
        padding: ${styleVars.spacing.s};
        right: 0;
        text-align: left;
      }

      #players > li {
        color: ${styleVars.color.green};
        display: flex;
      }

      #players > li.choosing {
        color: ${styleVars.color.red};
      }

      #players > li:not(:last-child) {
        margin-bottom: ${styleVars.spacing.xs};
      }

      #players > li > span {
        margin-left: auto;
        padding-left: ${styleVars.spacing.xs};
      }

      #answers-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        justify-content: center;
      }

      #answers {
        display: flex;
        overflow: auto;
      }

      #answers > div:not(:last-child) {
        margin-right: ${styleVars.spacing.s};
      }

      #choose-button {
        margin-top: ${styleVars.spacing.m};
      }

      h2 {
        display: block;
        font-size: ${styleVars.font.s};
        margin: ${styleVars.spacing.xs} 0;
      }

      #hand-container {
        bottom: 0;
        left: 0;
        overflow-x: auto;
        position: absolute;
        right: 0;
      }

      #hand {
        display: flex;
        margin: 0;
        padding: ${styleVars.spacing.s};
      }

      .card-container {
        list-style-type: none;
      }

      .card-container:not(:last-child) {
        margin-right: ${styleVars.spacing.s};
      }

      @media (min-width: 640px) {
        #main-container {
          display: flex;
          flex-direction: row-reverse;
        }

        #question {
          display: inline-block;
          max-width: 420px;
          margin: ${styleVars.spacing.s};
        }

        #players {
          font-size: ${styleVars.font.s};
          max-height: 300px;
          min-width: 180px;
        }

        #answers-container {
          overflow: auto;
          padding: ${styleVars.spacing.s};
        }
      }
    `
  ];

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

    return html`<button id="choose-button" @click=${this.onChooseCards}>Choose!</button>`;
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

  onToggleMenu(menuState: boolean = !this.isShowingMenu) {
    this.isShowingMenu = menuState;
    this.requestUpdate();
  }

  onChangeDevice() {
    const event = new CustomEvent('changeDevice', {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  onKickPlayer(ev: CustomEvent) {
    this.dispatchEvent(ev);
  }

  renderAnswers() {
    if (!this.answers) {
      return html``;
    }

    return this.answers.map(answer => {
      if (!answer.length) {
        return html`
          <div>
            <caa-card .hidden=${true} @click=${this.onRevealAnswer}></caa-card>
          </div>
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
    if (!this.master && !this.selectedCards.length && !this.cardsLocked) {
      return html`Pick your answer`;
    }

    if (!this.master && this.selectedCards.length && !this.cardsLocked) {
      return html`Lock your answer`;
    }

    if (!this.master && this.cardsLocked) {
      return html`Wait for master to choose an answer`;
    }

    if (this.master && !this.answers) {
      return html`Wait for players to pick their answers`;
    }

    if (this.master && !this.pickingAnswer) {
      return `Click to reveal answers`;
    }

    if (this.master) {
      return `Choose an answer`;
    }
  }

  render() {
    return html`
      <main>
        <caa-card
          id="question"
          .question=${true}
          .text=${this.question?.text}
          .version=${this.question?.version}
        ></caa-card>

        <div id="main-container">
          <aside>
            <ul id="players">
              ${this.renderPlayers()}
            </ul>
            <button id="menu-button" @click=${this.onToggleMenu}>+</button>
          </aside>

          <div id="answers-container">
            <h2>${this.renderAnswerTitle()}</h2>
            <div id="answers">${this.renderAnswers()}</div>
          </div>
        </div>

        <div class="${this.cardsLocked ? 'hidden' : ''}">
          ${this.renderChooseButton()}
          
          <div id="hand-container">
            <ul id="hand">
              ${this.renderHand()}
            </ul>
          </div>
        </div>

        <caa-menu
          .show=${this.isShowingMenu}
          .players=${this.players}
          @closeMenu=${() => this.onToggleMenu(false)}
          @changeMenu=${() => this.onChangeDevice()}
          @kickPlayer=${this.onKickPlayer}
        ></caa-menu>
      </main>
    `;
  }
}

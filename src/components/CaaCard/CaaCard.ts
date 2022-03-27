import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('caa-card')
export class CaaCard extends LitElement {
  @property({ type: Number }) selectedAs?: number;
  @property({ type: String }) text: string = '';
  @property({ type: String }) version: string = '';
  @property({ type: Boolean }) question: boolean = false;
  @property({ type: Boolean }) hidden: boolean = false;

  static styles = css`
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
      position: relative;
    }

    .card[question="true"] {
      background-color: #000000;
      color: #F0F0F0;
    }

    .card[hidden="true"] {
      background-color: #FFFFFF;
      height: 80px;
      width: 80px;
    }

    .card > span:last-child {
      font-size: 8px;
    }

    .selected-as {
      background-color: #FF0000;
      color: #F0F0F0;
      left: 0;
      padding: 2px 6px;
      position: absolute;
      top: 0;
    }
  `;

  renderSelectedAs(selectedAs?: number) {
    if (!selectedAs) {
      return html``;
    }

    return html`<span class="selected-as">${selectedAs}</span>`;
  }

  render() {
    return html`
      <span class="card" question="${this.question}" hidden="${this.hidden}">
        ${this.renderSelectedAs(this.selectedAs)}
        <span>${this.text}</span>
        <span>${this.version}</span>
      </span>
    `;
  }
}

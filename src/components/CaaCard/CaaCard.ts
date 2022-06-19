import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import globalStyles from '../../globalStyles.js';
import styleVars from '../../stylesVariables.js';

@customElement('caa-card')
export class CaaCard extends LitElement {
  @property({ type: Number }) selectedAs?: number;
  @property({ type: String }) text: string = '';
  @property({ type: String }) version: string = '';
  @property({ type: Boolean }) question: boolean = false;
  @property({ type: Boolean }) hidden: boolean = false;

  static styles = [
    globalStyles,
    css`
      .card {
        align-items: flex-start;
        background: ${styleVars.color.gray90};
        border: 1px solid ${styleVars.color.black};
        cursor: pointer;
        display: flex;
        font-size: ${styleVars.font.l};
        flex-direction: column;
        justify-content: space-between;
        padding: ${styleVars.spacing.s};
        position: relative;
      }

      .card[question="true"] {
        background-color: ${styleVars.color.black};
        color: ${styleVars.color.gray90};
      }

      .card[hidden="true"] {
        background-color: ${styleVars.color.white};
        height: 80px;
        width: 80px;
      }

      .card > span:last-child {
        margin-top: ${styleVars.spacing.m};
        font-size: ${styleVars.font.xs};
      }

      .selected-as {
        background-color: ${styleVars.color.red};
        color: ${styleVars.color.gray90};
        left: 0;
        padding: 2px 6px;
        position: absolute;
        top: 0;
      }

      @media (min-width: 320px) {
        .card:not([question="true"]) {
          font-size: ${styleVars.font.s};
          min-height: 80px;
        }
      }

      @media (min-width: 480px) {
        .card:not([question="true"]) {
          font-size: ${styleVars.font.m};
        }
      }

      @media (min-width: 780px) {
        .card:not([question="true"]) {
          font-size: ${styleVars.font.l};
        }
      }

      @media (min-width: 1024px) {
        .card,
        .card:not([question="true"]) {
          font-size: ${styleVars.font.xl};
        }
      }
    `
  ];

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

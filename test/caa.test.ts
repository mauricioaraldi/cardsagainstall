import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { CaaRoot } from '../src/components/CaaRoot/CaaRoot.js';
import '../src/components/CaaRoot/caa-root.js';

describe('CaaRoot', () => {
  let element: CaaRoot;
  beforeEach(async () => {
    element = await fixture(html`<caa-root></caa-root>`);
  });

  it('renders a h1', () => {
    const h1 = element.shadowRoot!.querySelector('h1')!;
    expect(h1).to.exist;
    expect(h1.textContent).to.equal('Cards Against All');
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});

import { html, TemplateResult } from 'lit';
import '../src/components/CaaRoot/caa-root.js';

export default {
  title: 'Caa',
  component: 'caa-root',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  title?: string;
  backgroundColor?: string;
}

const Template: Story<ArgTypes> = ({ title, backgroundColor = 'white' }: ArgTypes) => html`
  <caa-root style="--caa-background-color: ${backgroundColor}" .title=${title}></caa-root>
`;

export const App = Template.bind({});
App.args = {
  title: 'Cards Against All',
};

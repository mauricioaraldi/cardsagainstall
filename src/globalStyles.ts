import { css } from 'lit';

import styleVars from './stylesVariables.js';

export default css`
  button {
    font-size: ${styleVars.font.m};
    padding: ${styleVars.spacing.s};
  }

  input {
    font-size: ${styleVars.font.m};
    padding: ${styleVars.spacing.s};
  }
`;
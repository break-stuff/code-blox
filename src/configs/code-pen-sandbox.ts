import { mergeDeep } from '../utilities/deep-merge';
import { formatCode } from '../utilities/format-code';
import { componentConfig, ComponentConfig } from './component-config';

export type CpSandboxConfig = {
  html?: ProjectConfig;
  react?: ProjectConfig;
};

export type ProjectConfig = {
  project?: CodePenProjectConfig;
  exampleTemplate: ExampleTemplateConfig;
};

export type ExampleTemplateConfig = {
  fileName: 'html' | 'css' | 'js';
  template: (example: string) => string;
};

export type CodePenProjectConfig = {
  /** Pen title */
  title?: string;
  /** Pen description */
  description?: string;
  /** When the Pen is saved, it will save as Private if logged in user has that privledge, otherwise it will save as public */
  private?: boolean;
  /** If supplied, the Pen will save as a fork of this id. Note it's not the slug, but ID. You can find the ID of a Pen with `window.CP.pen.id` in the browser console. */
  parent?: string;
  /** Words to help identify and categorize the sandbox */
  tags?: string[];
  /** Set which editors are open. "1" is open and "0" is collapsed. The order is "HTML", "CSS", and "JS" */
  editors?: '001' | '010' | '100' | '011' | '101' | '110' | '111';
  layout?: 'top' | 'left' | 'right';
  /** Content in the HTML panel */
  html?: string;
  html_pre_processor?: 'none' | 'slim' | 'haml' | 'markdown';
  /** Content in the HTML panel */
  css?: string;
  css_pre_processor?: 'none' | 'less' | 'scss' | 'sass' | 'stylus';
  css_starter?: 'normalize' | 'reset' | 'neither';
  css_prefix?: 'autoprefixer' | 'prefixfree' | 'neither';
  /** Content in the HTML panel */
  js?: string;
  js_pre_processor?:
    | 'none'
    | 'coffeescript'
    | 'babel'
    | 'livescript'
    | 'typescript';
  /** Class names applied to the `<html>` element */
  html_classes?: string;
  /** Content for the `<head>` tag */
  head?: string;
  /** Semi-colon separate list of CDN urls to include in the pen */
  css_external?: string;
  /** Semi-colon separate list of CDN urls to include in the pen */
  js_external?: string;
};

export type CodePenConfig = {
  component?: ComponentConfig;
  sandbox?: CpSandboxConfig;
};

const options: CpSandboxConfig = {
  html: {
    project: {
      title: 'HTML Example',
      description: 'Example of using the code in HTML.',
      private: false,
      tags: ['html', 'example'],
      editors: '111',
      layout: 'top',
      html: '<div>HTML here.</div>',
      css: `body { 
  font: 16px sans-serif; 
  padding: 1rem; 
}`,
      js: ``,
    },
    exampleTemplate: {
      fileName: 'html',
      template: example => example,
    },
  },
  react: {
    project: {
      title: 'React Example',
      description: 'Example of using the code in React.',
      private: false,
      tags: ['react', 'example'],
      editors: '111',
      layout: 'top',
      html: '<div id="root"></div>',
      css: `body { 
  font: 16px sans-serif; 
  padding: 1rem; 
}`,
      js: `import React from 'react'; 
import ReactDOM from 'react-dom'; 
ReactDOM.render(<h1>Hello, world!</h1>, document.getElementById('root'));`,
      js_pre_processor: 'babel',
      js_external:
        'https://esm.sh/react@18.2.0;https://esm.sh/react-dom@latest',
    },
    exampleTemplate: {
      fileName: 'js',
      template: example => `import React from 'https://esm.sh/react@latest';
import ReactDOM from 'https://esm.sh/react-dom@latest';

const App = () => (
  <>
${example}
  </>
);

ReactDOM.render(<App />, document.getElementById('root'));
`,
    },
  },
};

export let configuration: CodePenConfig = {
  component: componentConfig,
  sandbox: options,
};

export function updateCodePenConfig(userConfig?: CodePenConfig) {
  configuration = mergeDeep(configuration as never, userConfig as never);
}

export async function useCodePenSandbox(example = '', exampleType = 'html') {
  const config = configuration.sandbox![exampleType as keyof CpSandboxConfig];
  if (!config) {
    throw new Error(`Invalid example type: ${exampleType}`);
  }

  const sandboxConfig = {
    ...config.project,
    [config.exampleTemplate.fileName]: await formatCode(
      config.exampleTemplate.template(example),
      exampleType,
    ),
  };

  const form = document.createElement('form');
  form.action = 'https://codepen.io/pen/define';
  form.method = 'POST';
  form.target = '_blank';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'data';
  input.value = JSON.stringify(sandboxConfig);
  form.append(input);

  document.documentElement.append(form);
  form.submit();
  form.remove();
}

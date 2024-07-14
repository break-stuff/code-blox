import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './code-block.styles.js';
import { ComponentConfig } from '../../configs/component-config.js';

export type CodeExamples = 'html' | 'react';

/**
 * @tag code-block
 */
export default class CodeBlock extends LitElement {
  static styles = [styles];

  /** Indicates which example should be displayed */
  @property({ reflect: true })
  example?: CodeExamples;

  @state()
  protected showSource = false;

  @state()
  protected showRTL = false;

  @state()
  protected componentConfig: ComponentConfig = {};

  protected openSandbox: (example?: string, exampleType?: string) => void =
    () => {};

  private htmlCode?: string;
  private reactCode?: string;

  connectedCallback(): void {
    super.connectedCallback();
    this.getCode();
  }

  firstUpdated(): void {
    const preview = document.createElement('div');
    preview.setAttribute('slot', 'preview');
    preview.innerHTML = this.htmlCode || '';
    this.appendChild(preview);
  }

  protected updateConfig() {
    this.updateComplete.then(() => {
      this.showSource = this.componentConfig.openShowCode!;
      this.example =
        (localStorage.getItem('code_block_example') as CodeExamples) ||
        this.componentConfig.defaultExample!;
    });
  }

  private getCode() {
    const htmlCodeBlock = this.querySelector('pre:has(code.language-html)');
    htmlCodeBlock?.setAttribute('slot', 'html');
    this.htmlCode = htmlCodeBlock?.querySelector('code')?.innerText;

    const reactCodeBlock = this.querySelector('pre:has(code.language-jsx)');
    reactCodeBlock?.setAttribute('slot', 'react');
    this.reactCode = reactCodeBlock?.querySelector('code')?.innerText;
  }

  private handleExampleClick(example: 'html' | 'react') {
    this.example = example;
    this.dispatchEvent(new CustomEvent('example-change', { detail: example }));
    localStorage.setItem('code_block_example', example);
  }

  private handleSandboxClick() {
    this.openSandbox(
      this.example === 'html' ? this.htmlCode : this.reactCode,
      this.example,
    );
  }

  private handleCopyClick(e: MouseEvent) {
    const button = e.target as HTMLButtonElement;
    navigator.clipboard.writeText(
      (this.example === 'html' ? this.htmlCode : this.reactCode) || '',
    );
    button.innerText = this.componentConfig.copyCodeButtonCopiedLabel!;
    setTimeout(
      () => (button.innerText = this.componentConfig.copyCodeButtonLabel!),
      1_000,
    );
  }

  render() {
    return html`
      <div>
        <div class="code-block-base">
          <div class="preview" dir=${this.showRTL ? 'rtl' : 'auto'}>
            <slot name="preview"></slot>
          </div>
          <details id="code-block" class="code-block" ?open=${this.showSource}>
            <!-- required to prevent the user-agent summery from displaying -->
            <summary></summary>
            <slot name="${this.example || 'html'}"></slot>
            <button
              class="copy-code"
              part="copy-button"
              @click=${this.handleCopyClick}
            >
              ${this.componentConfig.copyCodeButtonLabel}
            </button>
          </details>
          <div class="controls">
            <button
              aria-controls="code-block"
              aria-expanded=${this.showSource}
              @click=${() => (this.showSource = !this.showSource)}
            >
              ${this.componentConfig.showCodeButtonLabel}
            </button>
            <button
              aria-pressed=${this.example === 'html'}
              @click=${() => this.handleExampleClick('html')}
            >
              ${this.componentConfig.htmlButtonLabel}
            </button>
            <button
              aria-pressed=${this.example === 'react'}
              @click=${() => this.handleExampleClick('react')}
            >
              ${this.componentConfig.reactButtonLabel}
            </button>
            <button
              aria-pressed=${this.showRTL}
              @click=${() => (this.showRTL = !this.showRTL)}
            >
              ${this.componentConfig.rtlButtonLabel}
            </button>
            <button @click=${this.handleSandboxClick}>
              ${this.componentConfig.sandboxButtonLabel}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

export { CodeBlock };

import { Transform } from '../interpreter'

export const CssTransform = (): Transform => (code: string) => {
  return `
  function __esmSandbox__injectStyle(css) {
    const headEl = document.head || document.getElementsByTagName('head')[0];
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    if (styleEl.styleSheet) {
      styleEl.styleSheet.cssText = css;
    } else {
      styleEl.appendChild(document.createTextNode(css));
    }
    headEl.appendChild(styleEl);
  }
  __esmSandbox__injectStyle(${JSON.stringify(code)});\n`
}

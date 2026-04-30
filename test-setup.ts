import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/" });

(globalThis as typeof globalThis & { window: typeof globalThis.window }).window =
  window as unknown as typeof globalThis.window;
(globalThis as typeof globalThis & { document: typeof globalThis.document }).document =
  window.document as unknown as typeof globalThis.document;
(globalThis as typeof globalThis & { navigator: typeof globalThis.navigator }).navigator =
  window.navigator as unknown as typeof globalThis.navigator;
(globalThis as typeof globalThis & { HTMLElement: typeof HTMLElement }).HTMLElement =
  window.HTMLElement as unknown as typeof HTMLElement;
(globalThis as typeof globalThis & { SVGElement: typeof SVGElement }).SVGElement =
  window.SVGElement as unknown as typeof SVGElement;

// happy-dom QuerySelector expects these constructors on `window` (see SelectorParser.js).
Object.assign(window, {
   SyntaxError: globalThis.SyntaxError,
   Error: globalThis.Error,
});

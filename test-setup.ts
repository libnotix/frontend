import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/" });

(globalThis as typeof globalThis & { window: Window }).window =
   window as unknown as Window & typeof globalThis;
(globalThis as typeof globalThis & { document: Document }).document = window.document;
(globalThis as typeof globalThis & { navigator: Navigator }).navigator = window.navigator;
(globalThis as typeof globalThis & { HTMLElement: typeof HTMLElement }).HTMLElement =
   window.HTMLElement;
(globalThis as typeof globalThis & { SVGElement: typeof SVGSVGElement }).SVGElement =
   window.SVGElement;

// happy-dom QuerySelector expects these constructors on `window` (see SelectorParser.js).
Object.assign(window, {
   SyntaxError: globalThis.SyntaxError,
   Error: globalThis.Error,
});

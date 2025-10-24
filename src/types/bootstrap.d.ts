declare module 'bootstrap' {
  export type ModalOptions = {
    backdrop?: boolean | 'static';
    keyboard?: boolean;
    focus?: boolean;
  };

  export class Modal {
    constructor(element: Element | null, options?: ModalOptions);
    show(): void;
    hide(): void;
    dispose(): void;
    static getInstance(element: Element): Modal | null;
    static getOrCreateInstance(element: Element, options?: ModalOptions): Modal;
  }
}

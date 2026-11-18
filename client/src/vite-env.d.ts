/// <reference types="vite/client" />

declare module '*.html?raw' {
  const content: string;
  export default content;
}

declare module './legacy/js/app.js';

type MathFieldIntrinsicProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & Record<string, unknown>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': MathFieldIntrinsicProps;
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': MathFieldIntrinsicProps;
    }
  }
}

declare global {
  interface Window {
    MathfieldElement?: {
      soundsDirectory?: string | null;
    };
  }
}

export {};

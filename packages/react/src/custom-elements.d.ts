import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'event-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          org?: string;
        },
        HTMLElement
      >;
    }
  }
}

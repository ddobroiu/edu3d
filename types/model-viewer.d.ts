import type React from "react";

// <model-viewer> este un custom element, deci TypeScript are nevoie de tipul lui in JSX.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          ar?: boolean | string;
          "ar-modes"?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "shadow-intensity"?: string;
          "environment-image"?: string;
          "tone-mapping"?: string;
          exposure?: string;
          "touch-action"?: string;
          "camera-orbit"?: string;
          "ios-src"?: string;
          "disable-zoom"?: boolean | string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};

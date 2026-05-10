export {};

declare global {
  interface Window {
    /** Google reCAPTCHA v2 (`api.js`) or v3 (`api.js?render=key`). */
    grecaptcha?: {
      ready(cb: () => void): void;
      render(
        container: HTMLElement,
        params: {
          sitekey: string;
          theme?: "light" | "dark";
          size?: "normal" | "compact" | "invisible";
        },
      ): number;
      getResponse(widgetId?: number): string;
      reset(widgetId?: number): void;
      /** reCAPTCHA v3 */
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

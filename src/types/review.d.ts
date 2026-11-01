declare module '*/review.config.js' {
  export interface ReviewOption {
    id: string;
    label: string;
    positiveOnly: boolean;
  }

  export interface ReviewConfig {
    RESTAURANT_NAME: string;
    AREA: string;
    CITY: string;
    GOOGLE_REVIEW_URL: string;
    API_ENDPOINT: string;
    DEBOUNCE_MS: number;
    FIRST_TOKEN_TIMEOUT_MS: number;
    HARD_TIMEOUT_MS: number;
    STAR_LABELS: string[];
    OPTIONS: ReviewOption[];
    UI: {
      pageTitle: string;
      ratingHeading: string;
      positiveAspectsHeading: string;
      improveAspectsHeading: string;
      reviewBoxLabel: string;
      reviewPlaceholder: string;
      regenerateButtonText: string;
      polishingIndicator: string;
      submitButtonText: string;
      submitDisclaimer: string;
      reviewCopiedState: {
        heading: string;
        instructions: string;
        copyAgainText: string;
        openGoogleAgainText: string;
        copiedSuccessToast: string;
      };
      backToHomeText: string;
    };
    SERVER: {
      DEFAULT_MODEL: string;
      RATE_LIMIT_PER_MIN: number;
      RATE_LIMIT_PER_DAY: number;
    };
  }

  export const REVIEW_CONFIG: ReviewConfig;
}

declare module '*/reviewTemplates.js' {
  export function buildLocalDraft(stars: number, selectedIds: string[], seed?: number, optionsList?: any[]): string;
  export const PHRASE_BANK: any;
}


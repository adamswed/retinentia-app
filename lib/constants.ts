export const TERMS_VERSION = '2026-01-01';
export const PRIVACY_VERSION = '2026-01-01';
export const MAX_INDEX_CARDS = 300;
export const MAX_DAILY_AI_DEFINITION_QUOTA =
  process.env.AI_DEFINITION_QUOTA
    ? parseInt(process.env.AI_DEFINITION_QUOTA, 10)
    : process.env.NODE_ENV === 'development'
      ? 3
      : 300;
export const NO_INDEX_METADATA = {
  robots: { index: false, follow: false, nocache: true },
};

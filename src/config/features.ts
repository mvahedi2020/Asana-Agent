export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE_TOGGLE: true,
  ENABLE_BETA_DASHBOARD: false,
  ENABLE_AI_ASSISTANT: process.env.NODE_ENV === 'development',
};

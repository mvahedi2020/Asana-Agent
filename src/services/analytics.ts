export const trackEvent = (eventName: string, data?: any) => {
  if (process.env.NODE_ENV === "production") {
    // Send to real analytics provider
  } else {
    console.log(`[Analytics] ${eventName}`, data);
  }
};

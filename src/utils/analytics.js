/**
 * Analytics Utility
 * Centralized place to handle all analytics tracking.
 * Currently logs to console, but can be easily extended to support Google Analytics, etc.
 */

export const trackEvent = (eventName, data = {}) => {
    // Log to console for development/verification
    console.log(`[Analytics] Event: ${eventName}`, data);

    // TODO: Insert real analytics code here
    // Example:
    // if (window.gtag) {
    //     window.gtag('event', eventName, data);
    // }
};

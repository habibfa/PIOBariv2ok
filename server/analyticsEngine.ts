export {
  initAnalyticsEngine,
  getActiveUsersCount,
  trackTelemetry,
  recordHeartbeat,
  getAggregatedAnalytics,
  getStoredEvents,
  resetAnalyticsStore,
  anonymizeIP,
  extractClientIP,
  type CustomEventRecord,
  type PageViewRecord,
  type ActiveSession,
  type AnalyticsStoreData
} from "../api/_analyticsEngine.js";

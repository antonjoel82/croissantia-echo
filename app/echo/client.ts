import { Echo } from "@novu/echo";

export const echo = new Echo({
  /**
   * Enable this flag only during local development
   */
  devModeBypassAuthentication: process.env.NODE_ENV === "development",
  apiKey: process.env.NOVU_API_KEY,
});

echo.workflow("my-workflow", async ({ step, payload }) => {
  /** our code here */
});

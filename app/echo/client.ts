import { Echo } from "@novu/echo";
import { initGather } from "../gather/gather";
import { Novu } from "@novu/node";

export const echo = new Echo({
  /**
   * Enable this flag only during local development
   */
  devModeBypassAuthentication: process.env.NODE_ENV === "development",
  apiKey: process.env.NOVU_API_KEY,
});

const novu = new Novu(process.env.NOVU_API_KEY as string);

echo.workflow(
  "my-workflow",
  async ({ step, payload }) => {
    await step.chat(
      "send-slack-msg",
      async () => {
        return {
          body: `
          It's coffee time! ☕️ Join us in the kitchenette!
          
People already here: ${payload.playerNames.join(", ")}
          `,
        };
      },
      {
        // I can't get this to work, seems to be ignored - only the step above is executed
        // @see https://docs.novu.co/echo/concepts/steps#channel-steps-interface
        providers: {
          slack: async ({ inputs, outputs }) => ({
            blocks: [
              {
                type: "section",
                text: { type: "mrkdwn", text: outputs.body + "test" },
              },
              {
                type: "image",
                image_url: payload.imageUrl,
                alt_text: "coffee",
              },
            ],
            webhookUrl: process.env.SLACK_WEBHOOK_URL,
          }),
        },
      }
    );
  },
  {
    payloadSchema: {
      type: "object",
      properties: {
        playerNames: { type: "array", items: { type: "string" }, default: [] },
        imageUrl: { type: "string" },
      },
    },
  }
);

initGather({
  onCoffeeTime: async (payload) => {
    const resp = await novu.trigger("my-workflow", {
      // Change this with your own target
      to: {
        subscriberId: "6634cb0e83064b959c81b912",
      },
      payload: {
        playerNames: payload.players.map((player) => player.name),
        imageUrl: payload.imageUrl,
      },
    });
  },
});

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
    const digestData = await step.digest("digest-step", async () => {
      return {
        unit: "seconds",
        amount: 10,
      };
    });

    await step.chat(
      "send-slack-msg",
      async () => {
        return {
          body: `
          It's coffee time! ☕️ Join us in the kitchenette!
          ${
            digestData.events.length > 1
              ? `This is the ${digestData.events.length} reminder, join us for coffee!!
          
          `
              : ""
          }
People already here: ${payload.playerNames.join(", ")}
          `,
        };
      },
      {
        providers: {
          slack: async ({ inputs, outputs }) => ({
            text: "It's coffee time! ☕️",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `It's coffee time! ☕️ Join us in the kitchenette!  

People already here: ${payload.playerNames.join(", ")}
                `,
                },
              },
              {
                type: "image",
                image_url: payload.imageUrl,
                alt_text: "coffee",
              },
            ],
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

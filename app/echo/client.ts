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
    await step.email(
      "send-email",
      async (inputs) => {
        return {
          subject: "This is an email subject",
          body: "E-mail body of hello " + inputs.world,
        };
      },
      {
        inputSchema: {
          type: "object",
          properties: { world: { type: "string", default: "World" } },
        },
      }
    );
  },
  { payloadSchema: { type: "object", properties: {} } }
);

initGather({
  onCoffeeTime: async () => {
    const resp = await novu.trigger("my-workflow", {
      // Change this with your own target
      to: {
        subscriberId: "joelTest",
        email: "joel@novu.co",
        firstName: "Joel",
        lastName: "Test",
      },
      payload: { world: "Coffee!" },
    });

    console.log(resp);
  },
});

import { Game, Player } from "@gathertown/gather-game-client";
import { isInBar, isInKitchenette } from "./locations";
import { generateImage } from "../img-gen/limewire";

const GATHER_API_KEY: string = process.env.GATHER_API_KEY || "";
const GATHER_SPACE_ID: string = process.env.GATHER_SPACE_ID || "";

export interface InitGatherOptions {
  onCoffeeTime?: (payload: {
    players: Player[];
    imageUrl: string;
  }) => void | PromiseLike<void>;
}

export const initGather = ({ onCoffeeTime }: InitGatherOptions = {}) => {
  const game = new Game(GATHER_SPACE_ID, () =>
    Promise.resolve({ apiKey: GATHER_API_KEY })
  );
  game.connect();
  game.subscribeToConnection((connected) =>
    console.log("connected?", connected)
  );

  /**
   * triggers when I person joins the office (or the websocket connection is established)
   * encId maps to a specific person.
   */
  game.subscribeToEvent("playerJoins", (data, _context) => {
    console.log(data);
  });

  /**
   * This one is noisy! Occurs for every step of every player
   */
  //   game.subscribeToEvent("playerMoves", (data, _context) => {
  //       console.log(data);
  //   });

  /**
   * triggers when a person emotes!
   */
  game.subscribeToEvent("playerSetsEmoteV2", async (data, _context) => {
    if (!data?.playerSetsEmoteV2?.emote || !_context.player) {
      return;
    }

    const {
      playerSetsEmoteV2: { emote },
    } = data;

    if (
      isCoffeeEmote(emote) &&
      (isInBar(_context.player) || isInKitchenette(_context.player))
    ) {
      console.log("It's coffee time!");

      const playersInLocation = game
        .getPlayersInMap(_context.player.map ?? "")
        .filter((player) => isInBar(player));

      // maybe we can include something else from the Player object in the prompt/msg

      // generate an image of people enjoying coffee
      const prompt =
        "A group of people enjoying a coffee in a kitchenette. Pixel art style.";
      // const imageUrl = await generateImage(prompt);

      // image URL for testing so we don't hit the API limit (10/day
      const testImageUrl =
        "https://www.shutterstock.com/image-vector/coffee-cup-pixel-art-mug-260nw-1887694882.jpg";

      // trigger echo!
      await onCoffeeTime?.({
        players: playersInLocation,
        imageUrl: testImageUrl,
      });
    }
  });

  /** THESE EVENTS MIGHT WORK, BUT I'M NOT SURE HOW TO TRIGGER */

  game.subscribeToEvent("playerChats", (data, _context) => {
    console.log(data);
  });

  game.subscribeToEvent("playerSendsCommand", (data, _context) => {
    console.log(data);
  });

  /** THESE DO NOT SEEM TO WORK */
  game.subscribeToEvent("playerInteractsWithObject", (data, _context) => {
    console.log(data);
  });

  game.subscribeToEvent("playerTriggersObject", (data, _context) => {
    console.log(data);
  });
};

function isCoffeeEmote(emote?: string): boolean {
  return ["☕"].includes(emote ?? "");
}

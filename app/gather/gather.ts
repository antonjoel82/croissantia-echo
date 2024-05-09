import { Game, Player } from "@gathertown/gather-game-client";
import { isInBar, isInKitchenette } from "./locations";
import { generateImage } from "../img-gen/limewire";

const GATHER_API_KEY: string = process.env.GATHER_API_KEY || "";
const GATHER_SPACE_ID: string = process.env.GATHER_SPACE_ID || "";

const ART_STYLES: string[] = [
  "sad lonely painting",
  "pixel art",
  "hyper realistic photo",
  "childish cartoon",
  "abstract painting",
  "construction paper art",
];

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
    // console.log(data);
  });

  /**
   * This one is noisy! Occurs for every step of every player
   */
  game.subscribeToEvent("playerMoves", (data, _context) => {
    console.log(data);
  });

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

    if (isCoffeeEmote(emote)) {
      let playersInLocation: Player[] = [];
      let mapLocation: string = "";
      if (isInBar(_context.player)) {
        console.log("It's coffee time in the Bar!");
        mapLocation = "Bar";

        playersInLocation = game
          .getPlayersInMap(_context.player.map ?? "")
          .filter((player) => isInBar(player));
      }

      if (isInKitchenette(_context.player)) {
        console.log("It's coffee time in the Kitchenette!");
        mapLocation = "Kitchenette";

        playersInLocation = game
          .getPlayersInMap(_context.player.map ?? "")
          .filter((player) => isInKitchenette(player));
      }

      // maybe we can include something else from the Player object in the prompt/msg

      const numPlayers = playersInLocation.length || 1;
      const playerNamesStr = playersInLocation
        .map(({ name }) => name)
        .join(", ");
      const artStyle = ART_STYLES[ART_STYLES.length % numPlayers];

      // generate an image of people enjoying coffee
      const prompt = `A group of ${numPlayers} people (${playerNamesStr}) enjoying a coffee in a ${mapLocation}. ${artStyle} style, vaporwave aesthetic`;
      const imageUrl = await generateImage(prompt);

      console.log("imageUrl", `<<<${imageUrl}>>>`);

      // image URL for testing so we don't hit the API limit (10/day
      // const imageUrl = "https://www.shutterstock.com/image-vector/coffee-cup-pixel-art-mug-260nw-1887694882.jpg";

      // trigger echo!
      await onCoffeeTime?.({
        players: playersInLocation,
        imageUrl,
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

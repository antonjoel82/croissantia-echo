import { Game, Player } from "@gathertown/gather-game-client";

const GATHER_API_KEY: string = process.env.GATHER_API_KEY || "";
const GATHER_SPACE_ID: string = process.env.GATHER_SPACE_ID || "";

export interface InitGatherOptions {
  onCoffeeTime?: () => void | PromiseLike<void>;
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
    // console.log({ data, context: _context });

    const {
      playerSetsEmoteV2: { emote },
    } = data;

    if (isCoffeeEmote(emote) && isInKitchenette(_context.player)) {
      console.log("It's coffee time!");

      // trigger echo!
      await onCoffeeTime?.();
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

/** Kitchenette boundaries */
const MIN_X = 18;
const MAX_X = 22;
const MIN_Y = 12;
const MAX_Y = 15;
function isInKitchenette({
  x,
  y,
  map,
}: Partial<Pick<Player, "map" | "x" | "y">>): boolean {
  if (!map || !x || !y) {
    return false;
  }

  //   console.log({ x, y, map });
  return (
    map === "office-main" &&
    x >= MIN_X &&
    y >= MIN_Y &&
    x <= MAX_X &&
    y <= MAX_Y
  );
}

function isCoffeeEmote(emote?: string): boolean {
  return ["☕"].includes(emote ?? "");
}

import { Player } from "@gathertown/gather-game-client";

interface Boundary {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function isInBoundary(
  { x, y, map }: Partial<Pick<Player, "map" | "x" | "y">>,
  boundary: Boundary
): boolean {
  if (!map || !x || !y) {
    return false;
  }

  const { minX, maxX, minY, maxY } = boundary;
  return x >= minX && y >= minY && x <= maxX && y <= maxY;
}

const kitchenetteBoundary: Boundary = {
  minX: 18,
  maxX: 22,
  minY: 12,
  maxY: 15,
};

const barBoundary: Boundary = {
  minX: 43,
  maxX: 48,
  minY: 19,
  maxY: 23,
};

export function isInKitchenette(
  player: Partial<Pick<Player, "map" | "x" | "y">>
): boolean {
  return (
    player.map === "office-main" && isInBoundary(player, kitchenetteBoundary)
  );
}

export function isInBar(
  player: Partial<Pick<Player, "map" | "x" | "y">>
): boolean {
  return player.map === "office-roof" && isInBoundary(player, barBoundary);
}

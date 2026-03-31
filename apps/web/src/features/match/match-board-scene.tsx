import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import type { MatchShellPreview } from "../../services/match-shell-preview-queries";
import {
  type MatchBoardSceneTile,
  type MatchBoardSceneToken,
  projectMatchBoardScene
} from "./match-board-scene-projection";

const SLOT_SIZE = 1.56;
const HALF_SPAN = SLOT_SIZE * 5;
const TOKEN_HEIGHT = 0.42;
const CORNER_TILE_SIZE = 2.04;
const EDGE_TILE_SHORT = 1.46;
const EDGE_TILE_LONG = 1.96;
const BOARD_BASE_SIZE = HALF_SPAN * 2 + 4.1;
const INNER_FIELD_SIZE = HALF_SPAN * 2 - 0.72;
const SHADOW_PLANE_SIZE = BOARD_BASE_SIZE + 3.4;

type TileEdge = "north" | "west" | "south" | "east";
type TileTransform = {
  x: number;
  z: number;
  width: number;
  depth: number;
};

type TileOverlayPalette = {
  base: string;
  accent: string;
  dock: string;
  trim: string;
};

function getTileTransform(tileIndex: number): TileTransform {
  if (tileIndex <= 10) {
    return {
      x: HALF_SPAN - SLOT_SIZE * tileIndex,
      z: HALF_SPAN,
      width: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_SHORT,
      depth: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_LONG
    };
  }

  if (tileIndex <= 20) {
    return {
      x: -HALF_SPAN,
      z: HALF_SPAN - SLOT_SIZE * (tileIndex - 10),
      width: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_LONG,
      depth: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_SHORT
    };
  }

  if (tileIndex <= 30) {
    return {
      x: -HALF_SPAN + SLOT_SIZE * (tileIndex - 20),
      z: -HALF_SPAN,
      width: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_SHORT,
      depth: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_LONG
    };
  }

  return {
    x: HALF_SPAN,
    z: -HALF_SPAN + SLOT_SIZE * (tileIndex - 30),
    width: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_LONG,
    depth: tileIndex % 10 === 0 ? CORNER_TILE_SIZE : EDGE_TILE_SHORT
  };
}

function getTileEdge(tileIndex: number): TileEdge {
  if (tileIndex <= 10) {
    return "north";
  }

  if (tileIndex <= 20) {
    return "west";
  }

  if (tileIndex <= 30) {
    return "south";
  }

  return "east";
}

function getTileColor(tileType: string) {
  switch (tileType) {
    case "start":
      return "#ffd85e";
    case "property":
      return "#98ecbd";
    case "tax":
      return "#ffb2a8";
    case "go_to_jail":
      return "#ff8d83";
    case "free_parking":
      return "#bff4ff";
    case "jail":
      return "#c9c7ff";
    default:
      return "#fff0cf";
  }
}

function getTileOverlayPalette(tileType: string): TileOverlayPalette {
  switch (tileType) {
    case "start":
      return {
        base: "#fff7d8",
        accent: "#ffbf3f",
        dock: "#fffbed",
        trim: "#9b6b00"
      };
    case "property":
      return {
        base: "#f0fff6",
        accent: "#20b486",
        dock: "#fbfffd",
        trim: "#0f6f57"
      };
    case "tax":
      return {
        base: "#fff1ee",
        accent: "#ff8a72",
        dock: "#fff9f7",
        trim: "#b44a3a"
      };
    case "go_to_jail":
      return {
        base: "#fff0eb",
        accent: "#ff6d5f",
        dock: "#fff9f6",
        trim: "#9d2f20"
      };
    case "free_parking":
      return {
        base: "#effcff",
        accent: "#53cfe3",
        dock: "#fbfeff",
        trim: "#1c8aa0"
      };
    case "jail":
      return {
        base: "#f4f0ff",
        accent: "#8a7bff",
        dock: "#fcfbff",
        trim: "#5c46de"
      };
    default:
      return {
        base: "#fff5e5",
        accent: "#ffbf7a",
        dock: "#fffaf2",
        trim: "#a96c1d"
      };
  }
}

function getTokenOffsets(count: number) {
  switch (count) {
    case 1:
      return [[0, 0]] as const;
    case 2:
      return [[-0.22, -0.22], [0.22, 0.22]] as const;
    case 3:
      return [[0, 0.24], [-0.24, -0.18], [0.24, -0.18]] as const;
    default:
      return [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]] as const;
  }
}

function TileFaceOverlay({
  tileType,
  tileIndex,
  transform
}: {
  tileType: string;
  tileIndex: number;
  transform: TileTransform;
}) {
  const edge = getTileEdge(tileIndex);
  const palette = getTileOverlayPalette(tileType);
  const faceWidth = transform.width * 0.9;
  const faceDepth = transform.depth * 0.76;
  const accentThickness = Math.max(Math.min(Math.min(faceWidth, faceDepth) * 0.18, 0.32), 0.2);
  const isEdgeHorizontal = edge === "north" || edge === "south";
  const accentWidth = isEdgeHorizontal ? faceWidth * 0.94 : accentThickness;
  const accentDepth = isEdgeHorizontal ? accentThickness : faceDepth * 0.94;
  const imageDockWidth = isEdgeHorizontal ? faceWidth * 0.74 : faceWidth * 0.58;
  const imageDockDepth = isEdgeHorizontal ? faceDepth * 0.38 : faceDepth * 0.56;
  const [accentX, accentZ] =
    edge === "north"
      ? [0, faceDepth * 0.34]
      : edge === "south"
        ? [0, -faceDepth * 0.34]
        : edge === "west"
          ? [-faceWidth * 0.34, 0]
          : [faceWidth * 0.34, 0];

  return (
    <group>
      <mesh position={[0, 0.156, 0]}>
        <boxGeometry args={[faceWidth, 0.04, faceDepth]} />
        <meshStandardMaterial color={palette.base} roughness={0.84} metalness={0.04} />
      </mesh>
      <mesh position={[accentX, 0.188, accentZ]}>
        <boxGeometry args={[accentWidth, 0.028, accentDepth]} />
        <meshStandardMaterial color={palette.accent} roughness={0.42} metalness={0.14} />
      </mesh>
      <mesh position={[0, 0.194, 0]}>
        <boxGeometry args={[imageDockWidth, 0.022, imageDockDepth]} />
        <meshStandardMaterial color={palette.dock} roughness={0.8} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0.208, 0]}>
        <boxGeometry args={[Math.max(imageDockWidth * 0.48, 0.3), 0.012, Math.max(imageDockDepth * 0.28, 0.18)]} />
        <meshStandardMaterial color={palette.trim} roughness={0.36} metalness={0.2} opacity={0.94} transparent />
      </mesh>
    </group>
  );
}

function BoardTile({ tile, isActive }: { tile: MatchBoardSceneTile; isActive: boolean }) {
  const transform = getTileTransform(tile.tileIndex);

  return (
    <group position={[transform.x, 0, transform.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[transform.width, 0.28, transform.depth]} />
        <meshStandardMaterial color={getTileColor(tile.tileType)} roughness={0.66} metalness={0.08} />
      </mesh>
      <TileFaceOverlay tileIndex={tile.tileIndex} tileType={tile.tileType} transform={transform} />
      {isActive ? (
        <mesh position={[0, 0.232, 0]}>
          <boxGeometry args={[transform.width * 0.95, 0.055, transform.depth * 0.95]} />
          <meshStandardMaterial
            color="#ffe45a"
            emissive="#ff9f1c"
            emissiveIntensity={0.48}
            roughness={0.32}
            metalness={0.14}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function BoardToken({
  token,
  tileSlotIndex,
  tileOccupancy
}: {
  token: MatchBoardSceneToken;
  tileSlotIndex: number;
  tileOccupancy: number;
}) {
  const transform = getTileTransform(token.position);
  const offsets = getTokenOffsets(tileOccupancy);
  const offset = offsets[Math.min(tileSlotIndex, offsets.length - 1)] ?? [0, 0];
  const offsetX = offset[0] ?? 0;
  const offsetZ = offset[1] ?? 0;
  const accentColor = token.isActiveTurn ? "#fff6b8" : token.isCurrentPlayer ? "#ffffff" : token.color;

  return (
    <group position={[transform.x + offsetX, TOKEN_HEIGHT, transform.z + offsetZ]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.5, 24]} />
        <meshStandardMaterial color={token.color} roughness={0.4} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 0.282, 0]}>
        <sphereGeometry args={[0.14, 18, 18]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={token.isActiveTurn ? "#ff9f1c" : "#000000"}
          emissiveIntensity={token.isActiveTurn ? 0.36 : 0}
          roughness={0.28}
          metalness={0.16}
        />
      </mesh>
    </group>
  );
}

function BoardSceneContent({ preview }: { preview: MatchShellPreview }) {
  const scene = useMemo(() => projectMatchBoardScene(preview), [preview]);
  const occupancyMap = useMemo(() => {
    const grouped = new Map<number, MatchBoardSceneToken[]>();

    for (const token of scene.tokens) {
      const bucket = grouped.get(token.position) ?? [];
      bucket.push(token);
      grouped.set(token.position, bucket);
    }

    return grouped;
  }, [scene.tokens]);

  return (
    <>
      <color attach="background" args={["#eefcff"]} />
      <fog attach="fog" args={["#eefcff", 22, 42]} />
      <hemisphereLight args={["#fff4c7", "#8ce7d4", 1.2]} />
      <ambientLight intensity={0.88} />
      <directionalLight
        castShadow
        intensity={1.58}
        position={[8, 14, 7]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <group position={[0, -0.42, 0.16]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[BOARD_BASE_SIZE, 0.58, BOARD_BASE_SIZE]} />
          <meshStandardMaterial color="#5e97ff" roughness={0.7} metalness={0.1} />
        </mesh>
      </group>

      <mesh receiveShadow position={[0, -0.06, 0.16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[INNER_FIELD_SIZE, INNER_FIELD_SIZE]} />
        <meshStandardMaterial color="#1ca1b9" roughness={0.78} metalness={0.05} />
      </mesh>

      <mesh receiveShadow position={[0, -0.46, 0.16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SHADOW_PLANE_SIZE, SHADOW_PLANE_SIZE]} />
        <shadowMaterial opacity={0.17} />
      </mesh>

      {scene.tiles.map((tile) => (
        <BoardTile key={tile.tileIndex} tile={tile} isActive={tile.tileIndex === scene.activeTileIndex} />
      ))}

      {scene.tokens.map((token) => {
        const tokensOnTile = occupancyMap.get(token.position) ?? [token];
        const tileSlotIndex = tokensOnTile.findIndex((entry) => entry.playerId === token.playerId);

        return (
          <BoardToken
            key={token.playerId}
            tileOccupancy={tokensOnTile.length}
            tileSlotIndex={Math.max(tileSlotIndex, 0)}
            token={token}
          />
        );
      })}
    </>
  );
}

export function MatchBoardScene({ preview }: { preview: MatchShellPreview }) {
  return (
    <div className="match-board-scene">
      <Canvas camera={{ position: [0, 17.9, 21.6], fov: 29.4 }} dpr={[1, 1.5]} frameloop="demand" shadows>
        <BoardSceneContent preview={preview} />
      </Canvas>
    </div>
  );
}






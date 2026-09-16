import { formatPlaying } from "../lib/grids";
import type { Tile as TileT } from "../types";

interface Props {
  tile: TileT;
  onClick: () => void;
}

export function Tile({ tile, onClick }: Props) {
  return (
    <button className="tile" onClick={onClick} aria-label={tile.name}>
      <div className="tile-img">
        <img src={tile.src} alt="" draggable={false} />
      </div>
      <div className="tile-name">{tile.name}</div>
      <div className="tile-meta">
        <span className="tile-rating">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5 7.5h1.6v6H5zM7.8 13.5V7.6l2.1-4.9c.2-.5.7-.7 1.2-.5.6.2.9.8.7 1.4L11 7h2.2c.6 0 1.1.5 1 1.1l-.6 4.2c-.1.7-.7 1.2-1.4 1.2z"
            />
          </svg>
          {tile.rating}%
        </span>
        <span className="tile-playing">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <circle cx="8" cy="5" r="3" fill="currentColor" />
            <path fill="currentColor" d="M2.5 14a5.5 5.5 0 0 1 11 0z" />
          </svg>
          {formatPlaying(tile.playing)}
        </span>
      </div>
    </button>
  );
}

import React, { useState, useCallback } from 'react';
import { Tile as TileType } from '../../types/game';
import { Tile } from './Tile';
import { Button } from '../ui/button';
import { canPlaceTile } from '../../utils/gameLogic';
import { RelictManager } from '../../utils/relictManager';

interface PlayerHandProps {
  hand: TileType[];
  board: (TileType | null)[][];
  canDiscard: boolean;
  onDragStart: (tile: TileType) => void;
  onDragEnd: () => void;
  onDiscardTiles: (tiles: TileType[]) => void;
  ownedRelicts: any[];
}

export function PlayerHand({ 
  hand, 
  board,
  canDiscard,
  onDragStart, 
  onDragEnd,
  onDiscardTiles,
  ownedRelicts
}: PlayerHandProps) {
  const [selectedTiles, setSelectedTiles] = useState<TileType[]>([]);

  const handleTileClick = useCallback((tile: TileType) => {
    setSelectedTiles(prev => {
      const isSelected = prev.some(t => t.id === tile.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tile.id);
      } else {
        return [...prev, tile];
      }
    });
  }, []);

  const handleDiscardSelected = useCallback(() => {
    if (selectedTiles.length > 0 && canDiscard) {
      onDiscardTiles(selectedTiles);
      setSelectedTiles([]);
    }
  }, [selectedTiles, canDiscard, onDiscardTiles]);

  const handleDragStart = useCallback((e: React.DragEvent, tile: TileType) => {
    onDragStart(tile);
    e.dataTransfer.effectAllowed = 'move';
  }, [onDragStart]);

  // Check which tiles are actually playable
  const playableCards = hand.filter(tile => {
    const isFirstTile = board.every(row => row.every(cell => cell === null || cell.isBlock || cell.isUpgradeField));
    if (isFirstTile) return true; // First tile can be placed anywhere
    
    // Create relict manager for this check
    const relictManager = new RelictManager(ownedRelicts);
    
    // Check if tile can be placed anywhere on the board
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === null || board[row][col]?.isUpgradeField) {
          if (canPlaceTile(tile, { row, col }, board, isFirstTile, relictManager)) {
            return true;
          }
        }
      }
    }
    return false;
  });

  return (
    <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-6 rounded-xl shadow-2xl">

      
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {hand.map(tile => {
          const isPlayable = playableCards.some(p => p.id === tile.id);
          const isSelected = selectedTiles.some(t => t.id === tile.id);
          
          return (
            <Tile
              key={tile.id}
              tile={tile}
              isHexagonal={true}
              size={25}
              isPlayable={isPlayable}
              isSelected={isSelected}
              onClick={() => handleTileClick(tile)}
              onDragStart={(e) => handleDragStart(e, tile)}
              onDragEnd={onDragEnd}
            />
          );
        })}
      </div>

      {selectedTiles.length > 0 && (
        <div className="text-center">
          <Button
            onClick={handleDiscardSelected}
            disabled={!canDiscard}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            Discard Selected ({selectedTiles.length})
          </Button>
        </div>
      )}
    </div>
  );
}

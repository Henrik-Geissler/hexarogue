import React, { useState } from 'react';
import { Tile } from '../../types/game';
import { getDeckStats } from '../../utils/gameLogic';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface DeckProps {
  deck: Tile[];
}

export function Deck({ deck }: DeckProps) {
  const [showStats, setShowStats] = useState(false);
  const stats = getDeckStats(deck);

  return (
    <div className="relative">
      <Card
        className="bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 cursor-pointer transition-transform hover:scale-105"
        onMouseEnter={() => setShowStats(true)}
        onMouseLeave={() => setShowStats(false)}
      >
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-white text-base sm:text-lg font-bold mb-2">Deck</div>
          <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-300">cards left</div>
        </CardContent>
      </Card>

      {showStats && (
        <div className={cn(
          "absolute bottom-full right-0 mb-2 bg-black/90 text-white p-3 sm:p-4 rounded-lg shadow-xl z-50",
          "min-w-[180px] sm:min-w-[200px] transition-opacity duration-200"
        )}>
          <h3 className="font-bold mb-2 text-sm sm:text-base">Deck Contents</h3>
          
          <div className="mb-3">
            <h4 className="text-xs sm:text-sm font-semibold mb-1">By Color:</h4>
                           <div className="grid grid-cols-2 gap-1 text-xs">
                 <div className="text-red-400">Red: {stats.colorCounts.red}</div>
                 <div className="text-green-400">Green: {stats.colorCounts.green}</div>
                 <div className="text-blue-400">Blue: {stats.colorCounts.blue}</div>
                 <div className="text-yellow-400">Yellow: {stats.colorCounts.yellow}</div>
               </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold mb-1">By Number:</h4>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {Object.entries(stats.numberCounts).map(([number, count]) => (
                <div key={number}>{number}: {count}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { GameStats } from '../../types/game';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ScoreAreaProps {
  stats: GameStats;
  round: number;
  gold: number;
  onGoldDrop?: (e: React.DragEvent) => void;
}

export function ScoreArea({ stats, round, gold, onGoldDrop }: ScoreAreaProps) {
  const progressPercentage = (stats.score / stats.targetScore) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-600 text-white">
      <CardHeader>
        <CardTitle className="text-center text-xl">Round {round}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.discards}</div>
            <div className="text-sm text-gray-300">Discards Left</div>
          </div>
          
          <div 
            className="text-center cursor-pointer transition-all duration-200 hover:scale-105"
            onDrop={onGoldDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="text-2xl font-bold text-yellow-400">💰 {gold}</div>
            <div className="text-sm text-gray-300">Gold</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Score Progress</span>
            <span className="text-sm">{stats.score} / {stats.targetScore}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-black/20 rounded-lg">
          <div className="text-lg font-semibold">Target Score</div>
          <div className="text-3xl font-bold text-green-400">{stats.targetScore}</div>
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { useGameState } from './hooks/useGameState';
import { GameBoard } from './components/Game/GameBoard';
import { PlayerHand } from './components/Game/PlayerHand';
import { ScoreArea } from './components/Game/ScoreArea';
import { Deck } from './components/Game/Deck';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { RelictSection } from './components/Game/RelictSection';
import { RelictSelection } from './components/Game/RelictSelection';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
  const { gameState, actions } = useGameState();

  // Auto-start game for debugging honeycomb layout
  React.useEffect(() => {
    if (gameState.gamePhase === 'ready') {
      actions.startNewGame();
    }
  }, [gameState.gamePhase, actions]);

  const handleDragStart = (tile: any) => {
    actions.setDraggedTile(tile);
  };

  const handleDragEnd = () => {
    actions.setDraggedTile(null);
    actions.setHoveredPosition(null);
  };

  if (gameState.gamePhase === 'relict-selection') {
    return (
      <TooltipProvider>
        <>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column: Score and Deck */}
              <div className="space-y-6 xl:order-1">
                <ScoreArea
                  stats={{
                    discards: gameState.discards,
                    score: gameState.score,
                    targetScore: gameState.targetScore
                  }}
                  round={gameState.round}
                />
                <Deck deck={gameState.deck} />
              </div>

              {/* Center Column: Game Board */}
              <div className="flex items-center justify-center xl:order-2">
                <GameBoard
                  board={gameState.board}
                  draggedTile={gameState.draggedTile}
                  hoveredPosition={gameState.hoveredPosition}
                  onPlaceTile={actions.placeTile}
                  onHoverPosition={actions.setHoveredPosition}
                  ownedRelicts={gameState.ownedRelicts}
                  animations={gameState.animations}
                  isAnimating={gameState.isAnimating}
                />
              </div>

              {/* Right Column: Relicts and Player Hand */}
              <div className="space-y-4 xl:order-3">
                <RelictSection
                  relicts={gameState.ownedRelicts}
                  onReorderRelicts={actions.reorderRelicts}
                />
                <PlayerHand
                  hand={gameState.playerHand}
                  board={gameState.board}
                  canDiscard={gameState.discards > 0}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDiscardTiles={actions.discardTiles}
                  ownedRelicts={gameState.ownedRelicts}
                />
              </div>
            </div>
          </div>
          <RelictSelection
            availableRelicts={gameState.relictSelectionOptions}
            onSelectRelict={actions.selectRelict}
          />
        </>
      </TooltipProvider>
    );
  }

  if (gameState.gamePhase === 'won') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-2 text-green-400">🎉 You Won!</CardTitle>
              <p className="text-gray-300">
                Congratulations! You reached the target score of {gameState.targetScore}.
              </p>
              <p className="text-lg font-semibold mt-2">Final Score: {gameState.score}</p>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <Button
                onClick={actions.startNewRound}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 w-full"
              >
                Next Round
              </Button>
              <Button
                onClick={actions.startNewGame}
                variant="outline"
                size="lg"
                className="w-full"
              >
                New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  if (gameState.gamePhase === 'lost') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-2 text-red-400">💀 Game Over</CardTitle>
              <p className="text-gray-300">
                You couldn't reach the target score of {gameState.targetScore}.
              </p>
              <p className="text-lg font-semibold mt-2">Final Score: {gameState.score}</p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={actions.startNewGame}
                size="lg"
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Score and Deck */}
          <div className="space-y-6 xl:order-1">
            <ScoreArea
              stats={{
                discards: gameState.discards,
                score: gameState.score,
                targetScore: gameState.targetScore
              }}
              round={gameState.round}
            />
            <Deck deck={gameState.deck} />
          </div>

          {/* Center Column: Game Board */}
          <div className="flex items-center justify-center xl:order-2">
            <GameBoard
              board={gameState.board}
              draggedTile={gameState.draggedTile}
              hoveredPosition={gameState.hoveredPosition}
              onPlaceTile={actions.placeTile}
              onHoverPosition={actions.setHoveredPosition}
              ownedRelicts={gameState.ownedRelicts}
              animations={gameState.animations}
              isAnimating={gameState.isAnimating}
            />
          </div>

          {/* Right Column: Relicts and Player Hand */}
          <div className="space-y-4 xl:order-3">
            <RelictSection
              relicts={gameState.ownedRelicts}
              onReorderRelicts={actions.reorderRelicts}
            />
            <PlayerHand
              hand={gameState.playerHand}
              board={gameState.board}
              canDiscard={gameState.discards > 0}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDiscardTiles={actions.discardTiles}
              ownedRelicts={gameState.ownedRelicts}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;

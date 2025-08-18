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
import { AnimatedCardDraw } from './components/Game/AnimatedCardDraw';

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

  const handleGoldDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const relictId = e.dataTransfer.getData('text/plain');
    if (relictId && relictId.startsWith('relict-')) {
      const actualRelictId = relictId.replace('relict-', '');
      // Sell the relict for gold
      actions.sellRelict(actualRelictId);
    }
  };

  if (gameState.gamePhase === 'relict-selection') {
    return (
      <TooltipProvider>
        <>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-2 sm:p-4 overflow-x-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              {/* Left Column: Score and Deck */}
              <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
                <ScoreArea
                  stats={{
                    discards: gameState.discards,
                    score: gameState.score,
                    targetScore: gameState.targetScore
                  }}
                  round={gameState.round}
                  gold={gameState.gold}
                  onGoldDrop={handleGoldDrop}
                />
                <Deck deck={gameState.deck} />
              </div>

              {/* Center Column: Game Board */}
              <div className="flex items-center justify-center order-1 lg:order-2">
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
              <div className="space-y-4 order-3">
                <RelictSection
                  relicts={gameState.ownedRelicts}
                  onReorderRelicts={actions.reorderRelicts}
                  animatingRelicts={gameState.animatingRelicts}
                  board={gameState.board}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-2 sm:p-4 overflow-x-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column: Score and Deck */}
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
            <ScoreArea
              stats={{
                discards: gameState.discards,
                score: gameState.score,
                targetScore: gameState.targetScore
              }}
              round={gameState.round}
              gold={gameState.gold}
              onGoldDrop={handleGoldDrop}
            />
            <Deck deck={gameState.deck} />
          </div>

          {/* Center Column: Game Board */}
          <div className="flex items-center justify-center order-1 lg:order-2">
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
          <div className="space-y-4 order-3">
            <RelictSection
              relicts={gameState.ownedRelicts}
              onReorderRelicts={actions.reorderRelicts}
              animatingRelicts={gameState.animatingRelicts}
              board={gameState.board}
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
        
        {/* Drawing Animations */}
        {gameState.drawingAnimations.map((animation) => (
          <AnimatedCardDraw
            key={animation.id}
            tile={animation.tile}
            fromPosition={animation.fromPosition}
            toPosition={animation.toPosition}
            delay={animation.delay}
            onComplete={() => {
              // Animation completed
            }}
            onGreenGrowth={() => {
              // Trigger Green Growth animation
            }}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

export default App;

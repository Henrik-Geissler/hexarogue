import React from 'react';
import { Relict } from '../../types/relicts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface RelictSectionProps {
  relicts: Relict[];
  onReorderRelicts: (newOrder: Relict[]) => void;
}

export function RelictSection({ relicts, onReorderRelicts }: RelictSectionProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex !== targetIndex) {
      const newOrder = [...relicts];
      const [draggedItem] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      onReorderRelicts(newOrder);
    }
  };

  // Show empty slots to match player hand size (7 slots)
  const relictSlots = Array.from({ length: 7 }, (_, index) => relicts[index] || null);

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-4 border border-purple-700">
        <div className="grid grid-cols-7 gap-2">
          {relictSlots.map((relict, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    aspect-square rounded-md border-2 border-dashed border-purple-500/50 
                    flex items-center justify-center text-2xl relative
                    ${relict ? 'bg-purple-700/50 border-solid border-purple-400' : 'bg-purple-900/30'}
                    ${relict ? 'cursor-move hover:bg-purple-600/60' : ''}
                  `}
                  draggable={!!relict}
                  onDragStart={(e) => relict && handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {relict ? (
                    <div className="text-center">
                      <div className="text-xl">{relict.icon}</div>
                    </div>
                  ) : null}
                </div>
              </TooltipTrigger>
              {relict && (
                <TooltipContent side="top" className="bg-purple-900 border border-purple-600 text-purple-100">
                  <div className="text-center">
                    <div className="font-bold text-sm">{relict.name}</div>
                    <div className="text-xs mt-1 max-w-48">{relict.description}</div>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
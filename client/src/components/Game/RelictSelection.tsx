import React from 'react';
import { Relict } from '../../types/relicts';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Component to render text with bold formatting
function BoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}

interface RelictSelectionProps {
  availableRelicts: Relict[];
  onSelectRelict: (relict: Relict) => void;
}

export function RelictSelection({ availableRelicts, onSelectRelict }: RelictSelectionProps) {
  if (availableRelicts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-slate-900/95 border-purple-500/50 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-300">Choose a Relict</CardTitle>
          <p className="text-slate-300">Select a powerful artifact to aid your quest</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableRelicts.map((relict) => (
              <div
                key={relict.id}
                className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 rounded-lg p-6 border border-purple-500/30 hover:border-purple-400 transition-all"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{relict.icon}</div>
                  <h3 className="text-xl font-bold text-purple-200">{relict.name}</h3>
                </div>
                
                <p className="text-sm text-slate-300 mb-6 text-center min-h-[3rem]">
                  <BoldText text={relict.description} />
                </p>
                
                <Button
                  onClick={() => onSelectRelict(relict)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Select This Relict
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
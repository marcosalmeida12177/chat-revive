import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
  '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫',
  '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
  '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭',
  '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹',
  '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃'
];

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  return (
    <Card className="absolute bottom-16 left-0 z-50 p-4 w-64 max-h-48 overflow-y-auto">
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-lg hover:bg-muted"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </Card>
  );
};
import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface DroppableProps {
  id: string;
  children: ReactNode;
  isPlaced: boolean;
}

export function Droppable({ id, children, isPlaced }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    disabled: isPlaced, // Disable if it's already correctly placed
  });

  return (
    <div 
      ref={setNodeRef} 
      className={clsx(
        "slot", 
        isOver && !isPlaced && "slot-over",
        isPlaced && "slot-placed"
      )}
    >
      {children}
    </div>
  );
}

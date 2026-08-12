import { useDraggable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface DraggableProps {
  id: string;
  children: ReactNode;
  isWrong?: boolean;
  isDragging?: boolean;
}

export function Draggable({ id, children, isWrong, isDragging }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100, // Bring dragging item to front
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={clsx(
        "card draggable",
        isWrong && "wrong-shake",
        isDragging && "dragging"
      )}
    >
      {children}
    </div>
  );
}

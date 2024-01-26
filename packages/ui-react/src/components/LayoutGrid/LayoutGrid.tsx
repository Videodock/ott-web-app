// Keyboard-accessible grid layout, with focus management

import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './LayoutGrid.module.scss';

type Props<Item> = {
  className?: string;
  columnCount: number;
  data: Item[];
  renderCell: (item: Item, tabIndex: number) => JSX.Element;
};

const LayoutGrid = <Item extends object>({ className, columnCount, data, renderCell }: Props<Item>) => {
  const [focused, setFocused] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);

  const rowCount = Math.ceil(data.length / columnCount);

  const handleKeyDown = useEventCallback(({ key, ctrlKey }: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)) return;

    const isOnMostLeft = currentColumnIndex === 0;
    const isOnMostRight = currentColumnIndex === columnCount - 1;
    const isOnMostTop = currentRowIndex === 0;
    const isOnMostBottom = currentRowIndex === rowCount - 1;
    const maxRightBottom = (data.length % columnCount) - 1; // Never go beyond last item
    const maxRight = isOnMostBottom ? maxRightBottom : columnCount - 1;

    switch (key) {
      case 'ArrowLeft':
        if (isOnMostLeft && !isOnMostTop) {
          // Move to last of previous row
          setCurrentColumnIndex(columnCount - 1);
          setCurrentRowIndex((current) => Math.max(current - 1, 0));

          return;
        }
        return setCurrentColumnIndex((current) => Math.max(current - 1, 0));
      case 'ArrowRight':
        if (isOnMostRight && !isOnMostBottom) {
          // Move to first of next row
          setCurrentColumnIndex(0);
          setCurrentRowIndex((current) => Math.min(current + 1, rowCount - 1));

          return;
        }
        return setCurrentColumnIndex((current) => Math.min(current + 1, maxRight));
      case 'ArrowUp':
        return setCurrentRowIndex((current) => Math.max(current - 1, 0));
      case 'ArrowDown':
        return setCurrentRowIndex((current) => Math.min(current + 1, rowCount - 1));
      case 'Home':
        if (ctrlKey) {
          setCurrentRowIndex(0);
        }
        return setCurrentColumnIndex(0);
      case 'End':
        if (ctrlKey) {
          setCurrentRowIndex(maxRight);
          setCurrentColumnIndex(maxRightBottom);

          return;
        }
        return setCurrentColumnIndex(rowCount - 1);
      case 'PageUp':
        return setCurrentRowIndex((current) => Math.max(current - 1, 0));
      case 'PageDown':
        return setCurrentRowIndex((current) => Math.min(current + 1, rowCount - 1));
      default:
        return;
    }
  });

  useEffect(() => {
    if (focused) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focused, handleKeyDown, columnCount, rowCount]);

  const gridRef = useRef<HTMLDivElement>(null);

  // Focus the button (or other focusable element) in the currently focused grid cell
  useLayoutEffect(() => {
    const gridCell = document.getElementById(`layout_grid_${currentRowIndex}-${currentColumnIndex}`) as HTMLDivElement | null;
    const focusableElement = gridCell?.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])') as HTMLElement | null;
    const elementToFocus = focusableElement || gridCell;

    elementToFocus?.focus();
  }, [currentRowIndex, currentColumnIndex]);

  useEffect(() => {
    // When the window size changes, correct indexes if necessary
    const maxRightBottom = (data.length % columnCount) - 1;

    if (currentColumnIndex > columnCount - 1) {
      setCurrentColumnIndex(columnCount - 1);
    }
    if (currentRowIndex === rowCount - 1 && currentColumnIndex > maxRightBottom) {
      setCurrentColumnIndex(maxRightBottom);
    }
  }, [currentColumnIndex, currentRowIndex, columnCount, rowCount, data.length]);

  return (
    <div role="grid" ref={gridRef} aria-rowcount={rowCount} className={className} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div role="row" key={rowIndex} aria-rowindex={rowIndex} className={styles.row}>
          {data.slice(rowIndex * columnCount, rowIndex * columnCount + columnCount).map((item, columnIndex) => (
            <div
              role="gridcell"
              onFocus={(event) => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              id={`layout_grid_${rowIndex}-${columnIndex}`}
              key={columnIndex}
              aria-colindex={columnIndex}
              className={styles.cell}
              style={{ width: `${Math.round(100 / columnCount)}%` }}
            >
              {renderCell(item, currentRowIndex === rowIndex && currentColumnIndex === columnIndex ? 0 : -1)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LayoutGrid;

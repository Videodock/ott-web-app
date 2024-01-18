// Keyboard-accessible grid layout, with focus management

import { useEffect, useState } from 'react';

import styles from './LayoutGrid.module.scss';

type Props = {
  className?: string;
  columnCount: number;
  data: any[];
  renderCell: (item: any, tabIndex: number, focused: boolean) => JSX.Element;
};

const LayoutGrid = ({ className, columnCount, data, renderCell }: Props) => {
  const [focused, setFocused] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);

  const rowCount = Math.ceil(data.length / columnCount);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        setCurrentRowIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === 'ArrowDown') {
        setCurrentRowIndex((current) => Math.min(current + 1, rowCount - 1));
      } else if (event.key === 'ArrowLeft') {
        setCurrentColumnIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === 'ArrowRight') {
        setCurrentColumnIndex((current) => Math.min(current + 1, columnCount - 1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [columnCount, rowCount]);

  return (
    <div role="grid" aria-rowcount={rowCount} className={className} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div role="row" key={rowIndex} aria-rowindex={rowIndex} className={styles.row}>
          {data.slice(rowIndex * columnCount, rowIndex * columnCount + columnCount).map((item, columnIndex) => (
            <div role="gridcell" key={columnIndex} aria-colindex={columnIndex} className={styles.cell} style={{ width: `${Math.round(100 / rowCount)}%` }}>
              {renderCell(
                item,
                currentRowIndex === rowIndex && currentColumnIndex === columnIndex ? 0 : -1,
                focused && currentRowIndex === rowIndex && currentColumnIndex === columnIndex,
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LayoutGrid;

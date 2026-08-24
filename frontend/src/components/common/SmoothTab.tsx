/**
 * SmoothTab - Inspired by Kokonut UI
 * Features Spring Physics Sliding Indicator tailored with Red Logistics Brand Theme
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon | React.ElementType;
  count?: number;
  content?: React.ReactNode;
  cardContent?: React.ReactNode;
  color?: string;
}

interface SmoothTabProps {
  items: TabItem[];
  defaultTabId?: string;
  selectedTabId?: string;
  className?: string;
  activeColor?: string;
  showContentCards?: boolean;
  onChange?: (tabId: string) => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    filter: 'blur(6px)',
    scale: 0.96,
    position: 'absolute' as const,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    position: 'relative' as const,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    filter: 'blur(6px)',
    scale: 0.96,
    position: 'absolute' as const,
  }),
};

const transition = {
  duration: 0.35,
  ease: [0.32, 0.72, 0, 1],
};

export const SmoothTab: React.FC<SmoothTabProps> = ({
  items,
  defaultTabId,
  selectedTabId,
  className,
  activeColor = 'bg-gradient-to-r from-red-600 via-rose-600 to-brand-600 shadow-md shadow-brand-600/30',
  showContentCards = false,
  onChange,
}) => {
  const [internalSelected, setInternalSelected] = React.useState<string>(
    selectedTabId || defaultTabId || items[0]?.id || ''
  );
  const selected = selectedTabId !== undefined ? selectedTabId : internalSelected;
  const [direction, setDirection] = React.useState(0);
  const [dimensions, setDimensions] = React.useState({ width: 0, left: 0 });

  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const updateDimensions = () => {
      const selectedButton = buttonRefs.current.get(selected);
      const container = containerRef.current;

      if (selectedButton && container) {
        const rect = selectedButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setDimensions({
          width: rect.width,
          left: rect.left - containerRect.left,
        });
      }
    };

    updateDimensions();
    const frameId = requestAnimationFrame(updateDimensions);

    window.addEventListener('resize', updateDimensions);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [selected, items]);

  const handleTabClick = (tabId: string) => {
    const currentIndex = items.findIndex((item) => item.id === selected);
    const newIndex = items.findIndex((item) => item.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    if (selectedTabId === undefined) {
      setInternalSelected(tabId);
    }
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  const selectedItem = items.find((item) => item.id === selected);

  return (
    <div className="flex w-full flex-col">
      {/* Optional Card Content Area */}
      {showContentCards && (
        <div className="relative mb-6 min-h-[160px] w-full rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.div
              animate="center"
              className="w-full will-change-transform"
              custom={direction}
              exit="exit"
              initial="enter"
              key={`card-${selected}`}
              transition={transition as any}
              variants={slideVariants as any}
            >
              {selectedItem?.content || (
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    {selectedItem?.title}
                  </h3>
                  {selectedItem?.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Smooth Spring Toolbar Container */}
      <div
        aria-label="Smooth navigation tabs"
        className={cn(
          'relative flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/90 p-1.5 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-200 select-none',
          className
        )}
        ref={containerRef}
        role="tablist"
      >
        {/* Animated Spring Sliding Pill */}
        {dimensions.width > 0 && (
          <motion.div
            animate={{
              width: dimensions.width,
              x: dimensions.left,
              opacity: 1,
            }}
            className={cn('absolute z-[1] rounded-full', activeColor)}
            initial={false}
            style={{ height: 'calc(100% - 12px)', top: '6px' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
          />
        )}

        <div className="relative z-[2] flex w-full items-center gap-1">
          {items.map((item) => {
            const isSelected = selected === item.id;
            const Icon = item.icon;

            return (
              <button
                aria-controls={`panel-${item.id}`}
                aria-selected={isSelected}
                className={cn(
                  'relative flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 font-bold text-xs transition-colors duration-200 cursor-pointer whitespace-nowrap',
                  isSelected
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-950'
                )}
                id={`tab-${item.id}`}
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                ref={(el) => {
                  if (el) buttonRefs.current.set(item.id, el);
                  else buttonRefs.current.delete(item.id);
                }}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5 transition-colors duration-200',
                      isSelected
                        ? 'text-white'
                        : item.id === 'tracking'
                        ? 'text-brand-500 animate-pulse'
                        : 'text-slate-400'
                    )}
                  />
                )}
                <span>{item.title}</span>
                {item.count !== undefined && (
                  <span
                    className={cn(
                      'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold',
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

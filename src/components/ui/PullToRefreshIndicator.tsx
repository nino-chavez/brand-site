import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isTriggered: boolean;
  isRefreshing: boolean;
  threshold?: number;
}

/**
 * Pull-to-Refresh Visual Indicator
 * Shows animated feedback during pull-to-refresh gesture
 */
export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isTriggered,
  isRefreshing,
  threshold = 80
}) => {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const isVisible = pullDistance > 0 || isRefreshing;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none"
          style={{
            transform: `translateY(${Math.min(pullDistance, 100)}px)`
          }}
        >
          <div className="flex justify-center items-center py-4">
            {isRefreshing ? (
              // Refreshing spinner
              <motion.div
                className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              // Pull indicator
              <div className="flex flex-col items-center space-y-2">
                <motion.svg
                  className="w-6 h-6 text-violet-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    rotate: isTriggered ? 180 : 0,
                    scale: isTriggered ? 1.2 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </motion.svg>

                {/* Progress arc */}
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4c1d95"
                    strokeWidth="2"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={100 - progress}
                    strokeLinecap="round"
                  />
                </svg>

                <span className="text-xs text-white/60">
                  {isTriggered ? 'Release to refresh' : 'Pull down to refresh'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

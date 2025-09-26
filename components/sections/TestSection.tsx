import React, { forwardRef } from 'react';

interface TestSectionProps {
  active: boolean;
  progress: number;
  onSectionReady: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const TestSection = forwardRef<HTMLElement, TestSectionProps>(({
  active,
  progress,
  onSectionReady,
  onError,
  className = ''
}, ref) => {
  return (
    <section
      ref={ref}
      id="test"
      className={`min-h-screen relative overflow-hidden bg-neutral-900 flex items-center justify-center ${className}`}
      data-testid="test-section"
      data-active={active}
      data-progress={progress}
    >
      <div className="text-white text-4xl">
        Test Section Working! Active: {active ? 'Yes' : 'No'}
      </div>
    </section>
  );
});

TestSection.displayName = 'TestSection';

export default TestSection;
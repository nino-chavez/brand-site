import React from 'react';

/**
 * Viewfinder corner brackets component
 * Extracted from ViewfinderOverlay for better separation of concerns
 */
export const ViewfinderBrackets: React.FC = () => (
  <>
    {/* Top-left bracket */}
    <svg
      className="absolute top-4 left-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3V9M3 3H9"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Top-right bracket */}
    <svg
      className="absolute top-4 right-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 3V9M21 3H15"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Bottom-left bracket */}
    <svg
      className="absolute bottom-4 left-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 21V15M3 21H9"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Bottom-right bracket */}
    <svg
      className="absolute bottom-4 right-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21V15M21 21H15"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </>
);
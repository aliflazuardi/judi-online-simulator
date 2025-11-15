'use client';

import { useState } from 'react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#FFD93D', '#6BCF7F', '#B19CD9'
];

const SLICE_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Select random slice (0-7) with equal probability
    const selectedSlice = Math.floor(Math.random() * 8);

    // Calculate rotation: multiple full rotations + final position
    const degreesPerSlice = 360 / 8;
    const baseRotation = 360 * 5; // 5 full spins
    const sliceRotation = selectedSlice * degreesPerSlice;
    // Offset to center the slice at the top
    const offset = degreesPerSlice / 2;
    const finalRotation = baseRotation + (360 - sliceRotation) - offset;

    setRotation(rotation + finalRotation);

    // Stop after 3 seconds
    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedSlice);
    }, 3000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2">
          Judi Online Simulator
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Simulator untuk membuktikan judi online scam
        </p>

        <div className="flex flex-col items-center gap-6">
          {/* Wheel Container */}
          <div className="relative">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-500"></div>
            </div>

            {/* Wheel */}
            <div className="relative w-[400px] h-[400px]">
              <svg
                width="400"
                height="400"
                viewBox="0 0 400 400"
                className="transition-transform duration-[3000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {SLICE_LABELS.map((label, index) => {
                  const angle = (360 / 8) * index;
                  const nextAngle = (360 / 8) * (index + 1);

                  // Convert to radians
                  const startAngle = (angle - 90) * (Math.PI / 180);
                  const endAngle = (nextAngle - 90) * (Math.PI / 180);

                  // Calculate path
                  const x1 = 200 + 180 * Math.cos(startAngle);
                  const y1 = 200 + 180 * Math.sin(startAngle);
                  const x2 = 200 + 180 * Math.cos(endAngle);
                  const y2 = 200 + 180 * Math.sin(endAngle);

                  const pathData = `M 200 200 L ${x1} ${y1} A 180 180 0 0 1 ${x2} ${y2} Z`;

                  // Calculate text position
                  const textAngle = (angle + nextAngle) / 2 - 90;
                  const textRadius = 120;
                  const textX = 200 + textRadius * Math.cos(textAngle * Math.PI / 180);
                  const textY = 200 + textRadius * Math.sin(textAngle * Math.PI / 180);

                  return (
                    <g key={index}>
                      <path
                        d={pathData}
                        fill={COLORS[index]}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="32"
                        fontWeight="bold"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
                {/* Center circle */}
                <circle cx="200" cy="200" r="30" fill="white" stroke="#333" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xl font-bold rounded-lg transition-colors"
          >
            {isSpinning ? 'Spinning...' : 'SPIN!'}
          </button>

          {/* Result Display */}
          {result !== null && !isSpinning && (
            <div className="text-2xl font-bold text-white bg-green-600 px-6 py-3 rounded-lg">
              Result: {SLICE_LABELS[result]}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#FFD93D', '#6BCF7F', '#B19CD9'
];

// Prize configuration: 6 slices with prizes, 2 without
const SLICES = [
  { id: 0, label: 'Rp 50K', prize: 50000, hasPrize: true },
  { id: 1, label: 'NO PRIZE', prize: 0, hasPrize: false },
  { id: 2, label: 'Rp 100K', prize: 100000, hasPrize: true },
  { id: 3, label: 'Rp 25K', prize: 25000, hasPrize: true },
  { id: 4, label: 'Rp 75K', prize: 75000, hasPrize: true },
  { id: 5, label: 'NO PRIZE', prize: 0, hasPrize: false },
  { id: 6, label: 'Rp 200K', prize: 200000, hasPrize: true },
  { id: 7, label: 'Rp 150K', prize: 150000, hasPrize: true },
];

const PRIZE_SLICES = SLICES.filter(s => s.hasPrize);
const NO_PRIZE_SLICES = SLICES.filter(s => !s.hasPrize);

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [winProbability, setWinProbability] = useState(60); // Win probability in percentage
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedSliceRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const spinWheel = () => {
    console.log('spinWheel called, isSpinning:', isSpinning);
    if (isSpinning) {
      console.log('Blocked: already spinning');
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSpinning(true);
    setResult(null);
    console.log('Starting spin...');

    // Weighted probability selection
    const random = Math.random() * 100; // 0-100
    let selectedSlice: number;

    if (random < winProbability) {
      // Win: select from prize slices with equal probability
      const prizeIndex = Math.floor(Math.random() * PRIZE_SLICES.length);
      selectedSlice = PRIZE_SLICES[prizeIndex].id;
    } else {
      // Lose: select from no-prize slices with equal probability
      const noPrizeIndex = Math.floor(Math.random() * NO_PRIZE_SLICES.length);
      selectedSlice = NO_PRIZE_SLICES[noPrizeIndex].id;
    }

    // Store in ref to ensure it's captured correctly
    selectedSliceRef.current = selectedSlice;
    console.log('Selected slice ID:', selectedSlice, 'Label:', SLICES[selectedSlice].label);

    // Calculate rotation to align selected slice with pointer at top
    const degreesPerSlice = 360 / 8; // 45 degrees per slice

    // Add random offset within the slice so it doesn't always land perfectly centered
    const randomOffset = (Math.random() - 0.5) * degreesPerSlice * 0.8; // 80% of slice width for safety

    // From testing: at rotation = 0, slice 7 is at top (not slice 0!)
    // So to get slice 0 at top, we need rotation = 45
    // To get slice 1 at top, we need rotation = 90
    // Pattern: to get slice N at top, rotation = (N + 1) * 45 mod 360
    let targetRotation = ((selectedSlice + 1) * degreesPerSlice) % 360;

    // We want to rotate relative to current position
    // Add 5 full rotations plus get to target position
    setRotation(prev => {
      const currentNormalized = prev % 360;
      let rotationNeeded = targetRotation - currentNormalized;

      // Ensure we always rotate forward
      if (rotationNeeded < 0) {
        rotationNeeded += 360;
      }

      // Add 5 full spins
      const totalRotation = 360 * 5 + rotationNeeded + randomOffset;

      console.log('Rotation calculation:', {
        prev,
        currentNormalized,
        targetRotation,
        rotationNeeded,
        randomOffset,
        totalRotation,
        finalRotation: prev + totalRotation
      });

      return prev + totalRotation;
    });

    // Stop after 3 seconds
    timeoutRef.current = setTimeout(() => {
      const finalResult = selectedSliceRef.current;
      console.log('Spin complete, result:', finalResult, 'Slice:', SLICES[finalResult]);

      // Force state updates using requestAnimationFrame for better reliability
      requestAnimationFrame(() => {
        setResult(finalResult);
        setIsSpinning(false);
        console.log('State updated - isSpinning should now be false');
      });

      timeoutRef.current = null;
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
          {/* Probability Slider */}
          <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg border-2 border-gray-700">
            <h3 className="text-white text-lg font-bold mb-4">Win Probability Control</h3>
            <div className="flex items-center gap-4 mb-2">
              <label className="text-white text-sm font-medium min-w-[140px]">
                Win Probability:
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={winProbability}
                onChange={(e) => setWinProbability(Number(e.target.value))}
                disabled={isSpinning}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-white font-bold min-w-[50px] text-right">
                {winProbability}%
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-4 space-y-1">
              <p>Each prize slice: {(winProbability / PRIZE_SLICES.length).toFixed(2)}%</p>
              <p>Each no-prize slice: {((100 - winProbability) / NO_PRIZE_SLICES.length).toFixed(2)}%</p>
            </div>
          </div>

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
                {SLICES.map((slice, index) => {
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
                        fontSize="24"
                        fontWeight="bold"
                      >
                        {slice.label}
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
            className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xl font-bold rounded-lg transition-colors relative z-20"
          >
            {isSpinning ? 'Spinning...' : 'SPIN!'}
          </button>

          {/* Result Display */}
          <div className="min-h-[60px] flex items-center justify-center">
            {result !== null && !isSpinning && SLICES[result] && (
              <div className={`text-2xl font-bold text-white px-6 py-3 rounded-lg ${
                SLICES[result].hasPrize ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {SLICES[result].hasPrize ? (
                  <span>You Won: {SLICES[result].label}!</span>
                ) : (
                  <span>No Prize - Try Again!</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

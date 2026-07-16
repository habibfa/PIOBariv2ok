import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  value: number;
  decimals?: number;
  duration?: number; // duration in ms
  className?: string;
  suffix?: string;
}

export default function CountUp({
  value,
  decimals = 2,
  duration = 350,
  className = "",
  suffix = "",
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const targetValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // If the target value is the same, do nothing
    if (value === targetValueRef.current) {
      return;
    }

    // Set up the animation from the current displayed value to the new target value
    startValueRef.current = displayValue;
    targetValueRef.current = value;
    startTimeRef.current = null;

    const animateCount = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing: easeOutQuad
      const ease = percentage * (2 - percentage);
      const currentVal = startValueRef.current + (targetValueRef.current - startValueRef.current) * ease;
      
      setDisplayValue(currentVal);

      if (progress < duration) {
        requestRef.current = requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(targetValueRef.current);
      }
    };

    requestRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [value, duration, displayValue]);

  // Handle case where value is initially loaded
  useEffect(() => {
    // Sync if display value is far from target when component mounts or updates without animation
    if (Math.abs(displayValue - value) > 10000) {
      setDisplayValue(value);
      startValueRef.current = value;
      targetValueRef.current = value;
    }
  }, [value]);

  const formatted = displayValue.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {formatted}
      {suffix}
    </span>
  );
}

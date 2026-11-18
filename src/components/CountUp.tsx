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
  duration = 220,
  className = "",
  suffix = "",
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentDisplayedRef = useRef(value);
  const startValueRef = useRef(value);
  const targetValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === targetValueRef.current) {
      return;
    }

    if (Math.abs(currentDisplayedRef.current - value) > 10000) {
      currentDisplayedRef.current = value;
      startValueRef.current = value;
      targetValueRef.current = value;
      setDisplayValue(value);
      return;
    }

    startValueRef.current = currentDisplayedRef.current;
    targetValueRef.current = value;
    startTimeRef.current = null;

    const animateCount = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      const ease = percentage * (2 - percentage);
      const currentVal =
        startValueRef.current + (targetValueRef.current - startValueRef.current) * ease;

      currentDisplayedRef.current = currentVal;
      setDisplayValue(currentVal);

      if (progress < duration) {
        requestRef.current = requestAnimationFrame(animateCount);
      } else {
        currentDisplayedRef.current = targetValueRef.current;
        setDisplayValue(targetValueRef.current);
      }
    };

    requestRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [value, duration]);

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

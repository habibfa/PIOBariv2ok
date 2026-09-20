import React from "react";

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

/**
 * Highlights keywords inside text matching query tokens.
 * Supports simultaneous multi-word queries (e.g. "antibiotik saluran kemih").
 */
export default function HighlightText({
  text,
  query,
  className = "bg-amber-200 text-amber-950 font-bold px-0.5 py-0.2 rounded-xs border border-amber-300/80 shadow-2xs"
}: HighlightTextProps) {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <>{text}</>;
  }

  // Extract non-empty tokens and escape regex special characters
  const rawTokens = query
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0);

  // Remove duplicates and sort descending by length so longer tokens match first
  const uniqueTokens = Array.from(new Set(rawTokens.map(t => t.toLowerCase())))
    .sort((a, b) => b.length - a.length);

  const escapedTokens = uniqueTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (escapedTokens.length === 0) {
    return <>{text}</>;
  }

  try {
    const pattern = new RegExp(`(${escapedTokens.join("|")})`, "gi");
    const parts = text.split(pattern);

    return (
      <>
        {parts.map((part, index) => {
          const isMatch = uniqueTokens.some(
            token => token.toLowerCase() === part.toLowerCase()
          );

          if (isMatch) {
            return (
              <mark key={index} className={className}>
                {part}
              </mark>
            );
          }

          return <React.Fragment key={index}>{part}</React.Fragment>;
        })}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}

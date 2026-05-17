import { Fragment } from "react";

const TWYN_URL = "https://twyn.org";

// Whole-word match for "Twyn" (case-insensitive). Avoids breaking words that
// happen to contain those letters.
const PATTERN = /\b(twyn)\b/gi;

export default function linkifyTwyn(input) {
  if (input == null) return input;
  if (typeof input !== "string") return input;

  const parts = input.split(PATTERN);
  if (parts.length === 1) return input;

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // matched group — preserve original casing the author wrote
      return (
        <a
          key={i}
          href={TWYN_URL}
          target="_blank"
          rel="noreferrer"
          className="twyn-link"
        >
          {part}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

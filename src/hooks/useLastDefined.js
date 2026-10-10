import { useState } from "react";

// Keeps the last non-null value so a dialog can animate out with its
// content still rendered after the parent has cleared it.
export function useLastDefined(value) {
  const [last, setLast] = useState(value);
  if (value != null && value !== last) setLast(value);
  return value ?? last;
}

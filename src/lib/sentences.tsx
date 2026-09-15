import { Fragment, type ReactNode } from "react";

const SENTENCE_BREAK = /(?<=\.)\s+(?=[A-ZÄÖÜ])/;

export function breakSentences(text: string): ReactNode {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .split(SENTENCE_BREAK)
    .filter(Boolean);

  if (parts.length <= 1) return text;

  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {part}
    </Fragment>
  ));
}

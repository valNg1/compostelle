import { useMemo } from "react";
import {
  buildAnnotatedSegments,
  type Annotation,
} from "../domain/learning";

interface AnnotatedTextProps {
  body: string;
  annotations: Annotation[];
  onOpen: (annotation: Annotation) => void;
  activeId?: string | null;
}

/**
 * Renders a content body with tappable expressions (UNDERSTAND). Tapping an
 * expression opens its short help without leaving the reading flow.
 */
export function AnnotatedText({
  body,
  annotations,
  onOpen,
  activeId,
}: AnnotatedTextProps) {
  const segments = useMemo(
    () => buildAnnotatedSegments(body, annotations),
    [body, annotations],
  );

  return (
    <p className="reading">
      {segments.map((seg, i) =>
        seg.annotation ? (
          <button
            key={i}
            type="button"
            className={
              "annot" + (activeId === seg.annotation.id ? " annot--on" : "")
            }
            aria-expanded={activeId === seg.annotation.id}
            onClick={() => onOpen(seg.annotation!)}
          >
            {seg.text}
          </button>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}

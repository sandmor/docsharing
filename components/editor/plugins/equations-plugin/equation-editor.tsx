import type { JSX, Ref, RefObject } from "react";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
};

function EquationEditor(
  { equation, setEquation, inline }: BaseEquationEditorProps,
  forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>
): JSX.Element {
  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEquation(event.target.value);
  };

  return inline ? (
    <div className="flex items-center bg-muted rounded-md">
      <span className="text-muted-foreground px-2">$</span>
      <Input
        className="bg-transparent border-none focus-visible:ring-0 text-sm"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardedRef as RefObject<HTMLInputElement>}
      />
      <span className="text-muted-foreground px-2">$</span>
    </div>
  ) : (
    <div className="flex items-center bg-muted rounded-md">
      <span className="text-muted-foreground px-2">$$</span>
      <Textarea
        className="bg-transparent border-none focus-visible:ring-0 text-sm resize-none"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardedRef as RefObject<HTMLTextAreaElement>}
      />
      <span className="text-muted-foreground px-2">$$</span>
    </div>
  );
}

export default forwardRef(EquationEditor);

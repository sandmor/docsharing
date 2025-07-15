import type { JSX } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as React from "react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import KatexRenderer from "./katex-renderer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({
  onConfirm,
  initialEquation = "",
}: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inline-equation"
          checked={inline}
          onCheckedChange={onCheckboxChange}
        />
        <Label htmlFor="inline-equation">Inline</Label>
      </div>
      <div>
        <Label>Equation</Label>
        <div className="mt-2">
          {inline ? (
            <Input
              onChange={(event) => {
                setEquation(event.target.value);
              }}
              value={equation}
              className="bg-transparent"
            />
          ) : (
            <Textarea
              onChange={(event) => {
                setEquation(event.target.value);
              }}
              value={equation}
              className="bg-transparent min-h-[100px]"
            />
          )}
        </div>
      </div>
      <div>
        <Label>Visualization</Label>
        <div className="mt-2 p-4 rounded-md bg-muted min-h-[100px] flex items-center justify-center">
          <KatexRenderer
            equation={equation}
            inline={false}
            onDoubleClick={() => null}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onClick}>Confirm</Button>
      </div>
    </div>
  );
}

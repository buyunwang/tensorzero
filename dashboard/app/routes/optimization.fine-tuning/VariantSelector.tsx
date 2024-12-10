import { Control } from "react-hook-form";
import { FormValues } from "./route";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ChatCompletionConfig } from "~/utils/config/variant";
import { TemplateDetailsDialog } from "./TemplateDetailsDialog";

type VariantSelectorProps = {
  control: Control<FormValues>;
  chatCompletionVariants: Record<string, ChatCompletionConfig>;
};

export function VariantSelector({
  control,
  chatCompletionVariants,
}: VariantSelectorProps) {
  return (
    <FormField
      control={control}
      name="variant"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Variant Name (for prompt templating)</FormLabel>
          <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a variant name" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(chatCompletionVariants).map(([name]) => (
                  <SelectItem key={name} value={name}>
                    <span>{name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TemplateDetailsDialog
              variant={field.value}
              disabled={!field.value}
              chatCompletionVariants={chatCompletionVariants}
            />
          </div>
        </FormItem>
      )}
    />
  );
}

import { DollarSignIcon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const CurrencyInput = () => (
  <Field className="w-full max-w-sm">
    <FieldLabel htmlFor="currency-amount">Amount</FieldLabel>
    <InputGroup className="bg-background">
      <InputGroupInput
        id="currency-amount"
        min="0"
        placeholder="0.00"
        step="0.01"
        type="number"
      />
      <InputGroupAddon>
        <DollarSignIcon aria-hidden="true" />
      </InputGroupAddon>
    </InputGroup>
    <FieldDescription>Enter amount in USD</FieldDescription>
  </Field>
);

export default CurrencyInput;

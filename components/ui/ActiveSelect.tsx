import { NativeSelect } from "@chakra-ui/react";

type SelectItem = {
  label: string;
  value: string;
};

type ActiveSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  items: SelectItem[];
  size?: "xs" | "sm" | "md" | "lg";
  width?: string;        // optional custom width
  isDisabled?: boolean;
};

export default function ActiveSelect({
  value,
  onChange,
  items,
  size = "sm",
  width = "100%",
  isDisabled = false,
}: ActiveSelectProps) {
  return (
    <NativeSelect.Root size={size} width={width}>
      <NativeSelect.Field
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        bg="gray.100"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="full"
        _focus={{
          borderColor: "blue.400",
          boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
        }}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </NativeSelect.Field>

      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
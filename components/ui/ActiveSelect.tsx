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
  fontSize?: "xs" | "sm" | "md" | "lg"; // font size for options
};

// Map Chakra fontSize keywords to actual CSS values
const fontSizeMap: Record<string, string> = {
  xs: "0.7rem", // 12px
  sm: "0.825rem", // 14px
  md: "0.9rem", // 16px
  lg: "1rem", // 18px
};

export default function ActiveSelect({
  value,
  onChange,
  items,
  size = "sm",
  width = "100%",
  isDisabled = false,
  fontSize = "sm"
}: ActiveSelectProps) {
  return (
    <NativeSelect.Root size={size} width={width} disabled={isDisabled}>
      <NativeSelect.Field
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        bg="gray.100"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="full"
        _focus={{
          borderColor: "blue.400",
          boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
        }}
        fontWeight='normal'
        fontSize={fontSizeMap[fontSize]}
      >
        {items.map((item) => (
          <option
            key={item.value}
            value={item.value}
            style={{ fontSize: fontSizeMap[fontSize] ,fontWeight:'normal' }}
          >
            {item.label}
          </option>
        ))}
      </NativeSelect.Field>

      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
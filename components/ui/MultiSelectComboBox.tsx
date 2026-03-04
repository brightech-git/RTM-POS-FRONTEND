"use client";

import React, { useEffect, useState, forwardRef } from "react";
import {
    Box,
    Field,
    Combobox,
    Portal,
    useListCollection,
    useFilter,
    Text,
    HStack,
    Checkbox,
} from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";

export type SelectItem = {
    label: string;
    value: string;
};

type MultiSelectComboboxProps = {
    label?: string;
    value: string[];
    onChange: (value: string[]) => void;
    editId?: number | null;
    items: SelectItem[];
    placeholder?: string;
    rounded?: string;
    disable?: boolean;
    onEnter?: () => void;
};

export const MultiSelectCombobox = forwardRef<HTMLInputElement, MultiSelectComboboxProps>(({
    label,
    value = [],
    onChange,
    editId,
    items,
    placeholder = "Select options",
    rounded = "full",
    disable,
    onEnter,
}, ref) => {
    const { contains } = useFilter({ sensitivity: "base" });
    const [typedInput, setTypedInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
    
    const { collection, filter: applyFilter, set: setCollection } = useListCollection({
        initialItems: items,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        filter: contains,
    });

    // Update collection when items change
    useEffect(() => {
        setCollection(items || []);
        applyFilter("");
    }, [items, setCollection, applyFilter]);

    // Reset filter when editId changes
    useEffect(() => {
        applyFilter("");
    }, [editId, applyFilter]);

    // Clear value when disabled
    useEffect(() => {
        if (disable) {
            onChange([]);
        }
    }, [disable, onChange]);

    const toggleItem = (itemValue: string) => {
        if (value.includes(itemValue)) {
            // Remove item
            onChange(value.filter(v => v !== itemValue));
        } else {
            // Add item (no max limit)
            onChange([...value, itemValue]);
        }
        // Keep dropdown open for multiple selections
    };

    // Get display text for input
    const getDisplayText = () => {
        if (value.length === 0) return "";
        if (value.length === 1) {
            const item = items.find(i => i.value === value[0]);
            return item?.label || value[0];
        }
        return `${value.length} items selected`;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();

            if (highlightedValue) {
                toggleItem(highlightedValue);
            }

            setTypedInput("");
            setHighlightedValue(null);
            // Don't close on Enter to allow multiple selections

            setTimeout(() => {
                if (onEnter) onEnter();
            }, 50);
        }
    };

    return (
        <Field.Root>
            {label && <Field.Label fontSize="2xs">{label}</Field.Label>}

            <Box position="relative">
                <Combobox.Root
                    key={`${editId ?? "null"}-${value.join(",")}`}
                    collection={collection}
                    value={[]} // Don't set value here as we're handling multi-select separately
                    inputValue={typedInput}
                    open={isOpen}
                    onOpenChange={(e) => setIsOpen(e.open)}
                    onValueChange={() => {}} // Handled by our custom toggle
                    onInputValueChange={(e) => {
                        const upper = e.inputValue.toUpperCase();
                        setTypedInput(upper);
                        applyFilter(upper);
                        if (upper.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    size="xs"
                    onHighlightChange={(e) => {
                        setHighlightedValue(e.highlightedValue);
                    }}
                    openOnClick={!disable}
                    multiple={false}
                >
                    <Combobox.Control rounded={rounded}>
                        <Box
                            display="flex"
                            alignItems="center"
                            minH="30px"
                            w="100%"
                            bg={disable ? "#f5f5f5" : "#eee"}
                            border="1px solid #e5e7eb"
                            borderRadius="20px"
                            cursor="pointer"
                            onClick={() => !disable && setIsOpen(true)}
                            px={3}
                            py={1}
                        >
                            {/* Display text */}
                            <Text 
                                fontSize="2xs" 
                                flex={1}
                                color={value.length === 0 ? "gray.500" : "#111827"}
                            >
                                {value.length === 0 ? placeholder : getDisplayText()}
                            </Text>
                            
                            {/* Dropdown indicator */}
                            <Box color="gray.500" ml={2}>
                                <FaChevronDown size={12} />
                            </Box>
                        </Box>
                    </Combobox.Control>
                    
                    {!disable && (
                        <Portal>
                            <Combobox.Positioner mt={-1.5} zIndex={1500}>
                                <Combobox.Content maxH="200px" overflowY="auto">
                                    <Combobox.Empty fontSize="2xs">
                                        No items found
                                    </Combobox.Empty>
                                    {collection.items.map((item) => (
                                        <Box
                                            key={item.value}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleItem(item.value);
                                            }}
                                            cursor="pointer"
                                            _hover={{ bg: "gray.100" }}
                                            py={2}
                                            px={3}
                                            fontSize="2xs"
                                            textTransform="uppercase"
                                            borderBottom="1px solid"
                                            borderColor="gray.100"
                                        >
                                            <HStack gap={3}>
                                                <Checkbox.Root
                                                    checked={value.includes(item.value)}
                                                    onChange={() => {}} // Handled by parent click
                                                    size="xs"
                                                >
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control 
                                                        borderRadius="sm"
                                                        border="1px solid"
                                                        borderColor="gray.300"
                                                        bg="white"
                                                        _checked={{
                                                            bg: "blue.500",
                                                            color: "white",
                                                            borderColor: "blue.500",
                                                        }}
                                                    >
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Control>
                                                </Checkbox.Root>
                                                <Text flex={1}>{item.label.toUpperCase()}</Text>
                                            </HStack>
                                        </Box>
                                    ))}
                                </Combobox.Content>
                            </Combobox.Positioner>
                        </Portal>
                    )}
                </Combobox.Root>
            </Box>
        </Field.Root>
    );
});

MultiSelectCombobox.displayName = 'MultiSelectCombobox';
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    Box,
    VStack,
    HStack,
    Input,
    Text,
    Badge,
    InputGroup,
    Kbd,
    Grid,
} from "@chakra-ui/react";
import { IoSearch } from "react-icons/io5";
import { useGlobalKey } from "@/components/key/useGlobalKey";

export interface SelectionItem {
    id: string | number;
    name: string;
    code?: string | number;
    [key: string]: any;
}

export interface ColumnConfig {
    key: string;
    label: string;
    width?: string;
    render?: (item: any) => React.ReactNode;
}

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: SelectionItem[];
    onSelect: (item: SelectionItem) => void;
    title?: string;
    searchPlaceholder?: string;
    searchKeys?: string[];
    columns?: ColumnConfig[];
    renderItem?: (item: SelectionItem, isSelected: boolean) => React.ReactNode;
    idKey?: string;
    nameKey?: string;
    codeKey?: string;
    showCode?: boolean;
}

export function SelectionModal({
    isOpen,
    onClose,
    items,
    onSelect,
    title = "Select Item",
    searchPlaceholder = "Search...",
    searchKeys = ["name", "code"],
    columns,
    renderItem,
    idKey = "id",
    nameKey = "name",
    codeKey = "code",
    showCode = true,
}: SelectionModalProps) {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const listRefs = useRef<(HTMLDivElement | null)[]>([]);

    /* ---------------- Normalize Items ---------------- */

    const normalizedItems = items.map((item) => ({
        id: item[idKey]?.toString() ?? item.id?.toString(),
        name: item[nameKey] ?? item.name,
        code: item[codeKey]?.toString() ?? item.code?.toString(),
        original: item,
    }));

    /* ---------------- Search Filter ---------------- */

    const filteredItems = normalizedItems.filter((item) => {
        const searchLower = search.toLowerCase();

        return searchKeys.some((key) => {
            const value =
                (item.original as any)?.[key]?.toString().toLowerCase() ??
                (item as any)?.[key]?.toString().toLowerCase() ??
                "";

            return value?.includes(searchLower);
        });
    });

    /* ---------------- Reset Selected ---------------- */

    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredItems.length]);

    /* ---------------- Focus Search ---------------- */

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            setSearch("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    /* ---------------- Scroll Selected ---------------- */

    useEffect(() => {
        listRefs.current[selectedIndex]?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
        });
    }, [selectedIndex]);

    /* ---------------- Keyboard Navigation ---------------- */

    useGlobalKey(
        "ArrowDown",
        (e) => {
            if (!isOpen) return;
            e.preventDefault();

            setSelectedIndex((prev) =>
                prev < filteredItems.length - 1 ? prev + 1 : prev
            );
        },
        `selection-${title}`
    );

    useGlobalKey(
        "ArrowUp",
        (e) => {
            if (!isOpen) return;
            e.preventDefault();

            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        },
        `selection-${title}`
    );

    useGlobalKey(
        "Enter",
        (e) => {
            if (!isOpen || filteredItems.length === 0) return;
            e.preventDefault();

            const item = filteredItems[selectedIndex];
            if (!item) return;

            onSelect(item.original);
            onClose();
        },
        `selection-${title}`
    );

    useGlobalKey(
        "Escape",
        (e) => {
            if (!isOpen) return;
            e.preventDefault();
            onClose();
        },
        `selection-${title}`
    );

    /* ---------------- Click Handler ---------------- */

    const handleItemClick = (item: typeof normalizedItems[0]) => {
        onSelect(item.original);
        onClose();
    };

    /* ---------------- Default Item ---------------- */

    const defaultRenderItem = (
        item: typeof normalizedItems[0],
        isSelected: boolean
    ) => (
        <HStack justify="space-between" width="100%">
            <VStack align="start">
                <Text fontWeight="medium">{item.name}</Text>

                {showCode && item.code && (
                    <Text fontSize="sm" color="gray.500">
                        Code: {item.code}
                    </Text>
                )}
            </VStack>

            {isSelected && (
                <Badge colorScheme="blue" fontSize="xs">
                    Enter
                </Badge>
            )}
        </HStack>
    );

    /* ---------------- Grid Item ---------------- */

    const gridRenderItem = (
        item: typeof normalizedItems[0],
        isSelected: boolean
    ) => (
        <Grid
            templateColumns={columns?.map((c) => c.width ?? "1fr").join(" ")}
            gap={2}
            width="100%"
            alignItems="center"
        >
            {columns?.map((col) => (
                <Box key={col.key}>
                    {col.render
                        ? col.render(item.original)
                        : item.original?.[col.key]?.toString() ?? "-"}
                </Box>
            ))}

            {isSelected && (
                <Badge colorScheme="blue" fontSize="xs">
                    Selected
                </Badge>
            )}
        </Grid>
    );

    /* ---------------- UI ---------------- */

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />

            <Dialog.Positioner>
                <Dialog.Content maxW="700px">
                    <Dialog.Header>
                        <Dialog.Title>{title}</Dialog.Title>
                    </Dialog.Header>

                    <Dialog.Body>
                        <VStack gap={4}>
                            {/* Search */}

                            <InputGroup startElement={<IoSearch />}>
                                <Input
                                    ref={searchInputRef}
                                    placeholder={searchPlaceholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>

                            {/* Column Header */}

                            {columns && (
                                <Grid
                                    templateColumns={columns.map((c) => c.width ?? "1fr").join(" ")}
                                    gap={2}
                                    width="100%"
                                    fontSize="sm"
                                    fontWeight="bold"
                                >
                                    {columns.map((col) => (
                                        <Text key={col.key}>{col.label}</Text>
                                    ))}

                                    <Box>Action</Box>
                                </Grid>
                            )}

                            {/* List */}

                            <Box
                                width="100%"
                                maxH="400px"
                                overflowY="auto"
                                borderWidth="1px"
                                borderRadius="md"
                                p={2}
                            >
                                {filteredItems.length === 0 ? (
                                    <Text textAlign="center" py={6}>
                                        No items found
                                    </Text>
                                ) : (
                                    <VStack align="stretch">
                                        {filteredItems.map((item, index) => (
                                            <Box
                                                key={item.id}
                                                ref={(el: HTMLDivElement | null) => {
                                                    listRefs.current[index] = el;
                                                }}
                                                p={3}
                                                bg={selectedIndex === index ? "blue.50" : "transparent"}
                                                borderWidth={selectedIndex === index ? "1px" : "0"}
                                                borderColor="blue.300"
                                                borderRadius="md"
                                                cursor="pointer"
                                                onClick={() => handleItemClick(item)}
                                            >
                                                {renderItem
                                                    ? renderItem(item.original, selectedIndex === index)
                                                    : columns
                                                        ? gridRenderItem(item, selectedIndex === index)
                                                        : defaultRenderItem(item, selectedIndex === index)}
                                            </Box>
                                        ))}
                                    </VStack>
                                )}
                            </Box>

                            {/* Keyboard Info */}

                            <HStack fontSize="sm" color="gray.500">
                                <Kbd>↑</Kbd>
                                <Kbd>↓</Kbd>
                                <Text>Navigate</Text>

                                <Kbd>Enter</Kbd>
                                <Text>Select</Text>

                                <Kbd>Esc</Kbd>
                                <Text>Close</Text>
                            </HStack>
                        </VStack>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
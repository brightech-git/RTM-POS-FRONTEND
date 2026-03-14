// app/tagprint/page.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    Box,
    Button,
    Grid,
    GridItem,
    Input,
    Text,
    HStack,
    VStack,
    Flex,
    Spinner,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    DialogCloseTrigger,
    DialogTitle,
} from "@chakra-ui/react/dialog";
import {
    AiOutlineReload,
    AiOutlineCopy
} from "react-icons/ai";
import {
    FaTag,
} from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { useTheme } from "@/context/theme/themeContext";
import { useAllTagPrint, useFilterTagPrint, useDuplicateTagPrint } from "@/hooks/TagPrint/useTagPrint";
import { TagPrintItem, TagPrintFilter } from "@/types/TagPrint/TagPrint";
import { toaster, Toaster } from "@/components/ui/toaster";

// ─── Design Tokens ────────────────────────────────────────────────────────
const tokens = {
    navy: "#0f1e35",
    navyMid: "#1a3254",
    navyLight: "#243b55",
    accent: "#3d8ef8",
    accentHover: "#2d7de8",
    accentGlow: "rgba(61,142,248,0.18)",
    green: "#10b97a",
    violet: "#7c5cfc",
    surface: "#f7f9fc",
    surfaceAlt: "#eef2f8",
    border: "#dde4ef",
    borderLight: "#edf1f8",
    text: "#1a2540",
    textMid: "#4a5872",
    textLight: "#8694ae",
    headerBg: "linear-gradient(135deg, #0f1e35 0%, #1a3254 60%, #1e3f6a 100%)",
};

// ─── Field Label ────────────────────────────────────────────────────────────
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Text
        fontSize="9px"
        fontWeight="700"
        color={tokens.textLight}
        letterSpacing="0.1em"
        textTransform="uppercase"
        mb="4px"
    >
        {children}
    </Text>
);

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function TagPrintPage() {
    const { theme } = useTheme();

    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [filters, setFilters] = useState<TagPrintFilter>({
        fromDate: getTodayDateString(),
        billNo: "",
        fromTagNo: "",
        toTagNo: "",
    });

    const [debouncedFilters, setDebouncedFilters] = useState<TagPrintFilter>(filters);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [duplicateResult, setDuplicateResult] = useState<{
        count: number;
        message: string;
        billNos?: number[];
        tagNos?: string[];
    } | null>(null);

    // Debounce filter changes for auto-search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    // Queries
    const { data: allData, isLoading: isAllLoading, refetch } = useAllTagPrint();
    const { data: filteredData, isLoading: isFilterLoading, refetch: refetchFiltered } =
        useFilterTagPrint(debouncedFilters);

    const duplicateMutation = useDuplicateTagPrint();

    const isLoading = isAllLoading || isFilterLoading;

    // Transform API data
    const tagPrintList = useMemo(() => {
        const items = filteredData?.data || allData?.data;

        if (!items || !Array.isArray(items)) return [];

        return items.map((item: TagPrintItem) => ({
            rowSign: item.ROWSIGN || "",
            billNo: item.BILLNO || 0,
            billDate: item.CREATEDDATE || "",
            vendorName: item.VENDORNAME || `V-${item.VENDORCODE}`,
            tagNo: item.TAGNO || "",
            productCode: item.PRODUCTCODE || 0,
            productName: item.PRODUCTNAME || "",
            subProductCode: item.SUBPRODUCTCODE || 0,
            hsnCode: item.HSNCODE || "",
            purRate: item.PURRATE || 0,
            pieces: item.PIECES || 0,
            weight: item.WEIGHT || 0,
            discPer: item.DISCPER || 0,
            sellingRate: item.SELLINGRATE || 0,
            mrp: item.MRP || 0,
            uniqueKey: item.UNIQUEKEY || "",
        }));
    }, [allData, filteredData]);

    const handleFilterChange = useCallback((field: keyof TagPrintFilter, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            fromDate: getTodayDateString(),
            billNo: "",
            fromTagNo: "",
            toTagNo: "",
        });
    }, [getTodayDateString]);

    const handleRefresh = useCallback(async () => {
        try {
            await refetch();
            if (Object.keys(debouncedFilters).length > 0) {
                await refetchFiltered();
            }
            toaster.success({ title: "Refreshed", description: "Tag print list updated.", duration: 3000 });
        } catch {
            toaster.error({ title: "Error", description: "Failed to refresh data", duration: 3000 });
        }
    }, [refetch, refetchFiltered, debouncedFilters]);

    const handleDuplicate = useCallback(async () => {
        if (tagPrintList.length === 0) {
            toaster.warning({
                title: "No data to duplicate",
                description: "Please apply filters to get data first",
                duration: 3000
            });
            return;
        }

        // Only send filters that have values
        const duplicateFilters: TagPrintFilter = {};
        if (filters.fromDate) duplicateFilters.fromDate = filters.fromDate;
        if (filters.billNo) duplicateFilters.billNo = filters.billNo;
        if (filters.fromTagNo) duplicateFilters.fromTagNo = filters.fromTagNo;
        if (filters.toTagNo) duplicateFilters.toTagNo = filters.toTagNo;

        try {
            const result = await duplicateMutation.mutateAsync(duplicateFilters);

            // Extract bill numbers and tag numbers from filtered list
            const uniqueBillNos = [...new Set(tagPrintList.map(item => item.billNo))];
            const tagNos = tagPrintList.map(item => item.tagNo);

            setDuplicateResult({
                count: result.count,
                message: result.message,
                billNos: uniqueBillNos,
                tagNos: tagNos,
            });
            setShowDuplicateDialog(true);

            // Refresh the data
            await handleRefresh();

        } catch (error) {
            // Error is handled in mutation onError
        }
    }, [duplicateMutation, tagPrintList, filters, handleRefresh]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString)
                .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                .replace(/ /g, "-");
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return "—";
        return `₹${value.toFixed(2)}`;
    };

    const totals = useMemo(() => {
        return {
            totalPcs: tagPrintList.reduce((a, b) => a + (b.pieces || 0), 0),
            totalWt: tagPrintList.reduce((a, b) => a + (b.weight || 0), 0),
            rowCount: tagPrintList.length,
            uniqueBills: [...new Set(tagPrintList.map(r => r.billNo))].length,
        };
    }, [tagPrintList]);

    const hasActiveFilters = useMemo(() => {
        return !!(filters.billNo || filters.fromTagNo || filters.toTagNo);
    }, [filters]);

    // Input style
    const inputStyle = {
        size: "xs" as const,
        bg: "white",
        borderColor: tokens.border,
        borderRadius: "8px",
        fontSize: "12px",
        height: "30px",
        color: tokens.text,
        _focus: {
            borderColor: tokens.accent,
            boxShadow: `0 0 0 3px ${tokens.accentGlow}`,
            outline: "none",
        },
        _hover: { borderColor: "#b8c4d8" },
        _placeholder: { color: tokens.textLight, fontSize: "11px" },
    };

    const tableHeaderCols = [
        { label: "Bill No", align: "left" },
        { label: "Date", align: "left" },
        { label: "Vendor", align: "left" },
        { label: "Tag No", align: "left" },
        { label: "Product", align: "right" },
        { label: "HSN", align: "left" },
        { label: "Pur Rate", align: "right" },
        { label: "Pcs", align: "right" },
        { label: "Weight", align: "right" },
        { label: "Disc %", align: "right" },
        { label: "Sell Rate", align: "right" },
        { label: "MRP", align: "right" },
        { label: "Unique Key", align: "left" },
    ];

    return (
        <>
            <Toaster />

            {/* Duplicate Success Dialog */}
            <DialogRoot open={showDuplicateDialog} onOpenChange={({ open }) => setShowDuplicateDialog(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle color={tokens.green}>
                            <HStack gap={2}>
                                <Box as={FaTag} color={tokens.green} />
                                <Text>Tags Generated Successfully</Text>
                            </HStack>
                        </DialogTitle>
                        <DialogCloseTrigger />
                    </DialogHeader>
                    <DialogBody>
                        <VStack gap={4} align="stretch">
                            {/* Summary Box */}
                            <Box
                                p={4}
                                bg={`${tokens.green}10`}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={`${tokens.green}30`}
                            >
                                <Text fontSize="lg" fontWeight="bold" color={tokens.green} mb={2}>
                                    {duplicateResult?.count} New Tag(s) Created
                                </Text>
                                <Text fontSize="sm" color={tokens.textMid}>
                                    {duplicateResult?.message}
                                </Text>
                            </Box>

                            {/* Bill Numbers */}
                            {duplicateResult?.billNos && duplicateResult.billNos.length > 0 && (
                                <Box>
                                    <Text fontSize="sm" fontWeight="600" color={tokens.text} mb={2}>
                                        Bill Numbers:
                                    </Text>
                                    <Flex gap={2} flexWrap="wrap">
                                        {duplicateResult.billNos.map((billNo, index) => (
                                            <Box
                                                key={index}
                                                px={3}
                                                py={1.5}
                                                bg={tokens.surfaceAlt}
                                                borderRadius="md"
                                                border="1px solid"
                                                borderColor={tokens.border}
                                            >
                                                <Text fontSize="sm" fontWeight="600" color={tokens.accent}>
                                                    #{billNo}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Flex>
                                </Box>
                            )}

                            {/* Tag Numbers */}
                            {duplicateResult?.tagNos && duplicateResult.tagNos.length > 0 && (
                                <Box>
                                    <Text fontSize="sm" fontWeight="600" color={tokens.text} mb={2}>
                                        Generated Tag Numbers:
                                    </Text>
                                    <Box
                                        maxH="200px"
                                        overflowY="auto"
                                        p={2}
                                        bg={tokens.surface}
                                        borderRadius="md"
                                        border="1px solid"
                                        borderColor={tokens.border}
                                    >
                                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                                            {duplicateResult.tagNos.map((tagNo, index) => (
                                                <Box
                                                    key={index}
                                                    p={2}
                                                    bg="white"
                                                    borderRadius="md"
                                                    border="1px solid"
                                                    borderColor={tokens.borderLight}
                                                >
                                                    <Text fontSize="xs" fontFamily="mono" fontWeight="600" color={tokens.violet}>
                                                        {tagNo}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Grid>
                                    </Box>
                                    <Text fontSize="xs" color={tokens.textLight} mt={1}>
                                        Total: {duplicateResult.tagNos.length} tags
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            size="sm"
                            bg={tokens.green}
                            color="white"
                            onClick={() => {
                                setShowDuplicateDialog(false);
                                // launch local POS app
                                window.location.href = "mypos://launch";
                            }}
                            _hover={{ bg: "#0da06b" }}
                            px={6}
                        >
                            Print the tags
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogRoot>

            {/* ── Page Container ── */}
            <Box
                bg={tokens.surface}
                minH="100vh"
                p={{ base: 3, md: 4 }}
                fontFamily="'DM Sans', 'Segoe UI', sans-serif"
            >
                <VStack gap={3.5} align="stretch" maxW="1500px" mx="auto">

                    {/* ── Page Title Bar ── */}
                    <Flex align="center" justify="space-between" mb={0.5}>
                        <HStack gap={3}>
                            <Box
                                w="38px"
                                h="38px"
                                borderRadius="11px"
                                bg={tokens.headerBg}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxShadow={`0 4px 14px ${tokens.accentGlow}`}
                                color="white"
                                fontSize="16px"
                            >
                                <FaTag />
                            </Box>
                            <Box>
                                <Text fontSize="16px" fontWeight="800" color={tokens.text} letterSpacing="-0.02em" lineHeight="1.1">
                                    Tag Print Management
                                </Text>
                                <Text fontSize="10px" color={tokens.textLight} fontWeight="500" mt="1px">
                                    View and manage generated tags for printing
                                </Text>
                            </Box>
                        </HStack>
                    </Flex>

                    {/* ── Filter Card ── */}
                    <Box
                        bg="white"
                        borderRadius="16px"
                        p={4}
                        boxShadow="0 2px 12px rgba(15,30,53,0.07)"
                        border="1px solid"
                        borderColor={tokens.borderLight}
                    >
                        <Flex direction={{ base: "column", md: "row" }} align={{ md: "center" }} justify="space-between" gap={3}>
                            {/* Filters Section */}
                            <HStack gap={3} flex={1} flexWrap={{ base: "wrap", md: "nowrap" }}>
                                <Box minW={{ md: "180px" }}>
                                    <FieldLabel>Bill No</FieldLabel>
                                    <Input
                                        placeholder="e.g. 84"
                                        value={filters.billNo}
                                        onChange={(e) => handleFilterChange("billNo", e.target.value)}
                                        {...inputStyle}
                                    />
                                </Box>

                                <Box minW={{ md: "180px" }}>
                                    <FieldLabel>Bill Date</FieldLabel>
                                    <Input
                                        type="date"
                                        value={filters.fromDate}
                                        onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                                        {...inputStyle}
                                    />
                                </Box>

                                <Box minW={{ md: "180px" }}>
                                    <FieldLabel>From Tag</FieldLabel>
                                    <Input
                                        placeholder="e.g. L1785"
                                        value={filters.fromTagNo}
                                        onChange={(e) => handleFilterChange("fromTagNo", e.target.value)}
                                        {...inputStyle}
                                    />
                                </Box>

                                <Box minW={{ md: "180px" }}>
                                    <FieldLabel>To Tag</FieldLabel>
                                    <Input
                                        placeholder="e.g. L1790"
                                        value={filters.toTagNo}
                                        onChange={(e) => handleFilterChange("toTagNo", e.target.value)}
                                        {...inputStyle}
                                    />
                                </Box>
                            </HStack>

                            {/* Buttons Section */}
                            <HStack gap={2} align="flex-end">
                                {/* Duplicate Button */}
                                <Button
                                    size="xs"
                                    h="30px"
                                    px={3.5}
                                    borderRadius="8px"
                                    fontSize="11px"
                                    fontWeight="700"
                                    bg={tokens.violet}
                                    color="white"
                                    loading={duplicateMutation.isPending}
                                    loadingText="Generating…"
                                    onClick={handleDuplicate}
                                    _hover={{ bg: "#6a4be0" }}
                                    gap={1.5}
                                    disabled={tagPrintList.length === 0}
                                >
                                    <AiOutlineCopy /> Duplicate ({tagPrintList.length})
                                </Button>

                                {/* Reset Button */}
                                <Button
                                    size="xs"
                                    h="26px"
                                    px={2.5}
                                    borderRadius="7px"
                                    fontSize="10px"
                                    fontWeight="600"
                                    variant="ghost"
                                    color={tokens.textLight}
                                    onClick={clearFilters}
                                    _hover={{ color: tokens.accent, bg: tokens.accentGlow }}
                                >
                                    <AiOutlineReload /> Reset
                                </Button>
                            </HStack>
                        </Flex>

                        {hasActiveFilters && (
                            <HStack mt={2} gap={2}>
                                <Box px={2} py={1} bg={`${tokens.accent}10`} borderRadius="4px">
                                    <Text fontSize="10px" color={tokens.accent}>
                                        Auto-searching enabled
                                    </Text>
                                </Box>
                            </HStack>
                        )}
                    </Box>

                    {/* ── Table Card ── */}
                    <Box
                        bg="white"
                        borderRadius="16px"
                        boxShadow="0 2px 12px rgba(15,30,53,0.07)"
                        border="1px solid"
                        borderColor={tokens.borderLight}
                        overflow="hidden"
                    >
                        <Flex
                            px={5}
                            py={3}
                            borderBottom="1px solid"
                            borderColor={tokens.borderLight}
                            justify="space-between"
                            align="center"
                            bg={tokens.surface}
                        >
                            <HStack gap={2.5}>
                                <Text fontSize="11px" fontWeight="700" color={tokens.text}>
                                    Tag Print Records ({tagPrintList.length})
                                </Text>

                                {hasActiveFilters && (
                                    <Box px={2} py={0.5} borderRadius="5px" bg={`${tokens.accent}15`}>
                                        <Text fontSize="9px" fontWeight="700" color={tokens.accent}>
                                            Filtered
                                        </Text>
                                    </Box>
                                )}
                            </HStack>
                        </Flex>

                        {/* Table */}
                        <Box
                            overflowX="auto"
                            maxH="calc(100vh - 350px)"
                            overflowY="auto"
                            css={{
                                "&::-webkit-scrollbar": { height: "5px", width: "5px" },
                                "&::-webkit-scrollbar-track": { background: tokens.surfaceAlt },
                                "&::-webkit-scrollbar-thumb": { background: tokens.border, borderRadius: "4px" },
                            }}
                        >
                            <Table.Root variant="outline" style={{ borderCollapse: "collapse", width: "100%", minWidth: "1200px" }}>
                                <Table.Header style={{ position: "sticky", top: 0, zIndex: 2 }}>
                                    <Table.Row>
                                        {tableHeaderCols.map((col, i) => (
                                            <Table.ColumnHeader
                                                key={i}
                                                textAlign={col.align as "left" | "right" | "center"}
                                                px={3}
                                                py={2.5}
                                                fontSize="9px"
                                                fontWeight="700"
                                                letterSpacing="0.1em"
                                                textTransform="uppercase"
                                                whiteSpace="nowrap"
                                                bg={tokens.navy}
                                                color="white"
                                            >
                                                {col.label}
                                            </Table.ColumnHeader>
                                        ))}
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {isLoading ? (
                                        <Table.Row>
                                            <Table.Cell colSpan={tableHeaderCols.length} textAlign="center" py={12}>
                                                <Spinner size="md" color={tokens.accent} />
                                                <Text mt={2} fontSize="12px" color={tokens.textLight}>Loading...</Text>
                                            </Table.Cell>
                                        </Table.Row>
                                    ) : tagPrintList.length === 0 ? (
                                        <Table.Row>
                                            <Table.Cell colSpan={tableHeaderCols.length} textAlign="center" py={14}>
                                                <FaTag size={24} color={tokens.textLight} />
                                                <Text mt={2} fontSize="13px" fontWeight="700" color={tokens.textMid}>
                                                    No records found
                                                </Text>
                                                <Text fontSize="11px" color={tokens.textLight} mt={1}>
                                                    Try adjusting your filters
                                                </Text>
                                            </Table.Cell>
                                        </Table.Row>
                                    ) : (
                                        tagPrintList.map((row, idx) => {
                                            const isHovered = hoveredRow === row.rowSign;
                                            const isEven = idx % 2 === 0;

                                            return (
                                                <Table.Row
                                                    key={row.rowSign || idx}
                                                    bg={isHovered ? "#f0f6ff" : isEven ? "white" : tokens.surface}
                                                    onMouseEnter={() => setHoveredRow(row.rowSign)}
                                                    onMouseLeave={() => setHoveredRow(null)}
                                                    borderBottom="1px solid"
                                                    borderColor={tokens.borderLight}
                                                    _hover={{ bg: "#f0f6ff" }}
                                                >
                                                    <Table.Cell px={3} py={2}>
                                                        <Text fontSize="11px" fontWeight="800" color={tokens.accent}>
                                                            #{row.billNo}
                                                        </Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2}>
                                                        <Text fontSize="11px" color={tokens.textMid}>
                                                            {formatDate(row.billDate)}
                                                        </Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2}>
                                                        <Text fontSize="11px" fontWeight="500" color={tokens.textMid}>
                                                            {row.vendorName}
                                                        </Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2}>
                                                        <Box
                                                            px={1.5}
                                                            py={0.5}
                                                            borderRadius="5px"
                                                            bg={tokens.surfaceAlt}
                                                            display="inline-block"
                                                        >
                                                            <Text fontSize="10px" fontFamily="monospace" fontWeight="600">
                                                                {row.tagNo}
                                                            </Text>
                                                        </Box>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2} textAlign="right">
                                                        <Text fontSize="11px" fontWeight="600">{row.productCode}</Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2}>
                                                        <Text fontSize="11px" fontFamily="monospace">
                                                            {row.hsnCode || "—"}
                                                        </Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2} textAlign="right">
                                                        <Text fontSize="11px">{row.purRate?.toFixed(2) || "0.00"}</Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2} textAlign="right">
                                                        <Text fontSize="11px" fontWeight="700">{row.pieces || 0}</Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2} textAlign="right">
                                                        <Text fontSize="11px">{row.weight?.toFixed(3) || "0.000"}</Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2} textAlign="right">
                                                        <Text fontSize="11px" color={row.discPer > 0 ? "#ea580c" : tokens.textLight}>
                                                            {row.discPer > 0 ? `${row.discPer}%` : "—"}
                                                        </Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2} textAlign="right">
                                                        <Text fontSize="11px">{row.sellingRate?.toFixed(2) || "0.00"}</Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2} textAlign="right">
                                                        <Text fontSize="11px" fontWeight="600">{formatCurrency(row.mrp)}</Text>
                                                    </Table.Cell>

                                                    <Table.Cell px={3} py={2}>
                                                        <Text fontSize="9px" fontFamily="monospace" color={tokens.accent}>
                                                            {row.uniqueKey}
                                                        </Text>
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        })
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    </Box>

                    {/* ── Summary Stats ── */}
                    <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                        <Box bg="white" p={3} borderRadius="12px" border="1px solid" borderColor={tokens.borderLight}>
                            <Text fontSize="10px" color={tokens.textLight}>Total Records</Text>
                            <Text fontSize="16px" fontWeight="800">{totals.rowCount}</Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="12px" border="1px solid" borderColor={tokens.borderLight}>
                            <Text fontSize="10px" color={tokens.textLight}>Total Pieces</Text>
                            <Text fontSize="16px" fontWeight="800">{totals.totalPcs}</Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="12px" border="1px solid" borderColor={tokens.borderLight}>
                            <Text fontSize="10px" color={tokens.textLight}>Total Weight</Text>
                            <Text fontSize="16px" fontWeight="800">{totals.totalWt.toFixed(3)} kg</Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="12px" border="1px solid" borderColor={tokens.borderLight}>
                            <Text fontSize="10px" color={tokens.textLight}>Unique Bills</Text>
                            <Text fontSize="16px" fontWeight="800">{totals.uniqueBills}</Text>
                        </Box>
                    </Grid>

                </VStack>
            </Box>
        </>
    );
}
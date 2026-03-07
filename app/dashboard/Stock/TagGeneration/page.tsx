"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Input,
  Text,
  HStack,
  VStack,
  NativeSelect,
  For,
  Flex,
  Checkbox,
  Badge,
  Spinner,
  Dialog,
  Portal,
  Field,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSearch, AiOutlineReload, AiOutlineSave } from "react-icons/ai";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import { useDebounce } from "@/hooks/Debounce/useDebounce";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { useAllNonTaged, useSyncNonTaged } from "@/hooks/NonTagged/useNonTagged";

// ─── Types ─────────────────────────────────────────────────────────────────
interface NonTaggedRow {
  rowSign: string;
  billNo: number;
  billDate: string;
  vendorCode: number;
  barcode: string;
  productCode: number;
  subProductCode: number;
  purRate: number;
  pieces: number;
  weight: number;
  discount: number;
  sellingRate: number;
  markup: number;
  amount: number;
  mrp: number;
  billStatus: string;
  issRec: string;
}

interface FilterState {
  vendorCode: string;
  fromDate: string;
  toDate: string;
  billNo: string;
  productCode: string;
}

// ─── Vendor Options from API ───────────────────────────────────────────────
const vendorOptions = [
  { label: "ALL VENDORS", value: "ALL" },
  { label: "Vendor 1", value: "1" },
  { label: "Vendor 2", value: "2" },
];

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, accent = "#3b82f6"
}: { label: string; value: string | number; accent?: string }) => (
  <Box
    bg="white"
    borderRadius="12px"
    px={4}
    py={3}
    borderLeft={`4px solid ${accent}`}
    boxShadow="0 1px 4px rgba(0,0,0,0.08)"
    transition="box-shadow 0.2s"
    _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
  >
    <Text fontSize="9px" fontWeight="600" color="gray.400" letterSpacing="0.08em" textTransform="uppercase" mb={0.5}>
      {label}
    </Text>
    <Text fontSize="md" fontWeight="700" color="gray.800" lineHeight="1">
      {value}
    </Text>
  </Box>
);

// ─── Field Label ────────────────────────────────────────────────────────────
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Text fontSize="9px" fontWeight="600" color="gray.500" letterSpacing="0.07em" textTransform="uppercase" mb="2px">
    {children}
  </Text>
);

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function NonTaggedListPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { setData, setColumns, setShowSno, title } = usePrint();

  // Sync mutation
  const syncMutation = useSyncNonTaged();

  // Use React Query hooks
  const { data: apiData, isLoading, refetch } = useAllNonTaged();
  
  // Transform API data to match our interface
  const invoiceList = useMemo(() => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((item: any) => ({
      rowSign: item.ROWSIGN,
      billNo: item.BILLNO,
      billDate: item.BILLDATE,
      vendorCode: item.VENDORCODE,
      barcode: item.ORIONBARCODE || "",
      productCode: item.PRODUCTCODE,
      subProductCode: item.SUBPRODUCTCODE,
      purRate: item.PURRATE || 0,
      pieces: item.PIECES || 0,
      weight: item.WEIGHT || 0,
      discount: item.DISCOUNT || 0,
      sellingRate: item.SELLINGRATE || 0,
      markup: item.MARKUP || 0,
      amount: item.AMOUNT || 0,
      mrp: item.MRP || 0,
      billStatus: item.BILLSTATUS,
      issRec: item.ISSREC,
    }));
  }, [apiData]);

  const [filters, setFilters] = useState<FilterState>({ 
    vendorCode: "ALL", 
    fromDate: "", 
    toDate: "", 
    billNo: "",
    productCode: "" 
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  // Sync dialog state
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncDateRange, setSyncDateRange] = useState({ from: "", to: "" });

  // Apply client-side filtering
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoiceList];
    
    if (filters.vendorCode !== "ALL") {
      filtered = filtered.filter(inv => inv.vendorCode.toString() === filters.vendorCode);
    }
    
    if (filters.fromDate) {
      filtered = filtered.filter(inv => new Date(inv.billDate) >= new Date(filters.fromDate));
    }
    
    if (filters.toDate) {
      filtered = filtered.filter(inv => new Date(inv.billDate) <= new Date(filters.toDate));
    }
    
    if (filters.billNo) {
      filtered = filtered.filter(inv => inv.billNo.toString().includes(filters.billNo));
    }
    
    if (filters.productCode) {
      filtered = filtered.filter(inv => inv.productCode.toString().includes(filters.productCode));
    }
    
    if (debouncedSearchTerm.trim()) {
      const s = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.billNo.toString().includes(s) ||
        inv.barcode?.toLowerCase().includes(s) ||
        inv.vendorCode.toString().includes(s) ||
        inv.productCode.toString().includes(s) ||
        inv.subProductCode.toString().includes(s)
      );
    }
    
    return filtered;
  }, [invoiceList, filters, debouncedSearchTerm]);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedRows(new Set(filteredInvoices.map(inv => inv.rowSign)));
    } else {
      setSelectedRows(new Set());
    }
  }, [selectAll, filteredInvoices]);

  const handleSelectRow = useCallback((rowSign: string, checked: boolean) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      checked ? next.add(rowSign) : next.delete(rowSign);
      setSelectAll(next.size === filteredInvoices.length && filteredInvoices.length > 0);
      return next;
    });
  }, [filteredInvoices.length]);

  // Calculate totals for selected rows
  const totals = useMemo(() => {
    const sel = invoiceList.filter(inv => selectedRows.has(inv.rowSign));
    return {
      totalPcs: sel.reduce((a, b) => a + b.pieces, 0),
      totalWt: sel.reduce((a, b) => a + b.weight, 0),
      totalAmt: sel.reduce((a, b) => a + b.amount, 0),
      rowCount: sel.length,
    };
  }, [invoiceList, selectedRows]);

  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ 
      vendorCode: "ALL", 
      fromDate: "", 
      toDate: "", 
      billNo: "",
      productCode: "" 
    });
    setSearchTerm("");
  }, []);

  const handleView = useCallback(async () => {
    await refetch();
    toaster.success({ title: "Refreshed", description: "Invoice list updated." });
  }, [refetch]);

  const handleExport = useCallback((option: string) => {
    const sel = invoiceList.filter(inv => selectedRows.has(inv.rowSign));
    setData(sel.length > 0 ? sel : filteredInvoices);
    setColumns([
      { key: "billNo", label: "Bill No" },
      { key: "billDate", label: "Date" },
      { key: "vendorCode", label: "Vendor Code" },
      { key: "barcode", label: "Barcode" },
      { key: "productCode", label: "Product Code" },
      { key: "subProductCode", label: "Sub Product" },
      { key: "purRate", label: "Pur Rate" },
      { key: "pieces", label: "Pcs" },
      { key: "weight", label: "Wt" },
      { key: "discount", label: "Disc" },
      { key: "sellingRate", label: "Sell Rate" },
      { key: "markup", label: "Markup" },
      { key: "amount", label: "Amount" },
      { key: "mrp", label: "MRP" },
      { key: "billStatus", label: "Status" },
    ]);
    setShowSno(true);
    title?.("Non-Tagged Invoice List");
    router.push(`/print?export=${option}`);
  }, [invoiceList, filteredInvoices, selectedRows, setData, setColumns, setShowSno, title, router]);

  // Handle sync
  const handleSync = useCallback(async () => {
    if (!syncDateRange.from || !syncDateRange.to) {
      toaster.error({ 
        title: "Error", 
        description: "Please select both from and to dates" 
      });
      return;
    }

    try {
      await syncMutation.mutateAsync({
        from: syncDateRange.from,
        to: syncDateRange.to
      });
      
      setSyncDialogOpen(false);
      setSyncDateRange({ from: "", to: "" });
      setSelectedRows(new Set());
      setSelectAll(false);
      
      toaster.success({ 
        title: "Success", 
        description: "Invoices synced successfully" 
      });
      
      // Refresh the list
      refetch();
    } catch (error) {
      toaster.error({ 
        title: "Error", 
        description: "Failed to sync invoices" 
      });
    }
  }, [syncDateRange, syncMutation, refetch]);

  const inputStyle = {
    size: "xs" as const,
    bg: "white",
    borderColor: "gray.200",
    borderRadius: "6px",
    fontSize: "xs",
    height: "28px",
    px: 2,
    _focus: { borderColor: "blue.400", boxShadow: "0 0 0 2px rgba(59,130,246,0.15)" },
    _hover: { borderColor: "gray.300" },
  };

  const activeFilters = [
    filters.vendorCode !== "ALL",
    !!filters.fromDate,
    !!filters.toDate,
    !!filters.billNo,
    !!filters.productCode,
    !!searchTerm,
  ].filter(Boolean).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  return (
    <Box
      bg="#f0f4f8"
      minH="100vh"
      p={{ base: 2, md: 3 }}
      fontFamily="'DM Sans', 'Segoe UI', sans-serif"
    >
      <Toaster />

      {/* Sync Dialog */}
      <Dialog.Root open={syncDialogOpen} onOpenChange={e => setSyncDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Sync Invoices</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Text fontSize="sm" color="gray.600">
                    Selected {selectedRows.size} invoice(s) will be synced for the date range below.
                  </Text>
                  
                  <Field.Root required>
                    <Field.Label>From Date</Field.Label>
                    <Input
                      type="date"
                      value={syncDateRange.from}
                      onChange={e => setSyncDateRange(prev => ({ ...prev, from: e.target.value }))}
                      size="sm"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>To Date</Field.Label>
                    <Input
                      type="date"
                      value={syncDateRange.to}
                      onChange={e => setSyncDateRange(prev => ({ ...prev, to: e.target.value }))}
                      size="sm"
                    />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSyncDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  colorPalette="blue" 
                  size="sm" 
                  onClick={handleSync}
                  loading={syncMutation.isPending}
                >
                  Sync Now
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <VStack gap={3} align="stretch" maxW="1400px" mx="auto">

        {/* ── Filter Card ── */}
        <Box
          bg="white"
          borderRadius="12px"
          p={4}
          boxShadow="0 1px 4px rgba(0,0,0,0.07)"
          border="1px solid #e8edf2"
        >
          <HStack mb={3} justify="space-between">
            <HStack gap={1.5}>
              <Box color="blue.500" fontSize="14px"><MdFilterList /></Box>
              <Text fontSize="11px" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.06em">
                Filters
              </Text>
              {activeFilters > 0 && (
                <Badge colorPalette="blue" variant="subtle" borderRadius="full" fontSize="9px" px={1.5} py={0.5}>
                  {activeFilters}
                </Badge>
              )}
            </HStack>
           
            <HStack>
              {/* Save/Sync Button - Shows only when rows are selected */}
              {selectedRows.size > 0 && (
                <Button
                  size="xs"
                  colorPalette="green"
                  borderRadius="6px"
                  fontSize="11px"
                  fontWeight="600"
                  h="28px"
                  px={3}
                  onClick={() => setSyncDialogOpen(true)}
                  _hover={{ bg: "green.600" }}
                >
                  <AiOutlineSave style={{ marginRight: 4 }} /> Sync ({selectedRows.size})
                </Button>
              )}
              <Button
                size="xs"
                variant="outline"
                colorPalette="gray"
                borderRadius="6px"
                fontSize="11px"
                fontWeight="600"
                h="28px"
                px={3}
                onClick={() => handleExport("excel")}
                borderColor="gray.200"
                _hover={{ bg: "green.50", borderColor: "green.400", color: "green.600" }}
              >
                <FaFileExcel style={{ marginRight: 4 }} /> Excel
              </Button>
              <Button
                size="xs"
                variant="outline"
                colorPalette="gray"
                borderRadius="6px"
                fontSize="11px"
                fontWeight="600"
                h="28px"
                px={3}
                onClick={() => handleExport("pdf")}
                borderColor="gray.200"
                _hover={{ bg: "blue.50", borderColor: "blue.400", color: "blue.600" }}
              >
                <FaPrint style={{ marginRight: 4 }} /> Print
              </Button>
              <Button
                size="2xs"
                variant="ghost"
                colorPalette="gray"
                fontSize="10px"
                color="gray.500"
                onClick={clearFilters}
                h="24px"
                px={2}
                _hover={{ color: "blue.600", bg: "blue.50" }}
              >
                <AiOutlineReload style={{ marginRight: 2 }} /> Reset
              </Button>
            </HStack>
          </HStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(6, 1fr) auto" }} gap={2} alignItems="end">
            {/* Vendor Code */}
            <GridItem>
              <FieldLabel>Vendor</FieldLabel>
              <Box position="relative">
                <NativeSelect.Root size="xs">
                  <NativeSelect.Field
                    value={filters.vendorCode}
                    onChange={e => handleFilterChange("vendorCode", e.target.value)}
                    bg="white"
                    borderColor="gray.200"
                    borderRadius="6px"
                    fontSize="xs"
                    height="28px"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 2px rgba(59,130,246,0.15)" }}
                  >
                    <For each={vendorOptions}>
                      {item => <option key={item.value} value={item.value}>{item.label}</option>}
                    </For>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Box>
            </GridItem>

            {/* From Date */}
            <GridItem>
              <FieldLabel>From</FieldLabel>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={e => handleFilterChange("fromDate", e.target.value)}
                {...inputStyle}
              />
            </GridItem>

            {/* To Date */}
            <GridItem>
              <FieldLabel>To</FieldLabel>
              <Input
                type="date"
                value={filters.toDate}
                onChange={e => handleFilterChange("toDate", e.target.value)}
                {...inputStyle}
              />
            </GridItem>

            {/* Bill No */}
            <GridItem>
              <FieldLabel>Bill No</FieldLabel>
              <Input
                placeholder="e.g. 2"
                value={filters.billNo}
                onChange={e => handleFilterChange("billNo", e.target.value)}
                {...inputStyle}
              />
            </GridItem>

            {/* Product Code */}
            <GridItem>
              <FieldLabel>Product Code</FieldLabel>
              <Input
                placeholder="e.g. 3"
                value={filters.productCode}
                onChange={e => handleFilterChange("productCode", e.target.value)}
                {...inputStyle}
              />
            </GridItem>

            {/* Search */}
            <GridItem>
              <FieldLabel>Search</FieldLabel>
              <Input
                placeholder="Bill No, Barcode..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                {...inputStyle}
                _placeholder={{ color: "gray.400", fontSize: "xs" }}
              />
            </GridItem>

            {/* View Button */}
            <GridItem>
              <Button
                size="xs"
                bg="blue.600"
                color="white"
                borderRadius="6px"
                fontSize="xs"
                fontWeight="600"
                h="28px"
                px={4}
                onClick={handleView}
                loading={isLoading}
                _hover={{ bg: "blue.700" }}
                _active={{ bg: "blue.800" }}
                w="100%"
              >
                {isLoading ? <Spinner size="xs" /> : <><AiOutlineSearch style={{ marginRight: 4 }} /> View</>}
              </Button>
            </GridItem>
          </Grid>
        </Box>

        {/* ── Table Card ── */}
        <Box
          bg="white"
          borderRadius="12px"
          boxShadow="0 1px 4px rgba(0,0,0,0.07)"
          border="1px solid #e8edf2"
          overflow="hidden"
        >
          {/* Table Header Bar */}
          <Flex
            px={4}
            py={2}
            borderBottom="1px solid #e8edf2"
            justify="space-between"
            align="center"
            bg="gray.50"
          >
            <HStack gap={2}>
              <Checkbox.Root
                checked={selectAll}
                onCheckedChange={e => setSelectAll(!!e.checked)}
                size="xs"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control
                  borderRadius="4px"
                  borderColor="gray.300"
                  bg="white"
                  _checked={{ bg: "blue.600", borderColor: "blue.600" }}
                />
                <Checkbox.Label>
                  <Text fontSize="11px" fontWeight="600" color="gray.600">All</Text>
                </Checkbox.Label>
              </Checkbox.Root>
              {selectedRows.size > 0 && (
                <Badge colorPalette="blue" variant="subtle" borderRadius="full" fontSize="9px" px={1.5}>
                  {selectedRows.size} selected
                </Badge>
              )}
            </HStack>

            <HStack gap={2}>
              <Text fontSize="11px" color="gray.400">
                <Text as="span" fontWeight="700" color="gray.700">{filteredInvoices.length}</Text> records
                {searchTerm && (
                  <Text as="span" color="blue.500" ml={1}>for "{searchTerm}"</Text>
                )}
              </Text>
            </HStack>
          </Flex>

          {/* Table */}
          <Box overflowX="auto">
            <Table.Root variant="outline" style={{ borderCollapse: "collapse", width: "100%" }}>
              <Table.Header>
                <Table.Row bg="#1e3a5f">
                  <Table.ColumnHeader w="36px" px={2} py={2} borderRight="1px solid rgba(255,255,255,0.1)">
                    {/* checkbox col */}
                  </Table.ColumnHeader>
                  {[
                    { label: "Bill No", align: "left" },
                    { label: "Date", align: "left" },
                    { label: "Vendor Code", align: "left" },
                    { label: "Barcode", align: "left" },
                    { label: "Product", align: "left" },
                    { label: "Sub Product", align: "left" },
                    { label: "Pur Rate", align: "right" },
                    { label: "Pcs", align: "right" },
                    { label: "Weight", align: "right" },
                    { label: "Disc", align: "right" },
                    { label: "Sell Rate", align: "right" },
                    { label: "Markup", align: "right" },
                    { label: "Amount", align: "right" },
                    { label: "MRP", align: "right" },
                    { label: "Status", align: "center" },
                  ].map((col, i) => (
                    <Table.ColumnHeader
                      key={i}
                      textAlign={col.align as "left" | "right" | "center"}
                      px={2}
                      py={2}
                      fontSize="9px"
                      fontWeight="700"
                      color="rgba(255,255,255,0.85)"
                      letterSpacing="0.07em"
                      textTransform="uppercase"
                      whiteSpace="nowrap"
                      borderRight="1px solid rgba(255,255,255,0.08)"
                    >
                      {col.label}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {isLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={16} textAlign="center" py={8}>
                      <VStack gap={1.5}>
                        <Spinner size="sm" color="blue.500" />
                        <Text fontSize="xs" color="gray.400">Loading invoices…</Text>
                      </VStack>
                    </Table.Cell>
                  </Table.Row>
                ) : filteredInvoices.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={16} textAlign="center" py={8}>
                      <VStack gap={0.5}>
                        <Text fontSize="sm" fontWeight="600" color="gray.400">No invoices found</Text>
                        <Text fontSize="xs" color="gray.300">Try adjusting your filters</Text>
                      </VStack>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredInvoices.map((row, idx) => {
                    const isSelected = selectedRows.has(row.rowSign);
                    const isHovered = hoveredRow === row.rowSign;
                    return (
                      <Table.Row
                        key={row.rowSign}
                        bg={isSelected ? "blue.50" : isHovered ? "gray.50" : idx % 2 === 0 ? "white" : "#fafbfc"}
                        onMouseEnter={() => setHoveredRow(row.rowSign)}
                        onMouseLeave={() => setHoveredRow(null)}
                        transition="background 0.12s"
                        borderBottom="1px solid #f0f2f5"
                        style={isSelected ? { outline: "1px solid #3b82f6", outlineOffset: "-1px" } : {}}
                      >
                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5">
                          <Checkbox.Root
                            checked={isSelected}
                            onCheckedChange={e => handleSelectRow(row.rowSign, !!e.checked)}
                            size="xs"
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control
                              borderRadius="4px"
                              borderColor="gray.300"
                              _checked={{ bg: "blue.600", borderColor: "blue.600" }}
                            />
                          </Checkbox.Root>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5">
                          <Text fontSize="11px" fontWeight="700" color="blue.600">
                            #{row.billNo}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" whiteSpace="nowrap">
                          <Text fontSize="11px" color="gray.600">{formatDate(row.billDate)}</Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5">
                          <Text fontSize="11px" fontWeight="600" color="gray.700">
                            {row.vendorCode}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5">
                          {row.barcode ? (
                            <Badge
                              colorPalette="gray"
                              variant="subtle"
                              fontSize="9px"
                              px={1.5}
                              borderRadius="4px"
                              fontFamily="monospace"
                            >
                              {row.barcode}
                            </Badge>
                          ) : (
                            <Text fontSize="11px" color="gray.300">—</Text>
                          )}
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5">
                          <Text fontSize="11px" fontWeight="500" color="gray.800">
                            {row.productCode}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5">
                          <Text fontSize="11px" color="gray.600">
                            {row.subProductCode}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="500" color="gray.700">
                            {row.purRate.toFixed(2)}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="500" color="gray.700">
                            {row.pieces}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="500" color="gray.700">
                            {row.weight.toFixed(3)}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="500" color={row.discount > 0 ? "orange.500" : "gray.300"}>
                            {row.discount > 0 ? row.discount.toFixed(2) : "—"}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="500" color="gray.700">
                            {row.sellingRate.toFixed(2)}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="500" color={row.markup > 0 ? "green.600" : "gray.300"}>
                            {row.markup > 0 ? `+${row.markup.toFixed(2)}` : "—"}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="700" color={isSelected ? "blue.600" : "gray.800"}>
                            ₹{row.amount.toFixed(2)}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                          <Text fontSize="11px" fontWeight="500" color="gray.700">
                            ₹{row.mrp.toFixed(2)}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={2} py={1.5} textAlign="center">
                          <Badge
                            colorPalette={row.billStatus === "ACTIVE" ? "green" : "gray"}
                            variant="subtle"
                            fontSize="8px"
                            px={1.5}
                            borderRadius="4px"
                          >
                            {row.billStatus}
                          </Badge>
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
        <Grid templateColumns="repeat(4, 1fr)" gap={2}>
          <StatCard
            label="Selected"
            value={totals.rowCount}
            accent="#6366f1"
          />
          <StatCard
            label="Total Pieces"
            value={totals.totalPcs.toLocaleString()}
            accent="#3b82f6"
          />
          <StatCard
            label="Total Weight"
            value={`${totals.totalWt.toFixed(3)} kg`}
            accent="#10b981"
          />
          <StatCard
            label="Total Amount"
            value={`₹ ${totals.totalAmt.toFixed(2)}`}
            accent="#f59e0b"
          />
        </Grid>

      </VStack>
    </Box>
  );
}
"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Input,
  Text,
  HStack,
  VStack,
  Badge,
  Spinner,
  Flex
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSearch, AiOutlineReload, AiOutlineSave } from "react-icons/ai";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { useTheme } from "@/context/theme/themeContext";
import { useDebounce } from "@/hooks/Debounce/useDebounce";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { useAllTaged, useFilterTaged, useSyncTaged } from "@/hooks/Tagged/useTagged";
import { TagedUIFilter } from "@/types/Tagged/Tagged";
import { toaster, Toaster } from "@/components/ui/toaster";

// ─── Interface for API Response ────────────────────────────────────────────
interface ApiTagedItem {
  AMOUNT: number | null;
  BILLDATE: string;
  BILLNO: number;
  BILLSTATUS: string | null;
  BILLTYPE: string;
  CGSTAMOUNT: number | null;
  CGSTPER: number | null;
  CGSTTAXCODE: number | null;
  CREATEDBY: number;
  CREATEDDATE: string;
  CREATEDTIME: string;
  DISCOUNT: number | null;
  DISCPER: number | null;
  ENTRYORDER: number;
  HSNCALC: string | null;
  HSNCODE: string;
  HSNTAXCODE: number;
  IGSTAMOUNT: number | null;
  IGSTPER: number | null;
  IGSTTAXCODE: number | null;
  INVOICENO: string;
  IPID: number;
  MARKUP: number | null;
  MARKUPPER: number | null;
  MRP: number;
  ORIONBARCODE: string;
  PIECES: number;
  PRODUCTCODE: number;
  PRODUCTNAME: string | null;
  PURRATE: number;
  ROWSIGN: string;
  SELLINGRATE: number;
  SGSTAMOUNT: number | null;
  SGSTPER: number | null;
  SGSTTAXCODE: number | null;
  SRVAMOUNT: number | null;
  SRVPER: number | null;
  SRVTAXCODE: number | null;
  SUBPRODUCTCODE: number;
  SUBPRODUCTNAME: string | null;
  TAGGEN: string;
  TAXAMOUNT: number;
  TAXCALC: string;
  TAXPER: number;
  TOTALAMOUNT: number;
  UNIQUEKEY: string;
  UNITCODE: number;
  VENDORCODE: number;
  WEIGHT: number;
}

// ─── Transformed Row Interface ─────────────────────────────────────────────
interface TaggedRow {
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
  discount: number | null;
  sellingRate: number;
  markup: number | null;
  amount: number | null;
  mrp: number;
  billStatus: string | null;
  invoiceNo: string;
  totalAmount: number;
  taxAmount: number;
}

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
export default function TaggedListPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { setData, setColumns, setShowSno, title } = usePrint();

  // Filter state
  const [filters, setFilters] = useState<TagedUIFilter>({
    fromDate: "",
    toDate: "",
    billNo: "",
    vendorCode: "ALL",
    productCode: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // React Query hooks
  const { data: allTagedData, isLoading: isLoadingAll, refetch: refetchAll } = useAllTaged();
  const syncMutation = useSyncTaged();

  // Filter query - only enabled when filters are applied
  const hasActiveFilters = useMemo(() => {
    return filters.fromDate !== "" ||
      filters.toDate !== "" ||
      filters.billNo !== "" ||
      (filters.vendorCode !== "ALL" && filters.vendorCode !== "") ||
      filters.productCode !== "";
  }, [filters]);

  const {
    data: filteredData,
    isLoading: isLoadingFiltered,
    refetch: refetchFiltered
  } = useFilterTaged(hasActiveFilters ? {
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    billNo: filters.billNo ? parseInt(filters.billNo) : undefined,
    vendorCode: filters.vendorCode !== "ALL" ? parseInt(filters.vendorCode) : undefined,
    productCode: filters.productCode ? parseInt(filters.productCode) : undefined,
  } : null);

  // Transform API data to match our interface
const transformApiData = useCallback((apiResponse: { message: string; data: ApiTagedItem[] } | ApiTagedItem[]): TaggedRow[] => {
  if (!apiResponse) return [];

  // Handle response with { data: [...] } format
  const items: ApiTagedItem[] = Array.isArray(apiResponse)
    ? apiResponse
    : Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [];

  return items.map((item) => ({
    rowSign: item.ROWSIGN || "",
    billNo: item.BILLNO || 0,
    billDate: item.BILLDATE || "",
    vendorCode: item.VENDORCODE || 0,
    barcode: item.ORIONBARCODE || "—",
    productCode: item.PRODUCTCODE || 0,
    subProductCode: item.SUBPRODUCTCODE || 0,
    purRate: item.PURRATE || 0,
    pieces: item.PIECES || 0,
    weight: item.WEIGHT || 0,
    discount: item.DISCOUNT,
    sellingRate: item.SELLINGRATE || 0,
    markup: item.MARKUP,
    amount: item.AMOUNT,
    mrp: item.MRP || 0,
    billStatus: item.BILLSTATUS,
    invoiceNo: item.INVOICENO || "—",
    totalAmount: item.TOTALAMOUNT || 0,
    taxAmount: item.TAXAMOUNT || 0,
  }));
}, []);

  // Determine which data to display
const invoiceList = useMemo(() => {
  const sourceData = hasActiveFilters ? filteredData : allTagedData;
  return transformApiData(sourceData);
}, [allTagedData, filteredData, hasActiveFilters, transformApiData]);

  const isLoading = isLoadingAll || (hasActiveFilters && isLoadingFiltered);

  // Get unique vendor codes for filter dropdown
  const vendorOptions = useMemo(() => {
    const vendors = new Set<number>();

    // Get data from either source
    const sourceData = allTagedData;

    if (sourceData) {
      // Handle both array and { data: array } formats
      const source = sourceData as any;
      const items = Array.isArray(source)
        ? source
        : Array.isArray(source?.data)
          ? source.data
          : [];

      items.forEach((item: ApiTagedItem) => {
        if (item.VENDORCODE) vendors.add(item.VENDORCODE);
      });
    }

    return [
      { label: "ALL VENDORS", value: "ALL" },
      ...Array.from(vendors).sort((a, b) => a - b).map(code => ({
        label: `Vendor ${code}`,
        value: code.toString()
      }))
    ];
  }, [allTagedData]);

  // Apply client-side search filtering
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoiceList];

    if (debouncedSearchTerm.trim()) {
      const s = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(inv =>
        inv.billNo.toString().includes(s) ||
        inv.barcode?.toLowerCase().includes(s) ||
        inv.vendorCode.toString().includes(s) ||
        inv.productCode.toString().includes(s) ||
        inv.subProductCode.toString().includes(s) ||
        inv.invoiceNo.toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [invoiceList, debouncedSearchTerm]);

  const handleFilterChange = useCallback((field: keyof TagedUIFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      fromDate: "",
      toDate: "",
      billNo: "",
      vendorCode: "ALL",
      productCode: ""
    });
    setSearchTerm("");
  }, []);

  const handleView = useCallback(async () => {
    try {
      if (hasActiveFilters) {
        await refetchFiltered();
      } else {
        await refetchAll();
      }
      toaster.success({
        title: "Refreshed",
        description: "Tagged list updated.",
        duration: 3000,
      });
    } catch (error) {
      toaster.error({
        title: "Error",
        description: "Failed to refresh data",
        duration: 3000,
      });
    }
  }, [hasActiveFilters, refetchFiltered, refetchAll]);

  const handleExport = useCallback((option: string) => {
    setData(filteredInvoices);
    setColumns([
      { key: "billNo", label: "Bill No" },
      { key: "billDate", label: "Date" },
      { key: "vendorCode", label: "Vendor Code" },
      { key: "invoiceNo", label: "Invoice No" },
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
      { key: "taxAmount", label: "Tax" },
      { key: "totalAmount", label: "Total" },
      { key: "mrp", label: "MRP" },
      { key: "billStatus", label: "Status" },
    ]);
    setShowSno(true);
    title?.("Tagged Invoice List");
    router.push(`/print?export=${option}`);
  }, [filteredInvoices, setData, setColumns, setShowSno, title, router]);

  // Handle sync with loading toast
  const handleSync = useCallback(async () => {
    // Prepare sync filters - if no filters are selected, it will sync all (params will be empty)
    const syncFilters = {
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      billNo: filters.billNo ? parseInt(filters.billNo) : undefined,
      vendorCode: filters.vendorCode !== "ALL" ? parseInt(filters.vendorCode) : undefined,
      productCode: filters.productCode ? parseInt(filters.productCode) : undefined,
    };

    // Show loading toast
    const loadingToastId = toaster.create({
      title: "Syncing...",
      description: "Please wait while invoices are being synced",
      type: "loading",
      duration: 30000, // 30 seconds max
    });

    try {
      // Call sync API with filters (all params are optional in the API)
      await syncMutation.mutateAsync(syncFilters);

      // Dismiss loading toast
      toaster.dismiss(loadingToastId);

      // Show success toast
      toaster.success({
        title: "Success",
        description: "Invoices synced successfully",
        duration: 3000,
      });

      // Refresh the list based on current filter state
      if (hasActiveFilters) {
        await refetchFiltered();
      } else {
        await refetchAll();
      }

    } catch (error: any) {
      // Dismiss loading toast
      toaster.dismiss(loadingToastId);

      // Show error toast with detailed message
      toaster.error({
        title: "Sync Failed",
        description: error?.response?.data?.message || "Failed to sync invoices. Please try again.",
        duration: 5000,
      });

      console.error("Sync error:", error);
    }
  }, [syncMutation, filters, hasActiveFilters, refetchFiltered, refetchAll]);

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
    hasActiveFilters,
    !!searchTerm,
  ].filter(Boolean).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '-');
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return `₹${value.toFixed(2)}`;
  };

  // Calculate totals for all filtered invoices
  const totals = useMemo(() => {
    return {
      totalPcs: filteredInvoices.reduce((a, b) => a + (b.pieces || 0), 0),
      totalWt: filteredInvoices.reduce((a, b) => a + (b.weight || 0), 0),
      totalAmt: filteredInvoices.reduce((a, b) => a + (b.amount || 0), 0),
      totalTax: filteredInvoices.reduce((a, b) => a + (b.taxAmount || 0), 0),
      totalMrp: filteredInvoices.reduce((a, b) => a + ((b.mrp || 0) * (b.pieces || 0)), 0),
      rowCount: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  return (
    <>
      <Toaster /> {/* Add Toaster component here */}
      
      <Box
        bg="#f0f4f8"
        minH="100vh"
        p={{ base: 2, md: 3 }}
        fontFamily="'DM Sans', 'Segoe UI', sans-serif"
      >
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
                <Button
                  size="xs"
                  colorPalette="green"
                  borderRadius="6px"
                  fontSize="11px"
                  fontWeight="600"
                  h="28px"
                  px={3}
                  onClick={handleSync}
                  loading={syncMutation.isPending}
                  loadingText="Syncing..."
                  _hover={{ bg: "green.600" }}
                >
                  <AiOutlineSave style={{ marginRight: 4 }} /> Sync
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
                  <select
                    value={filters.vendorCode}
                    onChange={(e) => handleFilterChange("vendorCode", e.target.value)}
                    style={{
                      width: "100%",
                      height: "28px",
                      fontSize: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      background: "white",
                      padding: "0 8px",
                    }}
                  >
                    {vendorOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
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
                  placeholder="e.g. 16"
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
                  placeholder="Bill No, Barcode, Invoice No..."
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
                  loadingText="Loading..."
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
                <Text fontSize="11px" fontWeight="600" color="gray.600">Tagged Invoices</Text>
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
            <Box overflowX="auto" maxH="calc(100vh - 350px)" overflowY="auto">
              <Table.Root variant="outline" style={{ borderCollapse: "collapse", width: "100%" }}>
                <Table.Header style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <Table.Row bg="#1e3a5f">
                    {[
                      { label: "Bill No", align: "left" },
                      { label: "Date", align: "left" },
                      { label: "Vendor", align: "left" },
                      { label: "Invoice No", align: "left" },
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
                      { label: "Tax", align: "right" },
                      { label: "Total", align: "right" },
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
                      <Table.Cell colSpan={18} textAlign="center" py={8}>
                        <VStack gap={1.5}>
                          <Spinner size="sm" color="blue.500" />
                          <Text fontSize="xs" color="gray.400">Loading invoices…</Text>
                        </VStack>
                      </Table.Cell>
                    </Table.Row>
                  ) : filteredInvoices.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={18} textAlign="center" py={8}>
                        <VStack gap={0.5}>
                          <Text fontSize="sm" fontWeight="600" color="gray.400">No invoices found</Text>
                          <Text fontSize="xs" color="gray.300">Try adjusting your filters</Text>
                        </VStack>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredInvoices.map((row, idx) => {
                      const isHovered = hoveredRow === row.rowSign;
                      return (
                        <Table.Row
                          key={row.rowSign || idx}
                          bg={isHovered ? "gray.50" : idx % 2 === 0 ? "white" : "#fafbfc"}
                          onMouseEnter={() => setHoveredRow(row.rowSign)}
                          onMouseLeave={() => setHoveredRow(null)}
                          transition="background 0.12s"
                          borderBottom="1px solid #f0f2f5"
                        >
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
                            <Text fontSize="11px" color="gray.600">
                              {row.invoiceNo || "—"}
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
                              {row.purRate ? row.purRate.toFixed(2) : "0.00"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color="gray.700">
                              {row.pieces || 0}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color="gray.700">
                              {row.weight ? row.weight.toFixed(3) : "0.000"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color={row.discount && row.discount > 0 ? "orange.500" : "gray.300"}>
                              {row.discount && row.discount > 0 ? row.discount.toFixed(2) : "—"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color="gray.700">
                              {row.sellingRate ? row.sellingRate.toFixed(2) : "0.00"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color={row.markup && row.markup > 0 ? "green.600" : "gray.300"}>
                              {row.markup && row.markup > 0 ? `+${row.markup.toFixed(2)}` : "—"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="700" color="gray.800">
                              {formatCurrency(row.amount)}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color="gray.600">
                              {formatCurrency(row.taxAmount)}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="600" color="green.600">
                              {formatCurrency(row.totalAmount)}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={2} py={1.5} borderRight="1px solid #f0f2f5" textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color="gray.700">
                              {formatCurrency(row.mrp)}
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
                              {row.billStatus || "—"}
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
          <Grid templateColumns="repeat(5, 1fr)" gap={2}>
            <StatCard
              label="Total Records"
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
              value={formatCurrency(totals.totalAmt)}
              accent="#f59e0b"
            />
            <StatCard
              label="Total Tax"
              value={formatCurrency(totals.totalTax)}
              accent="#ec4899"
            />
          </Grid>
        </VStack>
      </Box>
    </>
  );
}
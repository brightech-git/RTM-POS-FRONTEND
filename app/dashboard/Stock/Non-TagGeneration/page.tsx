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
  Badge,
  Spinner,
  Flex,
  Checkbox,
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
  DialogDescription,
} from "@chakra-ui/react/dialog";
import { AiOutlineSearch, AiOutlineReload, AiOutlineSave, AiOutlinePrinter } from "react-icons/ai";
import { FaCheckCircle, FaLayerGroup, FaPrint, FaFileExcel } from "react-icons/fa";
import { MdFilterList, MdTune } from "react-icons/md";
import { useTheme } from "@/context/theme/themeContext";
import { useDebounce } from "@/hooks/Debounce/useDebounce";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { useAllNonTaged, useSyncNonTaged } from "@/hooks/NonTagged/useNonTagged";
import { toaster, Toaster } from "@/components/ui/toaster";

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface ApiNonTagedItem {
  AMOUNT: number | null;
  BILLDATE: string;
  BILLNO: number;
  BILLSTATUS: string | null;
  DISCOUNT: number | null;
  ISSREC: string;
  MARKUP: number | null;
  MRP: number;
  ORIONBARCODE: string;
  PIECES: number;
  PRODUCTCODE: number;
  PRODUCTNAME: string | null;
  PURRATE: number;
  ROWSIGN: string;
  SELLINGRATE: number;
  SUBPRODUCTCODE: number;
   SUBPRODUCTNAME: string | null;
  VENDORCODE: number;
  VENDORNAME: string | null;
  WEIGHT: number;
}

interface NonTaggedRow {
  rowSign: string;
  billNo: number;
  billDate: string;
  vendorCode: number;
  vendorName: string | null;
  barcode: string;
  productCode: number;
  productName: string | null;
  subProductCode: number;
  subProductName: string | null;
  purRate: number;
  pieces: number;
  weight: number;
  discount: number | null;
  sellingRate: number;
  markup: number | null;
  amount: number | null;
  mrp: number;
  billStatus: string | null;
  issRec: string;
}

interface FilterState {
  fromDate: string;
  toDate: string;
  billNo: string;
  vendorCode: string;
  productCode: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────
const tokens = {
  navy: "#0f1e35",
  navyMid: "#1a3254",
  navyLight: "#243b55",
  accent: "#3d8ef8",
  accentHover: "#2d7de8",
  accentGlow: "rgba(61,142,248,0.18)",
  green: "#10b97a",
  amber: "#f5a623",
  pink: "#e85d9a",
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

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  accent = tokens.accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent?: string;
  icon?: React.ReactNode;
}) => (
  <Box
    bg="white"
    borderRadius="14px"
    px={4}
    py={3}
    position="relative"
    overflow="hidden"
    boxShadow="0 2px 12px rgba(15,30,53,0.07), 0 1px 3px rgba(15,30,53,0.05)"
    border="1px solid"
    borderColor={tokens.borderLight}
    transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
    _hover={{
      boxShadow: `0 8px 28px rgba(15,30,53,0.12), 0 2px 8px ${accent}22`,
      transform: "translateY(-2px)",
      borderColor: accent,
    }}
    _before={{
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "3px",
      background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
      borderRadius: "14px 14px 0 0",
    }}
  >
    <HStack justify="space-between" align="flex-start">
      <Box>
        <Text
          fontSize="9px"
          fontWeight="700"
          color={tokens.textLight}
          letterSpacing="0.12em"
          textTransform="uppercase"
          mb={1}
        >
          {label}
        </Text>
        <Text fontSize="15px" fontWeight="800" color={tokens.text} lineHeight="1" letterSpacing="-0.02em">
          {value}
        </Text>
      </Box>
      {icon && (
        <Box
          w="32px"
          h="32px"
          borderRadius="10px"
          bg={`${accent}18`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={accent}
          fontSize="14px"
          flexShrink={0}
        >
          {icon}
        </Box>
      )}
    </HStack>
  </Box>
);

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

// ─── Section Header ─────────────────────────────────────────────────────────
const SectionHeader = ({
  title,
  icon,
  right,
  badge,
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  badge?: number;
}) => (
  <HStack mb={3} justify="space-between">
    <HStack gap={2}>
      {icon && (
        <Box
          w="26px"
          h="26px"
          borderRadius="8px"
          bg={tokens.accentGlow}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={tokens.accent}
          fontSize="13px"
        >
          {icon}
        </Box>
      )}
      <Text fontSize="11px" fontWeight="800" color={tokens.text} textTransform="uppercase" letterSpacing="0.07em">
        {title}
      </Text>
      {badge !== undefined && badge > 0 && (
        <Box
          bg={tokens.accent}
          color="white"
          borderRadius="full"
          fontSize="9px"
          fontWeight="700"
          px={1.5}
          py={0.5}
          lineHeight="1"
        >
          {badge}
        </Box>
      )}
    </HStack>
    {right && right}
  </HStack>
);

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function NonTaggedListPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { setData, setColumns, setShowSno, title } = usePrint();

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [filters, setFilters] = useState<FilterState>({
    fromDate: getTodayDateString(),
    toDate: getTodayDateString(),
    billNo: "",
    vendorCode: "ALL",
    productCode: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());

  const { data: allData, isLoading, refetch } = useAllNonTaged();
  console.log("API Response:", allData);
  const syncMutation = useSyncNonTaged();

 useEffect(() => {
  const map = new Map<string, number>();
  
  // Check if allData exists and has the expected structure
  if (allData && typeof allData === 'object' && 'data' in allData && Array.isArray(allData.data)) {
    const items = allData.data as ApiNonTagedItem[];
    
    items.forEach((item: ApiNonTagedItem) => {
      if (item.VENDORNAME && item.VENDORCODE) {
        map.set(item.VENDORNAME, item.VENDORCODE);
      }
    });
  } else if (Array.isArray(allData)) {
    // Fallback for array format
    allData.forEach((item: ApiNonTagedItem) => {
      if (item.VENDORNAME && item.VENDORCODE) {
        map.set(item.VENDORNAME, item.VENDORCODE);
      }
    });
  }

  console.log("Vendor map:", map); // Debug log
  setVendorMap(map);
}, [allData]);

const transformApiData = useCallback(
  (apiResponse: { message: string; data: ApiNonTagedItem[] } | ApiNonTagedItem[] | undefined): NonTaggedRow[] => {
    if (!apiResponse) return [];

    let items: ApiNonTagedItem[] = [];

    // Handle the nested data structure from your API
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse && Array.isArray(apiResponse.data)) {
      // This is the format: { message: "Success", data: [...] }
      items = apiResponse.data;
    } else if (Array.isArray(apiResponse)) {
      // This is the fallback format if API returns array directly
      items = apiResponse;
    }

    console.log("Transformed items:", items); // Add this for debugging

    return items.map((item) => ({
      rowSign: item.ROWSIGN || "",
      billNo: item.BILLNO || 0,
      billDate: item.BILLDATE || "",
      vendorCode: item.VENDORCODE || 0,
      vendorName: item.VENDORNAME || "",
      barcode: item.ORIONBARCODE || "—",
      productCode: item.PRODUCTCODE || 0,
      productName: item.PRODUCTNAME || null, // This was null before, now using actual value
      subProductCode: item.SUBPRODUCTCODE || 0,
      subProductName: item.SUBPRODUCTNAME || null, // This was null before, now using actual value
      purRate: item.PURRATE || 0,
      pieces: item.PIECES || 0,
      weight: item.WEIGHT || 0,
      discount: item.DISCOUNT,
      sellingRate: item.SELLINGRATE || 0,
      markup: item.MARKUP,
      amount: item.AMOUNT,
      mrp: item.MRP || 0,
      billStatus: item.BILLSTATUS,
      issRec: item.ISSREC || "",
    }));
  },
  []
);

  const invoiceList = useMemo(() => {
    return transformApiData(allData);
  }, [allData, transformApiData]);

  const vendorOptions = useMemo(() => {
    return [
      { label: "All Vendors", value: "ALL" },
      ...Array.from(vendorMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, code]) => ({
          label: name,
          value: code.toString()
        })),
    ];
  }, [vendorMap]);

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
      const s = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (inv) =>
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

  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      fromDate: getTodayDateString(),
      toDate: getTodayDateString(),
      billNo: "",
      vendorCode: "ALL",
      productCode: ""
    });
    setSearchTerm("");
    setSelectedRows(new Set());
    setSelectAll(false);
  }, []);

  const handleView = useCallback(async () => {
    try {
      await refetch();
      toaster.success({ title: "Refreshed", description: "Non-tagged list updated.", duration: 3000 });
    } catch {
      toaster.error({ title: "Error", description: "Failed to refresh data", duration: 3000 });
    }
  }, [refetch]);

 const handleSync = useCallback(async () => {
  const selectedItems = invoiceList.filter(inv => selectedRows.has(inv.rowSign));
  
  if (selectedItems.length === 0) {
    toaster.warning({
      title: "No items selected",
      description: "Please select at least one item to sync",
      duration: 3000
    });
    return;
  }

  const loadingToastId = toaster.create({
    title: "Syncing…",
    description: `Syncing ${selectedItems.length} items`,
    type: "loading",
    duration: 30000,
  });

  try {
    // Get unique bill numbers from selected items
    const uniqueBillNos = [...new Set(selectedItems.map(item => item.billNo))];
    
    // Prepare sync parameters with filters
    const syncParams: {
      from?: string;
      to?: string;
      billNos?: number[];
      vendorCode?: number;
      productCode?: number;
    } = {
      billNos: uniqueBillNos
    };

    // Add date filters if they're set (not the default today's date)
    if (filters.fromDate && filters.fromDate !== getTodayDateString()) {
      syncParams.from = filters.fromDate;
    }
    if (filters.toDate && filters.toDate !== getTodayDateString()) {
      syncParams.to = filters.toDate;
    }

    // Add vendor filter if not "ALL"
    if (filters.vendorCode && filters.vendorCode !== "ALL") {
      syncParams.vendorCode = parseInt(filters.vendorCode);
    }

    // Add product code filter if set
    if (filters.productCode) {
      syncParams.productCode = parseInt(filters.productCode);
    }

    await syncMutation.mutateAsync(syncParams);
    
    toaster.dismiss(loadingToastId);
    toaster.success({
      title: "Success",
      description: `${selectedItems.length} items from ${uniqueBillNos.length} bill(s) synced successfully`,
      duration: 3000
    });

    // Clear selections and refetch
    setSelectedRows(new Set());
    setSelectAll(false);
    await refetch();

  } catch (error: any) {
    toaster.dismiss(loadingToastId);
    toaster.error({
      title: "Sync Failed",
      description: error?.response?.data?.message || "Failed to sync invoices. Please try again.",
      duration: 5000,
    });
  }
}, [syncMutation, invoiceList, selectedRows, filters, refetch, getTodayDateString]);

  const handleExport = useCallback((exportType: 'excel' | 'pdf') => {
    const exportData = selectedRows.size > 0 
      ? invoiceList.filter(inv => selectedRows.has(inv.rowSign))
      : filteredInvoices;
    
    setData(exportData);
    setColumns([
      { key: "billNo", label: "Bill No" },
      { key: "billDate", label: "Date" },
      { key: "vendorName", label: "Vendor" },
      { key: "barcode", label: "Barcode" },
      { key: "productCode", label: "Product Code" },
      { key: "pieces", label: "Pcs" },
      { key: "weight", label: "Wt" },
      { key: "amount", label: "Amount" },
      { key: "mrp", label: "MRP" },
      { key: "billStatus", label: "Status" },
    ]);
    setShowSno(true);
    title?.("Non-Tagged Invoice List");
    router.push(`/print?export=${exportType}`);
  }, [invoiceList, filteredInvoices, selectedRows, setData, setColumns, setShowSno, title, router]);

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
    const targetRows = selectedRows.size > 0
      ? invoiceList.filter(inv => selectedRows.has(inv.rowSign))
      : filteredInvoices;

    return {
      totalPcs: targetRows.reduce((a, b) => a + (b.pieces || 0), 0),
      totalWt: targetRows.reduce((a, b) => a + (b.weight || 0), 0),
      totalAmt: targetRows.reduce((a, b) => a + (b.amount || 0), 0),
      totalMrp: targetRows.reduce((a, b) => a + (b.mrp || 0) * (b.pieces || 0), 0),
      rowCount: targetRows.length,
      selectedCount: selectedRows.size,
    };
  }, [invoiceList, filteredInvoices, selectedRows]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.fromDate !== getTodayDateString() ||
      filters.toDate !== getTodayDateString() ||
      filters.billNo !== "" ||
      (filters.vendorCode !== "ALL" && filters.vendorCode !== "") ||
      filters.productCode !== ""
    );
  }, [filters]);

  const activeFilters = [
    hasActiveFilters,
    !!searchTerm,
    selectedRows.size > 0
  ].filter(Boolean).length;

  // ─── Shared input style ───────────────────────────────────────────────────
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

  const selectStyle: React.CSSProperties = {
    width: "100%",
    height: "30px",
    fontSize: "12px",
    border: `1px solid ${tokens.border}`,
    borderRadius: "8px",
    background: "white",
    padding: "0 10px",
    color: tokens.text,
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238694ae' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    paddingRight: "28px",
  };

  const tableHeaderCols = [
    { label: "Bill No", align: "left" },
    { label: "Date", align: "left" },
    { label: "Vendor", align: "left" },
    { label: "Barcode", align: "left" },
    { label: "Product", align: "right" },
    { label: "Sub Prod", align: "right" },
    { label: "Pur Rate", align: "right" },
    { label: "Pcs", align: "right" },
    { label: "Weight", align: "right" },
    { label: "Disc", align: "right" },
    { label: "Sell Rate", align: "right" },
    { label: "Markup", align: "right" },
    { label: "Amount", align: "right" },
    { label: "MRP", align: "right" },
    { label: "Status", align: "center" },
  ];

  return (
    <>
      <Toaster />

      {/* ── Page Container ── */}
      <Box
        bg={tokens.surface}
        minH="100vh"
        p={{ base: 3, md: 4 }}
        fontFamily="'DM Sans', 'Segoe UI', sans-serif"
        backgroundImage={`radial-gradient(circle at 80% 10%, rgba(61,142,248,0.04) 0%, transparent 60%)`}
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
                <FaLayerGroup />
              </Box>
              <Box>
                <Text fontSize="16px" fontWeight="800" color={tokens.text} letterSpacing="-0.02em" lineHeight="1.1">
                Orion Barcode Generation
                </Text>
                <Text fontSize="10px" color={tokens.textLight} fontWeight="500" mt="1px">
                  Manage and view Orion Barcode Invoice records
                </Text>
              </Box>
            </HStack>
            <HStack gap={2}>
              <Box
                px={3}
                py={1.5}
                borderRadius="8px"
                bg="white"
                border="1px solid"
                borderColor={tokens.borderLight}
                boxShadow="0 1px 4px rgba(15,30,53,0.06)"
              >
                <HStack gap={1.5}>
                  <Box w="6px" h="6px" borderRadius="full" bg={tokens.green} />
                  <Text fontSize="10px" fontWeight="600" color={tokens.textMid}>
                    {filteredInvoices.length} Records
                  </Text>
                </HStack>
              </Box>
            </HStack>
          </Flex>

          {/* ── Filter Card ── */}
          <Box
            bg="white"
            borderRadius="16px"
            p={5}
            boxShadow="0 2px 12px rgba(15,30,53,0.07), 0 1px 3px rgba(15,30,53,0.04)"
            border="1px solid"
            borderColor={tokens.borderLight}
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              h: "3px",
              bg: `linear-gradient(90deg, ${tokens.accent}, ${tokens.violet}, ${tokens.accent})`,
              borderRadius: "16px 16px 0 0",
            }}
          >
            <SectionHeader
              title="Filters & Controls"
              icon={<MdTune />}
              badge={activeFilters}
              right={
                <HStack gap={2}>
                  {/* Export Buttons */}
                  <Button
                    size="xs"
                    h="30px"
                    px={3.5}
                    borderRadius="8px"
                    fontSize="11px"
                    fontWeight="700"
                    variant="outline"
                    borderColor={tokens.border}
                    color={tokens.textMid}
                    onClick={() => handleExport('excel')}
                    _hover={{ bg: tokens.surfaceAlt, borderColor: tokens.accent, color: tokens.accent }}
                    gap={1.5}
                  >
                    <FaFileExcel style={{ fontSize: 12 }} /> Excel
                  </Button>
                  <Button
                    size="xs"
                    h="30px"
                    px={3.5}
                    borderRadius="8px"
                    fontSize="11px"
                    fontWeight="700"
                    variant="outline"
                    borderColor={tokens.border}
                    color={tokens.textMid}
                    onClick={() => handleExport('pdf')}
                    _hover={{ bg: tokens.surfaceAlt, borderColor: tokens.accent, color: tokens.accent }}
                    gap={1.5}
                  >
                    <FaPrint style={{ fontSize: 12 }} /> Print
                  </Button>

                  {/* Sync Button */}
                  <Button
                    size="xs"
                    h="30px"
                    px={3.5}
                    borderRadius="8px"
                    fontSize="11px"
                    fontWeight="700"
                    bg={tokens.green}
                    color="white"
                    loading={syncMutation.isPending}
                    loadingText="Syncing…"
                    onClick={handleSync}
                    _hover={{ bg: "#0da06b", boxShadow: "0 4px 14px rgba(16,185,122,0.3)" }}
                    _active={{ bg: "#0a8a5a" }}
                    gap={1.5}
                    disabled={selectedRows.size === 0}
                    _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
                  >
                    <AiOutlineSave style={{ fontSize: 12 }} /> Sync {selectedRows.size > 0 && `(${selectedRows.size})`}
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
                    gap={1}
                  >
                    <AiOutlineReload style={{ fontSize: 11 }} /> Reset
                  </Button>
                </HStack>
              }
            />

            <Grid templateColumns={{ base: "1fr", md: "repeat(6, 1fr) auto" }} gap={2.5} alignItems="end">
              <GridItem>
                <FieldLabel>Vendor</FieldLabel>
                <select
                  value={filters.vendorCode}
                  onChange={(e) => handleFilterChange("vendorCode", e.target.value)}
                  style={selectStyle}
                >
                  {vendorOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </GridItem>

              <GridItem>
                <FieldLabel>From</FieldLabel>
                <Input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange("fromDate", e.target.value)} {...inputStyle} />
              </GridItem>

              <GridItem>
                <FieldLabel>To</FieldLabel>
                <Input type="date" value={filters.toDate} onChange={(e) => handleFilterChange("toDate", e.target.value)} {...inputStyle} />
              </GridItem>

              <GridItem>
                <FieldLabel>Bill No</FieldLabel>
                <Input placeholder="e.g. 16" value={filters.billNo} onChange={(e) => handleFilterChange("billNo", e.target.value)} {...inputStyle} />
              </GridItem>

              <GridItem>
                <FieldLabel>Product Code</FieldLabel>
                <Input placeholder="e.g. 3" value={filters.productCode} onChange={(e) => handleFilterChange("productCode", e.target.value)} {...inputStyle} />
              </GridItem>

              <GridItem>
                <FieldLabel>Search</FieldLabel>
                <Input
                  placeholder="Bill No, Barcode…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  {...inputStyle}
                />
              </GridItem>

              <GridItem>
                <Button
                  size="xs"
                  h="30px"
                  w="100%"
                  px={4}
                  borderRadius="8px"
                  fontSize="11px"
                  fontWeight="700"
                  bg={tokens.accent}
                  color="white"
                  loading={isLoading}
                  loadingText="Loading…"
                  onClick={handleView}
                  _hover={{ bg: tokens.accentHover, boxShadow: `0 4px 14px ${tokens.accentGlow}` }}
                  _active={{ bg: "#1e6fd0" }}
                  gap={1.5}
                >
                  {isLoading ? <Spinner size="xs" /> : <><AiOutlineSearch style={{ fontSize: 12 }} /> View</>}
                </Button>
              </GridItem>
            </Grid>
          </Box>

          {/* ── Table Card ── */}
          <Box
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 12px rgba(15,30,53,0.07), 0 1px 3px rgba(15,30,53,0.04)"
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
                <Checkbox.Root
                  checked={selectAll}
                  onCheckedChange={e => setSelectAll(!!e.checked)}
                  size="xs"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    borderRadius="4px"
                    borderColor={tokens.border}
                    _checked={{ bg: tokens.accent, borderColor: tokens.accent }}
                  />
                  <Checkbox.Label>
                    <Text fontSize="11px" fontWeight="600" color={tokens.text}>All</Text>
                  </Checkbox.Label>
                </Checkbox.Root>

                <Box
                  w="24px"
                  h="24px"
                  borderRadius="7px"
                  bg={tokens.accentGlow}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={tokens.accent}
                  fontSize="11px"
                >
                  <MdFilterList />
                </Box>
                <Text fontSize="11px" fontWeight="700" color={tokens.text} letterSpacing="0.04em">
                  Non-Tagged Invoices
                </Text>
                {hasActiveFilters && (
                  <Box px={2} py={0.5} borderRadius="5px" bg={`${tokens.accent}15`} border="1px solid" borderColor={`${tokens.accent}30`}>
                    <Text fontSize="9px" fontWeight="700" color={tokens.accent} textTransform="uppercase" letterSpacing="0.08em">
                      Filtered
                    </Text>
                  </Box>
                )}
                {selectedRows.size > 0 && (
                  <Box px={2} py={0.5} borderRadius="5px" bg={`${tokens.green}15`} border="1px solid" borderColor={`${tokens.green}30`}>
                    <Text fontSize="9px" fontWeight="700" color={tokens.green} textTransform="uppercase" letterSpacing="0.08em">
                      {selectedRows.size} Selected
                    </Text>
                  </Box>
                )}
              </HStack>

              <HStack gap={1.5}>
                <Text fontSize="11px" color={tokens.textLight}>
                  <Text as="span" fontWeight="800" color={tokens.text} fontSize="13px">
                    {filteredInvoices.length}
                  </Text>{" "}
                  records
                </Text>
                {searchTerm && (
                  <Box px={2} py={0.5} borderRadius="5px" bg="#fff7ed" border="1px solid #fed7aa">
                    <Text fontSize="9px" fontWeight="700" color="#c2410c">
                      "{searchTerm}"
                    </Text>
                  </Box>
                )}
              </HStack>
            </Flex>

            {/* Table */}
            <Box
              overflowX="auto"
              maxH="calc(100vh - 370px)"
              overflowY="auto"
              css={{
                "&::-webkit-scrollbar": { height: "5px", width: "5px" },
                "&::-webkit-scrollbar-track": { background: tokens.surfaceAlt },
                "&::-webkit-scrollbar-thumb": { background: tokens.border, borderRadius: "4px" },
                "&::-webkit-scrollbar-thumb:hover": { background: "#b8c4d8" },
              }}
            >
              <Table.Root variant="outline" style={{ borderCollapse: "collapse", width: "100%", minWidth: "1300px" }}>
                <Table.Header style={{ position: "sticky", top: 0, zIndex: 2 }}>
                  <Table.Row>
                    <Table.ColumnHeader
                      w="36px"
                      px={2}
                      py={2.5}
                      bg={tokens.navy}
                      color="rgba(255,255,255,0.75)"
                      borderRight="1px solid rgba(255,255,255,0.07)"
                      style={{
                        background: `linear-gradient(180deg, ${tokens.navyLight} 0%, ${tokens.navy} 100%)`,
                      }}
                    >
                      {/* Checkbox column header */}
                    </Table.ColumnHeader>
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
                        color="rgba(255,255,255,0.75)"
                        borderRight={i < tableHeaderCols.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none"}
                        style={{
                          background: `linear-gradient(180deg, ${tokens.navyLight} 0%, ${tokens.navy} 100%)`,
                        }}
                        _last={{ pr: 4 }}
                      >
                        {col.label}
                      </Table.ColumnHeader>
                    ))}
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isLoading ? (
                    <Table.Row>
                      <Table.Cell colSpan={tableHeaderCols.length + 1} textAlign="center" py={12}>
                        <VStack gap={2}>
                          <Spinner size="md" color={tokens.accent} borderWidth="2px" />
                          <Text fontSize="12px" color={tokens.textLight} fontWeight="500">
                            Loading invoices…
                          </Text>
                        </VStack>
                      </Table.Cell>
                    </Table.Row>
                  ) : filteredInvoices.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={tableHeaderCols.length + 1} textAlign="center" py={14}>
                        <VStack gap={2}>
                          <Box
                            w="48px"
                            h="48px"
                            borderRadius="14px"
                            bg={tokens.surfaceAlt}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="20px"
                            color={tokens.textLight}
                          >
                            <FaLayerGroup />
                          </Box>
                          <Text fontSize="13px" fontWeight="700" color={tokens.textMid}>
                            No invoices found
                          </Text>
                          <Text fontSize="11px" color={tokens.textLight}>
                            Try adjusting your filters or search term
                          </Text>
                        </VStack>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredInvoices.map((row, idx) => {
                      const isSelected = selectedRows.has(row.rowSign);
                      const isHovered = hoveredRow === row.rowSign;
                      const isEven = idx % 2 === 0;
                      
                      return (
                        <Table.Row
                          key={row.rowSign || idx}
                          bg={isSelected ? `${tokens.accent}08` : isHovered ? "#f0f6ff" : isEven ? "white" : tokens.surface}
                          onMouseEnter={() => setHoveredRow(row.rowSign)}
                          onMouseLeave={() => setHoveredRow(null)}
                          transition="background 0.1s ease"
                          borderBottom="1px solid"
                          borderColor={tokens.borderLight}
                          _last={{ borderBottom: "none" }}
                        >
                          <Table.Cell px={2} py={2} borderRight="1px solid" borderColor={tokens.borderLight}>
                            <Checkbox.Root
                              checked={isSelected}
                              onCheckedChange={e => handleSelectRow(row.rowSign, !!e.checked)}
                              size="xs"
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control
                                borderRadius="4px"
                                borderColor={tokens.border}
                                _checked={{ bg: tokens.accent, borderColor: tokens.accent }}
                              />
                            </Checkbox.Root>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight}>
                            <Text fontSize="11px" fontWeight="800" color={tokens.accent}>
                              #{row.billNo}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} whiteSpace="nowrap">
                            <Text fontSize="11px" color={tokens.textMid} fontWeight="500">
                              {formatDate(row.billDate)}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight}>
                            <Box
                              display="inline-flex"
                              alignItems="center"
                              px={2}
                              py={0.5}
                              borderRadius="6px"
                              bg={`${tokens.violet}12`}
                              border="1px solid"
                              borderColor={`${tokens.violet}25`}
                            >
                              <Text fontSize="10px" fontWeight="700" color={tokens.violet}>
                                {row.vendorName}
                              </Text>
                            </Box>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight}>
                            {row.barcode && row.barcode !== "—" ? (
                              <Box
                                display="inline-flex"
                                alignItems="center"
                                px={1.5}
                                py={0.5}
                                borderRadius="5px"
                                bg={tokens.surfaceAlt}
                                border="1px solid"
                                borderColor={tokens.border}
                              >
                                <Text fontSize="10px" fontFamily="monospace" fontWeight="600" color={tokens.textMid}>
                                  {row.barcode}
                                </Text>
                              </Box>
                            ) : (
                              <Text fontSize="11px" color={tokens.textLight}>—</Text>
                            )}
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="600" color={tokens.text}>
                              {row.productCode}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" color={tokens.textMid}>
                              {row.subProductCode}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color={tokens.text}>
                              {row.purRate ? row.purRate.toFixed(2) : "0.00"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="700" color={tokens.text}>{row.pieces || 0}</Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" color={tokens.textMid}>
                              {row.weight ? row.weight.toFixed(3) : "0.000"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="600" color={row.discount && row.discount > 0 ? "#ea580c" : tokens.textLight}>
                              {row.discount && row.discount > 0 ? row.discount.toFixed(2) : "—"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color={tokens.text}>
                              {row.sellingRate ? row.sellingRate.toFixed(2) : "0.00"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="600" color={row.markup && row.markup > 0 ? tokens.green : tokens.textLight}>
                              {row.markup && row.markup > 0 ? `+${row.markup.toFixed(2)}` : "—"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="700" color={tokens.text}>
                              {formatCurrency(row.amount)}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="500" color={tokens.textMid}>
                              {formatCurrency(row.mrp)}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} textAlign="center">
                            <Box
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              px={2}
                              py={0.5}
                              borderRadius="6px"
                              bg={row.billStatus === "ACTIVE" ? "#dcfce7" : tokens.surfaceAlt}
                              border="1px solid"
                              borderColor={row.billStatus === "ACTIVE" ? "#bbf7d0" : tokens.border}
                            >
                              {row.billStatus === "ACTIVE" && (
                                <Box w="5px" h="5px" borderRadius="full" bg={tokens.green} flexShrink={0} />
                              )}
                              <Text
                                fontSize="9px"
                                fontWeight="700"
                                color={row.billStatus === "ACTIVE" ? "#166534" : tokens.textLight}
                                letterSpacing="0.06em"
                              >
                                {row.billStatus || "—"}
                              </Text>
                            </Box>
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
            <StatCard 
              label={selectedRows.size > 0 ? "Selected Records" : "Total Records"} 
              value={selectedRows.size > 0 ? totals.selectedCount.toLocaleString() : totals.rowCount.toLocaleString()} 
              accent={tokens.violet} 
              icon="🗂️" 
            />
            <StatCard 
              label="Total Pieces" 
              value={totals.totalPcs.toLocaleString()} 
              accent={tokens.accent} 
              icon="📦" 
            />
            <StatCard 
              label="Total Weight" 
              value={`${totals.totalWt.toFixed(3)} kg`} 
              accent={tokens.green} 
              icon="⚖️" 
            />
            <StatCard 
              label="Total Amount" 
              value={formatCurrency(totals.totalAmt)} 
              accent={tokens.amber} 
              icon="💰" 
            />
          </Grid>

        </VStack>
      </Box>
    </>
  );
}
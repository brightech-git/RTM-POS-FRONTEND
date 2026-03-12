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
import { FaCheckCircle, FaLayerGroup } from "react-icons/fa";
import { MdFilterList, MdTune } from "react-icons/md";
import { useTheme } from "@/context/theme/themeContext";
import { useDebounce } from "@/hooks/Debounce/useDebounce";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { useAllTaged, useFilterTaged, useSyncTaged } from "@/hooks/Tagged/useTagged";
import { TagedUIFilter, Taged } from "@/types/Tagged/Tagged";
import { toaster, Toaster } from "@/components/ui/toaster";

// ─── Interfaces (unchanged) ───────────────────────────────────────────────
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
  VENDORNAME: string | null; // <-- Added this field
  WEIGHT: number;
}

interface SyncResponseItem {
  BILLNO: number;
  CREATEDBY: number;
  CREATEDDATE: string;
  CREATEDTIME: string;
  DISCPER: number;
  ENTRYORDER: number;
  HSNCODE: string;
  IPID: number;
  MARKUP: number;
  MARKUPPER: number;
  MRP: number;
  PIECES: number;
  PLUSDATE: string;
  PRODUCTCODE: number;
  PURRATE: number;
  ROWSIGN: string;
  SELLINGRATE: number;
  SUBPRODUCTCODE: number;
  TAGNO: string;
  UNIQUEKEY: string;
  UNITCODE: number;
  VENDORCODE: number;
  WEIGHT: number;
}

interface TaggedRow {
  rowSign: string;
  billNo: number;
  billDate: string;
  vendorCode: number;
  vendorName: string | null; // Added
  barcode: string;
  productCode: number;
  productName: string | null; // Added
  subProductCode: number;
  subProductName: string | null; // Added
  purRate: number;
  pieces: number;
  weight: number;
  discount: number | null;
  discPer: number | null; // Added
  sellingRate: number;
  markup: number | null;
  markupPer: number | null; // Added
  amount: number | null;
  mrp: number;
  billStatus: string | null;
  billType: string; // Added
  invoiceNo: string;
  totalAmount: number;
  taxAmount: number;
  taxPer: number; // Added
  taxCalc: string; // Added
  cgstAmount: number | null; // Added
  cgstPer: number | null; // Added
  cgstTaxCode: number | null; // Added
  sgstAmount: number | null; // Added
  sgstPer: number | null; // Added
  sgstTaxCode: number | null; // Added
  igstAmount: number | null; // Added
  igstPer: number | null; // Added
  igstTaxCode: number | null; // Added
  srvAmount: number | null; // Added
  srvPer: number | null; // Added
  srvTaxCode: number | null; // Added
  hsnCalc: string | null; // Added
  hsnCode: string;
  hsnTaxCode: number;
  tagGen: string; // Added
  createdBy: number; // Added
  createdDate: string; // Added
  createdTime: string; // Added
  unitCode: number; // Added
}

interface SyncModalItem {
  billNo: number;
  tagNo: string;
  pieces: number;
  isSelected: boolean;
  copies: number;
  sellingRate: number;
  productCode?: number; // Optional, added
  subProductCode?: number; // Optional, added
  barcode?: string; // Optional, added
  weight?: number; // Optional, added
  amount?: number; // Optional, added
  totalAmount?: number; // Optional, added
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
export default function TaggedListPage() {
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

  const [filters, setFilters] = useState<TagedUIFilter>({
    fromDate: getTodayDateString(), // Auto set to today
    toDate: getTodayDateString(),   // Auto set to today
    billNo: "",
    vendorCode: "ALL",
    productCode: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncModalItems, setSyncModalItems] = useState<SyncModalItem[]>([]);
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());



  const { data: allTagedData, isLoading: isLoadingAll, refetch: refetchAll } = useAllTaged();
  const syncMutation = useSyncTaged();


  useEffect(() => {
    const map = new Map<string, number>();
    const sourceData = allTagedData as any;

    const items: ApiTagedItem[] = Array.isArray(sourceData)
      ? sourceData
      : Array.isArray(sourceData?.data)
        ? sourceData.data
        : [];

    items.forEach((item: ApiTagedItem) => {
      if (item.VENDORNAME && item.VENDORCODE) {
        map.set(item.VENDORNAME, item.VENDORCODE);
      }
    });

    setVendorMap(map);
  }, [allTagedData]);


  const hasActiveFilters = useMemo(() => {
    return (
      filters.fromDate !== "" ||
      filters.toDate !== "" ||
      filters.billNo !== "" ||
      (filters.vendorCode !== "ALL" && filters.vendorCode !== "") ||
      filters.productCode !== ""
    );
  }, [filters]);

  const { data: filteredData, isLoading: isLoadingFiltered, refetch: refetchFiltered } = useFilterTaged(
    hasActiveFilters
      ? {
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        billNo: filters.billNo ? parseInt(filters.billNo) : undefined,
        vendorCode: filters.vendorCode !== "ALL" ? parseInt(filters.vendorCode) : undefined, // This now gets the code
        productCode: filters.productCode ? parseInt(filters.productCode) : undefined,
      }
      : null
  );

  const transformApiData = useCallback(
    (
      apiResponse:
        | { message: string; data: ApiTagedItem[] }
        | ApiTagedItem[]
        | Taged[]
        | undefined
    ): TaggedRow[] => {
      if (!apiResponse) return [];

      let items: ApiTagedItem[] = [];

      if (Array.isArray(apiResponse)) {
        items = apiResponse as ApiTagedItem[];
      } else if (apiResponse && 'data' in apiResponse && Array.isArray(apiResponse.data)) {
        items = apiResponse.data;
      }

      return items.map((item) => ({
        rowSign: item.ROWSIGN || "",
        billNo: item.BILLNO || 0,
        billDate: item.BILLDATE || "",
        vendorCode: item.VENDORCODE || 0,
        vendorName: item.VENDORNAME || "",          // fixed
        barcode: item.ORIONBARCODE || "—",
        productCode: item.PRODUCTCODE || 0,
        productName: item.PRODUCTNAME || "",        // fixed
        subProductCode: item.SUBPRODUCTCODE || 0,
        subProductName: item.SUBPRODUCTNAME || "",  // fixed
        purRate: item.PURRATE || 0,
        pieces: item.PIECES || 0,
        weight: item.WEIGHT || 0,
        discount: item.DISCOUNT,
        discPer: item.DISCPER,
        sellingRate: item.SELLINGRATE || 0,
        markup: item.MARKUP,
        markupPer: item.MARKUPPER,
        amount: item.AMOUNT,
        mrp: item.MRP || 0,
        billStatus: item.BILLSTATUS,
        billType: item.BILLTYPE || "",
        invoiceNo: item.INVOICENO || "—",
        totalAmount: item.TOTALAMOUNT || 0,
        taxAmount: item.TAXAMOUNT || 0,
        taxPer: item.TAXPER || 0,
        taxCalc: item.TAXCALC || "",
        cgstAmount: item.CGSTAMOUNT || 0,
        cgstPer: item.CGSTPER || 0,
        cgstTaxCode: item.CGSTTAXCODE || 0,
        sgstAmount: item.SGSTAMOUNT || 0,
        sgstPer: item.SGSTPER || 0,
        sgstTaxCode: item.SGSTTAXCODE || 0,
        igstAmount: item.IGSTAMOUNT || 0,
        igstPer: item.IGSTPER || 0,
        igstTaxCode: item.IGSTTAXCODE || 0,
        srvAmount: item.SRVAMOUNT || 0,
        srvPer: item.SRVPER || 0,
        srvTaxCode: item.SRVTAXCODE || 0,
        hsnCalc: item.HSNCALC || "",
        hsnCode: item.HSNCODE || "",
        hsnTaxCode: item.HSNTAXCODE || 0,
        tagGen: item.TAGGEN || "",
        createdBy: item.CREATEDBY || 0,
        createdDate: item.CREATEDDATE || "",
        createdTime: item.CREATEDTIME || "",
        unitCode: item.UNITCODE || 0,
      }));
    },
    []
  );

  const invoiceList = useMemo(() => {
    const sourceData = hasActiveFilters ? filteredData : allTagedData;
    return transformApiData(sourceData);
  }, [allTagedData, filteredData, hasActiveFilters, transformApiData]);

  const isLoading = isLoadingAll || (hasActiveFilters && isLoadingFiltered);

  const vendorOptions = useMemo(() => {
    return [
      { label: "All Vendors", value: "ALL" },
      ...Array.from(vendorMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort by name
        .map(([name, code]) => ({
          label: name,
          value: code.toString() // Store code as value
        })),
    ];
  }, [vendorMap]);

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoiceList];
    if (debouncedSearchTerm.trim()) {
      const s = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (inv) =>
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
  }, []);

  const handleView = useCallback(async () => {
    try {
      if (hasActiveFilters) await refetchFiltered();
      else await refetchAll();
      toaster.success({ title: "Refreshed", description: "Tagged list updated.", duration: 3000 });
    } catch {
      toaster.error({ title: "Error", description: "Failed to refresh data", duration: 3000 });
    }
  }, [hasActiveFilters, refetchFiltered, refetchAll]);

  const handleSync = useCallback(async () => {
    const syncFilters = {
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      billNo: filters.billNo ? parseInt(filters.billNo) : undefined,
      vendorCode: filters.vendorCode !== "ALL" ? parseInt(filters.vendorCode) : undefined,
      productCode: filters.productCode ? parseInt(filters.productCode) : undefined,
    };

    const loadingToastId = toaster.create({
      title: "Syncing…",
      description: "Please wait while invoices are being synced",
      type: "loading",
      duration: 30000,
    });

    try {
      const response = await syncMutation.mutateAsync(syncFilters);
      toaster.dismiss(loadingToastId);

      if (Array.isArray(response) && response.length > 0) {
        const modalItems: SyncModalItem[] = response.map((item) => ({
          billNo: item.BILLNO ?? 0,
          tagNo: item.TAGNO ?? item.TAGGEN ?? "",
          pieces: Number(item.PIECES ?? 0),
          isSelected: true,
          copies: Number(item.PIECES ?? 0),
          sellingRate: item.SELLINGRATE ?? 0,
        }));

        setSyncModalItems(modalItems);
        setIsSyncModalOpen(true);
      } else {
        toaster.success({
          title: "Success",
          description: "No items to sync",
          duration: 3000,
        });
      }

      // Clear filters after successful sync
      setFilters({
        fromDate: getTodayDateString(),
        toDate: getTodayDateString(),
        billNo: "",
        vendorCode: "ALL",
        productCode: ""
      });
      setSearchTerm("");

      // Then refetch the data with the cleared filters
      if (hasActiveFilters) {
        await refetchFiltered();
      } else {
        await refetchAll();
      }

    } catch (error: any) {
      toaster.dismiss(loadingToastId);
      toaster.error({
        title: "Sync Failed",
        description: error?.response?.data?.message || "Failed to sync invoices. Please try again.",
        duration: 5000,
      });
    }
  }, [syncMutation, filters, hasActiveFilters, refetchFiltered, refetchAll]);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSyncModalItems((prev) => prev.map((item) => ({ ...item, isSelected: checked })));
  }, []);

  const handleSelectItem = useCallback((index: number, checked: boolean) => {
    setSyncModalItems((prev) => prev.map((item, i) => (i === index ? { ...item, isSelected: checked } : item)));
  }, []);

  const handleCopiesChange = useCallback((index: number, copies: number) => {
    setSyncModalItems((prev) => prev.map((item, i) => (i === index ? { ...item, copies } : item)));
  }, []);

  const handlePrintSelected = useCallback(() => {
    const selectedItems = syncModalItems.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      toaster.warning({
        title: "No items selected",
        description: "Please select at least one item to print",
        duration: 3000
      });
      return;
    }

    const printData = selectedItems.flatMap((item) =>
      Array(item.copies)
        .fill(null)
        .map(() => ({
          billNo: item.billNo,
          tagNo: item.tagNo,
          sellingRate: item.sellingRate,
        }))
    );

    setData(printData);
    setColumns([
      { key: "tagNo", label: "Tag No" },
      { key: "billNo", label: "Bill No" },
      { key: "sellingRate", label: "Rate" },
    ]);
    setShowSno(false);
    title?.("Tagged Items Print");
    setIsSyncModalOpen(false);
    router.push("/TagPrint");
  }, [syncModalItems, setData, setColumns, setShowSno, title, router]);

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

  const totals = useMemo(() => ({
    totalPcs: filteredInvoices.reduce((a, b) => a + (b.pieces || 0), 0),
    totalWt: filteredInvoices.reduce((a, b) => a + (b.weight || 0), 0),
    totalAmt: filteredInvoices.reduce((a, b) => a + (b.amount || 0), 0),
    totalTax: filteredInvoices.reduce((a, b) => a + (b.taxAmount || 0), 0),
    totalMrp: filteredInvoices.reduce((a, b) => a + (b.mrp || 0) * (b.pieces || 0), 0),
    rowCount: filteredInvoices.length,
  }), [filteredInvoices]);

  const activeFilters = [hasActiveFilters, !!searchTerm].filter(Boolean).length;

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
    { label: "Invoice No", align: "left" },
    // { label: "Barcode", align: "left" },
    { label: "Product", align: "right" },
    { label: "Sub Prod.", align: "right" },
    { label: "Pur Rate", align: "right" },
    { label: "Pcs", align: "right" },
    { label: "Weight", align: "right" },
    { label: "Disc", align: "right" },
    { label: "Sell Rate", align: "right" },
    { label: "MRP", align: "right" },
    // { label: "Markup", align: "right" },
    { label: "Amount", align: "right" },
    { label: "Tax", align: "right" },
    { label: "Total", align: "right" },
    
    // { label: "Status", align: "center" },
  ];

  return (
    <>
      <Toaster />

      {/* ── Sync Modal ── */}
      <DialogRoot
        open={isSyncModalOpen}
        onOpenChange={(e) => setIsSyncModalOpen(e.open)}
        size="sm"
        scrollBehavior="inside"
      >
        <DialogContent
          borderRadius="20px"
          boxShadow="0 24px 80px rgba(15,30,53,0.22), 0 8px 24px rgba(15,30,53,0.12)"
          border="1px solid"
          borderColor={tokens.borderLight}
          overflow="hidden"
        >
          <DialogHeader
            px={6}
            py={4}
            bg={tokens.headerBg}
            borderBottom="none"
          >
            <HStack gap={3}>
              <Box
                w="36px"
                h="36px"
                borderRadius="10px"
                bg="rgba(255,255,255,0.15)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="16px"
              >
                <FaCheckCircle />
              </Box>
              <Box>
                <DialogTitle fontSize="15px" fontWeight="800" color="white" letterSpacing="-0.01em">
                  Sync Successful
                </DialogTitle>
                <DialogDescription fontSize="10px" color="rgba(255,255,255,0.55)" fontWeight="500" mt="1px">
                  Select items and configure copies to print
                </DialogDescription>
              </Box>
            </HStack>
          </DialogHeader>

          <DialogCloseTrigger
            color="rgba(255,255,255,0.6)"
            _hover={{ color: "white", bg: "rgba(255,255,255,0.1)" }}
            top={3}
            right={4}
            borderRadius="8px"
          />

          <DialogBody px={6} py={5}>
            <Flex
              align="center"
              justify="space-between"
              mb={3}
              pb={3}
              borderBottom="1px solid"
              borderColor={tokens.borderLight}
            >
              <Checkbox.Root
                size="sm"
                checked={
                  syncModalItems.length > 0 &&
                  (syncModalItems.every((i) => i.isSelected)
                    ? true
                    : syncModalItems.some((i) => i.isSelected)
                      ? "indeterminate"
                      : false)
                }
                onCheckedChange={(e) => handleSelectAll(!!e.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control
                  borderRadius="5px"
                  borderColor={tokens.border}
                  _checked={{ bg: tokens.accent, borderColor: tokens.accent }}
                />
                <Checkbox.Label>
                  <Text fontSize="12px" fontWeight="700" color={tokens.text}>
                    Select All
                  </Text>
                </Checkbox.Label>
              </Checkbox.Root>
              <Text fontSize="11px" color={tokens.textLight}>
                <Text as="span" fontWeight="700" color={tokens.text}>
                  {syncModalItems.filter((i) => i.isSelected).length}
                </Text>{" "}
                of {syncModalItems.length} selected
              </Text>
            </Flex>

            <VStack gap={2} align="stretch" maxH="260px" overflowY="auto">
              {syncModalItems.map((item, index) => (
                <Flex
                  key={index}
                  p={2}
                  border="1px solid"
                  borderColor={tokens.borderLight}
                  borderRadius="8px"
                  align="center"
                  justify="space-between"
                  fontSize="12px"
                  bg="white"
                >
                  <Checkbox.Root
                    size="sm"
                    checked={item.isSelected}
                    onCheckedChange={(e) => handleSelectItem(index, !!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>

                  <Text fontWeight="700" color={tokens.accent}>
                    #{item.billNo}
                  </Text>

                  <Text fontWeight="600">{item.tagNo}</Text>

                  <Flex align="center" gap={2}>
                    <Text color={tokens.textMid}>{item.pieces} pcs</Text>
                    <Input
                      type="number"
                      size="xs"
                      width="60px"
                      value={item.copies}
                      onChange={(e) => handleCopiesChange(index, parseInt(e.target.value) || 1)}
                      min={1}
                      max={99}
                      borderRadius="6px"
                      borderColor={tokens.border}
                    />
                  </Flex>
                </Flex>
              ))}
            </VStack>

            <Grid templateColumns="repeat(3, 1fr)" gap={3} mt={5} p={4} bg={tokens.surface} borderRadius="12px" border="1px solid" borderColor={tokens.borderLight}>
              {[
                { label: "Total Items", value: syncModalItems.length, color: tokens.violet },
                { label: "Selected", value: syncModalItems.filter((i) => i.isSelected).length, color: tokens.accent },
                { label: "Total Copies", value: syncModalItems.filter((i) => i.isSelected).reduce((s, i) => s + i.copies, 0), color: tokens.green },
              ].map((s) => (
                <Box key={s.label} textAlign="center">
                  <Text fontSize="9px" color={tokens.textLight} fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" mb={1}>
                    {s.label}
                  </Text>
                  <Text fontSize="20px" fontWeight="800" color={s.color} letterSpacing="-0.03em">
                    {s.value}
                  </Text>
                </Box>
              ))}
            </Grid>
          </DialogBody>

          <DialogFooter px={6} py={4} borderTop="1px solid" borderColor={tokens.borderLight} bg={tokens.surface}>
            <HStack gap={2.5} w="100%" justify="flex-end">
              <Button
                size="sm"
                variant="ghost"
                color={tokens.textMid}
                borderRadius="9px"
                fontSize="12px"
                fontWeight="600"
                h="34px"
                px={4}
                _hover={{ bg: tokens.surfaceAlt, color: tokens.text }}
                onClick={() => setIsSyncModalOpen(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                borderRadius="9px"
                fontSize="12px"
                fontWeight="700"
                h="34px"
                px={5}
                bg={tokens.accent}
                color="white"
                disabled={syncModalItems.filter((i) => i.isSelected).length === 0}
                onClick={handlePrintSelected}
                _hover={{ bg: tokens.accentHover, boxShadow: `0 4px 14px ${tokens.accentGlow}` }}
                _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
              >
                <AiOutlinePrinter style={{ marginRight: 6, fontSize: 14 }} />
                Print Selected ({syncModalItems.filter((i) => i.isSelected).length})
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

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
                  Tagged Invoices
                </Text>
                <Text fontSize="10px" color={tokens.textLight} fontWeight="500" mt="1px">
                  Manage and view tagged invoice records
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
                  {/* Sync Button - Only action button remaining */}
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
                  >
                    <AiOutlineSave style={{ fontSize: 12 }} /> Sync
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
                  placeholder="Bill No,Invoice…"
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
                  Tagged Invoices
                </Text>
                {hasActiveFilters && (
                  <Box px={2} py={0.5} borderRadius="5px" bg={`${tokens.accent}15`} border="1px solid" borderColor={`${tokens.accent}30`}>
                    <Text fontSize="9px" fontWeight="700" color={tokens.accent} textTransform="uppercase" letterSpacing="0.08em">
                      Filtered
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
                        _first={{ pl: 4 }}
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
                      <Table.Cell colSpan={18} textAlign="center" py={12}>
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
                      <Table.Cell colSpan={18} textAlign="center" py={14}>
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
                      const isHovered = hoveredRow === row.rowSign;
                      const isEven = idx % 2 === 0;
                      return (
                        <Table.Row
                          key={row.rowSign || idx}
                          bg={isHovered ? "#f0f6ff" : isEven ? "white" : tokens.surface}
                          onMouseEnter={() => setHoveredRow(row.rowSign)}
                          onMouseLeave={() => setHoveredRow(null)}
                          transition="background 0.1s ease"
                          borderBottom="1px solid"
                          borderColor={tokens.borderLight}
                          _last={{ borderBottom: "none" }}
                        >
                          <Table.Cell px={4} py={2} borderRight="1px solid" borderColor={tokens.borderLight}>
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
                            <Text fontSize="11px" color={tokens.textMid} fontWeight="500">
                              {row.invoiceNo || "—"}
                            </Text>
                          </Table.Cell>

                          {/* <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight}>
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
                          </Table.Cell> */}

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="600" color={tokens.text}>{row.productName}</Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" color={tokens.textMid}>{row.subProductName}</Text>
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
                            <Text fontSize="11px" fontWeight="500" color={tokens.textMid}>
                              {formatCurrency(row.mrp)}
                            </Text>
                          </Table.Cell>

                          {/* <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="600" color={row.markup && row.markup > 0 ? tokens.green : tokens.textLight}>
                              {row.markup && row.markup > 0 ? `+${row.markup.toFixed(2)}` : "—"}
                            </Text>
                          </Table.Cell> */}

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="700" color={tokens.text}>
                              {formatCurrency(row.amount)}
                            </Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" color={tokens.textMid}>{formatCurrency(row.taxAmount)}</Text>
                          </Table.Cell>

                          <Table.Cell px={3} py={2} borderRight="1px solid" borderColor={tokens.borderLight} textAlign="right">
                            <Text fontSize="11px" fontWeight="800" color={tokens.green}>
                              {formatCurrency(row.totalAmount)}
                            </Text>
                          </Table.Cell>

                          

                          {/* <Table.Cell px={4} py={2} textAlign="center">
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
                          </Table.Cell> */}
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          </Box>

          {/* ── Summary Stats ── */}
          <Grid templateColumns="repeat(5, 1fr)" gap={3}>
            <StatCard label="Total Records" value={totals.rowCount.toLocaleString()} accent={tokens.violet} icon="🗂️" />
            <StatCard label="Total Pieces" value={totals.totalPcs.toLocaleString()} accent={tokens.accent} icon="📦" />
            <StatCard label="Total Weight" value={`${totals.totalWt.toFixed(3)} kg`} accent={tokens.green} icon="⚖️" />
            <StatCard label="Total Amount" value={formatCurrency(totals.totalAmt)} accent={tokens.amber} icon="💰" />
            <StatCard label="Total Tax" value={formatCurrency(totals.totalTax)} accent={tokens.pink} icon="🧾" />
          </Grid>

        </VStack>
      </Box>
    </>
  );
}
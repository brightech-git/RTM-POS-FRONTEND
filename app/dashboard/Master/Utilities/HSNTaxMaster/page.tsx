"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    Box,
    Button,
    VStack,
    Text,
    Grid,
    GridItem,
    HStack,
    Input,
    IconButton,
    Flex,
    Card,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave, AiOutlineSearch } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { toastError, toastLoaded } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import {
    useAllHSNTax,
    useCreateHSNTax,
    useUpdateHSNTax,
    useDeleteHSNTax,
} from "@/hooks/HSNTax/useHSNTax";
import { useAllTaxes } from "@/hooks/Tax/useTax";
import { useAllHSN } from "@/hooks/HSN/useHSN";
import { SelectCombobox, SelectItem } from "@/components/ui/selectComboBox";

// Types
interface HSNTaxData {
    HSNTAXCODE?: number;
    HSNCODE: string;
    BELOWSALESAMOUNT: number;
    BELOWSGSTTAXCODE: number;
    BELOWCGSTTAXCODE: number;
    BELOWIGSTTAXCODE: number;
    BELOWSRVTAXCODE: number;
    ABOVESGSTTAXCODE: number;
    ABOVECGSTTAXCODE: number;
    ABOVEIGSTTAXCODE: number;
    ABOVESRVTAXCODE: number;
    CREATEDDATE?: string;
    HSNNAME?: string;
    HSNDESCRIPTION?: string;
}

// Initial empty form
const EMPTY_FORM: HSNTaxData = {
    HSNCODE: "",
    BELOWSALESAMOUNT: 0,
    BELOWSGSTTAXCODE: 0,
    BELOWCGSTTAXCODE: 0,
    BELOWIGSTTAXCODE: 0,
    BELOWSRVTAXCODE: 0,
    ABOVESGSTTAXCODE: 0,
    ABOVECGSTTAXCODE: 0,
    ABOVEIGSTTAXCODE: 0,
    ABOVESRVTAXCODE: 0,
};

export default function HSNTaxMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    // Refs for focus management
    const hsnRef = useRef<HTMLInputElement>(null);
    const salesAmountRef = useRef<HTMLInputElement>(null);
    const belowSgstRef = useRef<HTMLInputElement>(null);
    const belowCgstRef = useRef<HTMLInputElement>(null);
    const belowIgstRef = useRef<HTMLInputElement>(null);
    const belowSrvRef = useRef<HTMLInputElement>(null);
    const aboveSgstRef = useRef<HTMLInputElement>(null);
    const aboveCgstRef = useRef<HTMLInputElement>(null);
    const aboveIgstRef = useRef<HTMLInputElement>(null);
    const aboveSrvRef = useRef<HTMLInputElement>(null);
    const saveRef = useRef<HTMLButtonElement>(null);

    /* -------------------- API HOOKS -------------------- */
    const { data: hsnTaxList = [], isLoading: isApiLoading, refetch: hsnTaxRefetch } = useAllHSNTax();
    const { data: taxes = [], isLoading: isTaxesLoading, refetch: taxRefetch } = useAllTaxes();
    const { data: hsnList = [] } = useAllHSN();
    const createMutation = useCreateHSNTax();
    const updateMutation = useUpdateHSNTax();
    const deleteMutation = useDeleteHSNTax();

    const [isLoading, setIsLoading] = useState(false);

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<HSNTaxData>(EMPTY_FORM);
    const [editId, setEditId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    // Table search state
    const [tableSearchTerm, setTableSearchTerm] = useState("");

    /* -------------------- SELECT OPTIONS -------------------- */
    // Transform HSN to SelectItem format
    const hsnItems: SelectItem[] = useMemo(() => {
        return hsnList
            .filter((h: any) => h.ACTIVE === "Y")
            .map((hsn: any) => ({
                label: `${hsn.HSNCODE} - ${hsn.HSNDESCRIPTION}`,
                value: hsn.HSNCODE,
            }));
    }, [hsnList]);

    // Group taxes by type for better organization
    const taxesByType = useMemo(() => {
        const grouped: Record<string, any[]> = {
            SG: [],
            CG: [],
            IG: [],
            OT: []
        };

        taxes.forEach((tax: any) => {
            if (grouped[tax.TAXTYPE]) {
                grouped[tax.TAXTYPE].push(tax);
            }
        });

        return grouped;
    }, [taxes]);

    // Create tax items for each type
    const taxItemsByType = useMemo(() => {
        const items: Record<string, SelectItem[]> = {};
        Object.keys(taxesByType).forEach(type => {
            items[type] = taxesByType[type].map((tax: any) => ({
                label: `${tax.TAXNAME} (${tax.TAXPER}%)`,
                value: tax.TAXCODE.toString(),
                percentage: tax.TAXPER,
                taxcode: tax.TAXCODE
            }));
        });
        return items;
    }, [taxesByType, form.HSNCODE]); // <-- recompute when HSN changes

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editId) {
            const dataToEdit = hsnTaxList.find(
                (item: HSNTaxData) => item.HSNTAXCODE === editId
            );
            if (dataToEdit) {
                // Create a clean copy of the data to edit
                const editData = {
                    ...dataToEdit,
                    BELOWSALESAMOUNT: Number(dataToEdit.BELOWSALESAMOUNT) || 0,
                    BELOWSGSTTAXCODE: Number(dataToEdit.BELOWSGSTTAXCODE) || 0,
                    BELOWCGSTTAXCODE: Number(dataToEdit.BELOWCGSTTAXCODE) || 0,
                    BELOWIGSTTAXCODE: Number(dataToEdit.BELOWIGSTTAXCODE) || 0,
                    BELOWSRVTAXCODE: Number(dataToEdit.BELOWSRVTAXCODE) || 0,
                    ABOVESGSTTAXCODE: Number(dataToEdit.ABOVESGSTTAXCODE) || 0,
                    ABOVECGSTTAXCODE: Number(dataToEdit.ABOVECGSTTAXCODE) || 0,
                    ABOVEIGSTTAXCODE: Number(dataToEdit.ABOVEIGSTTAXCODE) || 0,
                    ABOVESRVTAXCODE: Number(dataToEdit.ABOVESRVTAXCODE) || 0,
                };
                setForm(editData);
                toastLoaded("HSN Tax Data");
                ScrollToTop();
            }
        } else {
            // Reset form when editId is null
            setForm(EMPTY_FORM);
        }
    }, [editId, hsnTaxList]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    // Filtered data based on table search
    const filteredData = useMemo(() => {
        if (!tableSearchTerm.trim()) return hsnTaxList;

        return hsnTaxList.filter((item: HSNTaxData) =>
            item.HSNCODE?.toLowerCase().includes(tableSearchTerm.toLowerCase())
        );
    }, [hsnTaxList, tableSearchTerm]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof HSNTaxData, value: any) => {
        // Convert string values to numbers for tax code fields
        if (field.includes('TAXCODE')) {
            setForm((prev) => ({ ...prev, [field]: value ? Number(value) : 0 }));
        } else if (field === 'BELOWSALESAMOUNT') {
            setForm((prev) => ({ ...prev, [field]: value ? Number(value) : 0 }));
        } else {
            setForm((prev) => ({ ...prev, [field]: value }));
        }
    };

    const resetForm = useCallback(() => {
        setEditId(null);
        setForm(EMPTY_FORM);
        // Clear any focus
        if (hsnRef.current) {
            hsnRef.current.focus();
        }
    }, []);

    const clearTableSearch = () => {
        setTableSearchTerm("");
    };

    const validateForm = () => {
        if (!form.HSNCODE) {
            toastError("Please select HSN code");
            hsnRef.current?.focus();
            return false;
        }
        if (form.BELOWSALESAMOUNT <= 0) {
            toastError("Below sales amount must be greater than 0");
            salesAmountRef.current?.focus();
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            // Prepare payload with proper number conversion
            const payload = {
                HSNCODE: form.HSNCODE,
                BELOWSALESAMOUNT: Number(form.BELOWSALESAMOUNT) || 0,
                BELOWSGSTTAXCODE: Number(form.BELOWSGSTTAXCODE) || 0,
                BELOWCGSTTAXCODE: Number(form.BELOWCGSTTAXCODE) || 0,
                BELOWIGSTTAXCODE: Number(form.BELOWIGSTTAXCODE) || 0,
                BELOWSRVTAXCODE: Number(form.BELOWSRVTAXCODE) || 0,
                ABOVESGSTTAXCODE: Number(form.ABOVESGSTTAXCODE) || 0,
                ABOVECGSTTAXCODE: Number(form.ABOVECGSTTAXCODE) || 0,
                ABOVEIGSTTAXCODE: Number(form.ABOVEIGSTTAXCODE) || 0,
                ABOVESRVTAXCODE: Number(form.ABOVESRVTAXCODE) || 0,
            };

            if (editId !== null) {
                // UPDATE
                await updateMutation.mutateAsync({ ...payload, HSNTAXCODE: editId });
                await taxRefetch(); // <-- refresh the taxes
                await hsnTaxRefetch();

                toaster.success({
                    title: "Success",
                    description: "HSN Tax updated successfully",
                });

                setHighlightedId(editId);
            } else {
                // CREATE
                await createMutation.mutateAsync(payload);
                await taxRefetch(); // <-- important
                await hsnTaxRefetch();

                toaster.success({
                    title: "Success",
                    description: "HSN Tax created successfully",
                });
            }

            await hsnTaxRefetch();
            resetForm();

        } catch (error: any) {
            console.error("Save error:", error);
            toaster.error({
                title: "Error",
                description: error?.message || "Operation failed",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: HSNTaxData) => {
        // Ensure all numeric values are properly converted
        const editData = {
            ...item,
            BELOWSALESAMOUNT: Number(item.BELOWSALESAMOUNT) || 0,
            BELOWSGSTTAXCODE: Number(item.BELOWSGSTTAXCODE) || 0,
            BELOWCGSTTAXCODE: Number(item.BELOWCGSTTAXCODE) || 0,
            BELOWIGSTTAXCODE: Number(item.BELOWIGSTTAXCODE) || 0,
            BELOWSRVTAXCODE: Number(item.BELOWSRVTAXCODE) || 0,
            ABOVESGSTTAXCODE: Number(item.ABOVESGSTTAXCODE) || 0,
            ABOVECGSTTAXCODE: Number(item.ABOVECGSTTAXCODE) || 0,
            ABOVEIGSTTAXCODE: Number(item.ABOVEIGSTTAXCODE) || 0,
            ABOVESRVTAXCODE: Number(item.ABOVESRVTAXCODE) || 0,
        };

        setEditId(item.HSNTAXCODE!);
        setForm(editData);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this HSN Tax?")) {
            try {
                setIsLoading(true);
                await deleteMutation.mutateAsync(id);

                toaster.success({
                    title: "Success",
                    description: "HSN Tax deleted successfully"
                });
                await hsnTaxRefetch();

                if (editId === id) {
                    resetForm();
                }
            } catch (error: any) {
                console.error("Delete error:", error);
                toaster.error({
                    title: "Error",
                    description: error?.message || "Delete failed"
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    /* -------------------- TABLE COLUMNS -------------------- */
    const columns = [
        { key: 'SNO', label: 'S.No' },
        { key: 'HSNCODE', label: 'HSN Code' },
        { key: 'HSNDESCRIPTION', label: 'Description' },
        { key: 'BELOWSALESAMOUNT', label: 'Below Sales Amt' },
        { key: 'BELOWTAXES', label: 'Below GST (%)' },
        { key: 'ABOVETAXES', label: 'Above GST (%)' },
        { key: 'CREATEDDATE', label: 'Created Date' },
        { key: 'actions', label: 'Actions' },
    ];

    // Helper function to get tax percentage by tax code
    const getTaxPercentage = useCallback((taxCode: number): number => {
        if (!taxCode || taxCode === 0) return 0;
        const tax = taxes.find((t: any) => t.TAXCODE === taxCode);
        return tax?.TAXPER || 0;
    }, [taxes]);

    // Enrich data with HSN description and tax percentages
    const enrichedData = useMemo(() => {
        return filteredData.map((item: HSNTaxData) => {
            const hsn = hsnList.find((h: any) => h.HSNCODE === item.HSNCODE);
            return {
                ...item,
                HSNDESCRIPTION: hsn?.HSNDESCRIPTION || 'N/A',
                // Add percentage values for display
                BELOWSGSTPER: getTaxPercentage(item.BELOWSGSTTAXCODE),
                BELOWCGSTPER: getTaxPercentage(item.BELOWCGSTTAXCODE),
                BELOWIGSTPER: getTaxPercentage(item.BELOWIGSTTAXCODE),
                BELOWSRVPER: getTaxPercentage(item.BELOWSRVTAXCODE),
                ABOVESGSTPER: getTaxPercentage(item.ABOVESGSTTAXCODE),
                ABOVECGSTPER: getTaxPercentage(item.ABOVECGSTTAXCODE),
                ABOVEIGSTPER: getTaxPercentage(item.ABOVEIGSTTAXCODE),
                ABOVESRVPER: getTaxPercentage(item.ABOVESRVTAXCODE),
            };
        });
    }, [filteredData, hsnList, getTaxPercentage]);

    /* -------------------- FORMAT HELPERS -------------------- */
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(enrichedData);
        setColumns([
            { key: "HSNCODE", label: "HSN Code" },
            { key: "HSNDESCRIPTION", label: "Description" },
            { key: "BELOWSALESAMOUNT", label: "Below Sales Amount" },
            { key: "BELOWTAXES", label: "Below GST (%)" },
            { key: "ABOVETAXES", label: "Above GST (%)" },
        ]);
        setShowSno(true);
        title?.("HSN Tax Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- UI -------------------- */
    return (
        <Box
            fontWeight="semibold"
            bg={theme.colors.primary}
            color={theme.colors.secondary}
            p={2}
        >
            <Toaster />

            {/* ---------------- FORM ---------------- */}
            <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef" mb={4}>
                <Text fontSize="small" fontWeight="600">
                    HSN TAX MASTER
                </Text>

                <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={4} width="100%">
                    {/* Left Column - HSN and Sales Amount */}
                    <GridItem>
                        <Card.Root border="1px solid #eef" bg={theme.colors.primary}>
                            <Card.Header pb={2}>
                                <Text fontSize="xs" fontWeight="600">HSN DETAILS</Text>
                            </Card.Header>
                            <Card.Body>
                                <VStack gap={3}>
                                    {/* HSN Selection */}
                                    <Box width="100%">
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="100px" fontSize="2xs">HSN CODE :</Box>
                                            <Box flex={1}>
                                                <SelectCombobox
                                                    ref={hsnRef}
                                                    value={form.HSNCODE || ""}
                                                    onChange={(value) => handleChange("HSNCODE", value)}
                                                    items={hsnItems}
                                                    placeholder="Select HSN code"
                                                    disable={!!editId}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Below Sales Amount */}
                                    <Box width="100%" display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">SALES AMOUNT :</Box>
                                        <Input
                                            ref={salesAmountRef}
                                            type="number"
                                            value={form.BELOWSALESAMOUNT || ""}
                                            onChange={(e) => handleChange("BELOWSALESAMOUNT", parseFloat(e.target.value) || 0)}
                                            size="2xs"
                                            placeholder="Enter sales amount"
                                            min="0"
                                            step="1000"
                                            css={{
                                                backgroundColor: "#eee",
                                                color: "#111827",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "20px",
                                                height: "30px",
                                                fontSize: "10px",
                                                width: "150px",
                                                padding: "0 10px",
                                            }}
                                        />
                                    </Box>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </GridItem>

                    {/* Right Column - Tax Sections */}
                    <GridItem>
                        <Grid templateColumns="1fr 1fr" gap={3}>
                            {/* Below GST Section */}
                            <GridItem>
                                <Card.Root border="1px solid #eef" bg={theme.colors.primary}>
                                    <Card.Header pb={2} bg="blue.50">
                                        <Text fontSize="xs" fontWeight="600" color="blue.800">BELOW GST</Text>
                                    </Card.Header>
                                    <Card.Body>
                                        <VStack gap={2}>
                                            {["SG", "CG", "IG", "OT"].map((type) => {
                                                const refMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
                                                    SG: belowSgstRef,
                                                    CG: belowCgstRef,
                                                    IG: belowIgstRef,
                                                    OT: belowSrvRef,
                                                };
                                                const fieldMap: Record<string, keyof HSNTaxData> = {
                                                    SG: "BELOWSGSTTAXCODE",
                                                    CG: "BELOWCGSTTAXCODE",
                                                    IG: "BELOWIGSTTAXCODE",
                                                    OT: "BELOWSRVTAXCODE",
                                                };

                                                return (
                                                    <Box display="flex" alignItems="center" gap={2} width="100%" key={type}>
                                                        <Box minW="70px" fontSize="2xs">
                                                            {type === "SG"
                                                                ? "SGST :"
                                                                : type === "CG"
                                                                    ? "CGST :"
                                                                    : type === "IG"
                                                                        ? "IGST :"
                                                                        : "SERVICE :"}
                                                        </Box>

                                                        <SelectCombobox
                                                            ref={refMap[type]}
                                                            value={form[fieldMap[type]]?.toString() || ""}
                                                            onChange={(val) => handleChange(fieldMap[type], val)}
                                                            items={taxItemsByType[type] || []}
                                                            placeholder={`Select ${type} tax`}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            </GridItem>

                            {/* Above GST Section */}
                            <GridItem>
                                <Card.Root border="1px solid #eef" bg={theme.colors.primary}>
                                    <Card.Header pb={2} bg="green.50">
                                        <Text fontSize="xs" fontWeight="600" color="green.800">ABOVE GST</Text>
                                    </Card.Header>
                                    <Card.Body>
                                        <VStack gap={2}>
                                            {["SG", "CG", "IG", "OT"].map((type) => {
                                                const refMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
                                                    SG: aboveSgstRef,
                                                    CG: aboveCgstRef,
                                                    IG: aboveIgstRef,
                                                    OT: aboveSrvRef,
                                                };
                                                const fieldMap: Record<string, keyof HSNTaxData> = {
                                                    SG: "ABOVESGSTTAXCODE",
                                                    CG: "ABOVECGSTTAXCODE",
                                                    IG: "ABOVEIGSTTAXCODE",
                                                    OT: "ABOVESRVTAXCODE",
                                                };

                                                return (
                                                    <Box display="flex" alignItems="center" gap={2} width="100%" key={type}>
                                                        <Box minW="70px" fontSize="2xs">
                                                            {type === "SG"
                                                                ? "SGST :"
                                                                : type === "CG"
                                                                    ? "CGST :"
                                                                    : type === "IG"
                                                                        ? "IGST :"
                                                                        : "SERVICE :"}
                                                        </Box>

                                                        <SelectCombobox
                                                            ref={refMap[type]}
                                                            value={form[fieldMap[type]]?.toString() || ""}
                                                            onChange={(val) => handleChange(fieldMap[type], val)}
                                                            items={taxItemsByType[type] || []}
                                                            placeholder={`Select ${type} tax`}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            </GridItem>
                        </Grid>
                    </GridItem>
                </Grid>

                <HStack width="100%" pt={2} justifyContent="flex-end">
                    <Button
                        ref={saveRef}
                        size="xs"
                        colorPalette="blue"
                        loading={isLoading || createMutation.isPending || updateMutation.isPending}
                        onClick={handleSave}
                    >
                        <AiOutlineSave /> {editId ? "UPDATE" : "SAVE"}
                    </Button>
                    <Button size="xs" colorPalette="blue" onClick={resetForm}>
                        <IoIosExit /> CLEAR
                    </Button>
                </HStack>
            </VStack>

            {/* ---------------- TABLE WITH SEARCH ---------------- */}
            <Box bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                <Box display='flex' mb={2} gap={2} justifyContent='space-between' alignItems='center'>
                    <Text fontWeight="semibold" fontSize="small">
                        HSN TAX LIST
                    </Text>

                    <Flex gap={2} alignItems="center">
                        {/* Table Search Input */}
                        <Box position="relative" width="250px">
                            <Input
                                value={tableSearchTerm}
                                onChange={(e) => setTableSearchTerm(e.target.value)}
                                placeholder="Search by HSN code..."
                                size="2xs"
                                css={{
                                    backgroundColor: "#fff",
                                    color: "#111827",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "20px",
                                    height: "28px",
                                    fontSize: "10px",
                                    width: "100%",
                                    padding: "0 30px 0 10px",
                                }}
                            />
                            <Box position="absolute" right="8px" top="6px">
                                {tableSearchTerm ? (
                                    <IconButton
                                        aria-label="Clear search"
                                        size="2xs"
                                        variant="ghost"
                                        onClick={clearTableSearch}
                                        css={{ minWidth: "auto", height: "auto" }}
                                    >
                                        <FaTimes size={12} color="#666" />
                                    </IconButton>
                                ) : (
                                    <AiOutlineSearch size={14} color="#666" />
                                )}
                            </Box>
                        </Box>

                        <Button
                            variant="ghost"
                            size="xs"
                            color={theme.colors.green}
                            _hover={{ color: "black" }}
                            onClick={() => handleExport("excel")}
                            aria-label="Export Excel"
                        >
                            <FaFileExcel />
                        </Button>

                        <Button
                            variant="ghost"
                            size="xs"
                            color={theme.colors.primaryText}
                            _hover={{ color: "black" }}
                            onClick={() => handleExport("pdf")}
                            aria-label="Export PDF"
                        >
                            <FaPrint />
                        </Button>
                    </Flex>
                </Box>

                {/* Search Results Summary */}
                {tableSearchTerm && (
                    <Box mb={2} fontSize="2xs" color="gray.600">
                        Found {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'} for "{tableSearchTerm}"
                    </Box>
                )}

                <CustomTable
                    columns={columns}
                    data={enrichedData}
                    isLoading={isApiLoading || isLoading}
                    renderRow={(item: any, index: number) => (
                        <>
                            <Table.Cell>{index + 1}</Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette="blue" fontSize="2xs">
                                    {item.HSNCODE}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Text fontSize="2xs">{item.HSNDESCRIPTION}</Text>
                            </Table.Cell>
                            <Table.Cell>
                                <Text fontWeight="bold" color="green.600" fontSize="2xs">
                                    {formatCurrency(item.BELOWSALESAMOUNT)}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>
                                <VStack gap={0.5} align="start">
                                    <Badge colorPalette="blue" fontSize="2xs">
                                        SGST: {item.BELOWSGSTPER}%
                                    </Badge>
                                    <Badge colorPalette="green" fontSize="2xs">
                                        CGST: {item.BELOWCGSTPER}%
                                    </Badge>
                                    <Badge colorPalette="purple" fontSize="2xs">
                                        IGST: {item.BELOWIGSTPER}%
                                    </Badge>
                                    <Badge colorPalette="orange" fontSize="2xs">
                                        SRV: {item.BELOWSRVPER}%
                                    </Badge>
                                </VStack>
                            </Table.Cell>
                            <Table.Cell>
                                <VStack gap={0.5} align="start">
                                    <Badge colorPalette="blue" fontSize="2xs">
                                        SGST: {item.ABOVESGSTPER}%
                                    </Badge>
                                    <Badge colorPalette="green" fontSize="2xs">
                                        CGST: {item.ABOVECGSTPER}%
                                    </Badge>
                                    <Badge colorPalette="purple" fontSize="2xs">
                                        IGST: {item.ABOVEIGSTPER}%
                                    </Badge>
                                    <Badge colorPalette="orange" fontSize="2xs">
                                        SRV: {item.ABOVESRVPER}%
                                    </Badge>
                                </VStack>
                            </Table.Cell>
                            <Table.Cell fontSize="2xs">{formatDate(item.CREATEDDATE)}</Table.Cell>
                            <Table.Cell>
                                <Box display="flex" justifyContent="center" gap={2}>
                                    <FaEdit
                                        onClick={() => handleEdit(item)}
                                        cursor="pointer"
                                        color={theme.colors.primaryText}
                                        size={14}
                                    />
                                    <FaTrash
                                        onClick={() => handleDelete(item.HSNTAXCODE)}
                                        cursor="pointer"
                                        color="red.500"
                                        size={14}
                                    />
                                </Box>
                            </Table.Cell>
                        </>
                    )}
                    headerBg="blue.800"
                    headerColor="white"
                    borderColor="white"
                    bodyBg={theme.colors.primary}
                    highlightRowId={highlightedId ? Number(highlightedId) : null}
                    rowIdKey="HSNTAXCODE"
                    emptyText={tableSearchTerm ? `No results found for "${tableSearchTerm}"` : "No HSN Tax data available"}
                />
            </Box>
        </Box>
    );
}

// Badge component helper
const Badge = ({ children, colorPalette, fontSize, px = 1, py = 0.5, borderRadius = "md" }: any) => {
    const bgColor =
        colorPalette === "green" ? "green.100" :
            colorPalette === "red" ? "red.100" :
                colorPalette === "blue" ? "blue.100" :
                    colorPalette === "purple" ? "purple.100" :
                        colorPalette === "orange" ? "orange.100" : "gray.100";

    const textColor =
        colorPalette === "green" ? "green.800" :
            colorPalette === "red" ? "red.800" :
                colorPalette === "blue" ? "blue.800" :
                    colorPalette === "purple" ? "purple.800" :
                        colorPalette === "orange" ? "orange.800" : "gray.800";

    return (
        <Box
            as="span"
            bg={bgColor}
            color={textColor}
            fontSize={fontSize}
            px={px}
            py={py}
            borderRadius={borderRadius}
            display="inline-block"
            fontWeight="medium"
        >
            {children}
        </Box>
    );
};
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    VStack,
    Text,
    Grid,
    GridItem,
    HStack,
    Fieldset,
    NativeSelect,
    For,
    Flex,
    Input,
    Card,
    Separator,
    Badge,
    IconButton,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave, AiOutlineSearch } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash, FaPlus, FaMinus, FaTimes } from "react-icons/fa";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { toastError, toastLoaded } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/component/form/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

// Types
interface HSN {
    HSNCODE?: number;
    HSNNUMBER: string;
    HSDESCRIPTION: string;
}

interface HSNSalesData {
    id?: number;
    hsnCode: string;
    hsnDescription: string;
    salesAmount: number;
    belowGst: GSTRates;
    aboveGst: GSTRates;
    createdDate?: string;
}

interface GSTRates {
    stateGST: number;    // SGST
    centralGST: number;  // CGST
    interGST: number;    // IGST
    serviceGST: number;  // Service Tax
}

// Mock HSN data for search
const MOCK_HSN_LIST: HSN[] = [
    { HSNCODE: 1, HSNNUMBER: "1001", HSDESCRIPTION: "Live animals" },
    { HSNCODE: 2, HSNNUMBER: "1002", HSDESCRIPTION: "Meat and edible meat offal" },
    { HSNCODE: 3, HSNNUMBER: "1003", HSDESCRIPTION: "Fish and crustaceans" },
    { HSNCODE: 4, HSNNUMBER: "1004", HSDESCRIPTION: "Dairy produce" },
    { HSNCODE: 5, HSNNUMBER: "2001", HSDESCRIPTION: "Vegetables and roots" },
    { HSNCODE: 6, HSNNUMBER: "2002", HSDESCRIPTION: "Edible vegetables" },
    { HSNCODE: 7, HSNNUMBER: "3001", HSDESCRIPTION: "Pharmaceutical products" },
    { HSNCODE: 8, HSNNUMBER: "3002", HSDESCRIPTION: "Human blood" },
    { HSNCODE: 9, HSNNUMBER: "4001", HSDESCRIPTION: "Rubber and articles" },
    { HSNCODE: 10, HSNNUMBER: "4002", HSDESCRIPTION: "Synthetic rubber" },
];

// Mock HSN Tax data
const MOCK_HSNSALES_DATA: HSNSalesData[] = [
    {
        id: 1,
        hsnCode: "1001",
        hsnDescription: "Live animals",
        salesAmount: 50000,
        belowGst: {
            stateGST: 2.5,
            centralGST: 2.5,
            interGST: 5,
            serviceGST: 0,
        },
        aboveGst: {
            stateGST: 6,
            centralGST: 6,
            interGST: 12,
            serviceGST: 0,
        },
        createdDate: "2024-01-15",
    },
    {
        id: 2,
        hsnCode: "1002",
        hsnDescription: "Meat and edible meat offal",
        salesAmount: 75000,
        belowGst: {
            stateGST: 2.5,
            centralGST: 2.5,
            interGST: 5,
            serviceGST: 0,
        },
        aboveGst: {
            stateGST: 6,
            centralGST: 6,
            interGST: 12,
            serviceGST: 0,
        },
        createdDate: "2024-01-15",
    },
    {
        id: 3,
        hsnCode: "3001",
        hsnDescription: "Pharmaceutical products",
        salesAmount: 120000,
        belowGst: {
            stateGST: 6,
            centralGST: 6,
            interGST: 12,
            serviceGST: 0,
        },
        aboveGst: {
            stateGST: 9,
            centralGST: 9,
            interGST: 18,
            serviceGST: 0,
        },
        createdDate: "2024-01-16",
    },
    {
        id: 4,
        hsnCode: "4001",
        hsnDescription: "Rubber and articles",
        salesAmount: 250000,
        belowGst: {
            stateGST: 9,
            centralGST: 9,
            interGST: 18,
            serviceGST: 0,
        },
        aboveGst: {
            stateGST: 14,
            centralGST: 14,
            interGST: 28,
            serviceGST: 0,
        },
        createdDate: "2024-01-16",
    },
    {
        id: 5,
        hsnCode: "2001",
        hsnDescription: "Vegetables and roots",
        salesAmount: 35000,
        belowGst: {
            stateGST: 2.5,
            centralGST: 2.5,
            interGST: 5,
            serviceGST: 0,
        },
        aboveGst: {
            stateGST: 6,
            centralGST: 6,
            interGST: 12,
            serviceGST: 0,
        },
        createdDate: "2024-01-17",
    },
];

export default function HSNTaxMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- STATE -------------------- */
    const [hsnSalesData, setHsnSalesData] = useState<HSNSalesData[]>(MOCK_HSNSALES_DATA);
    const [hsnList] = useState<HSN[]>(MOCK_HSN_LIST);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form search state
    const [formSearchTerm, setFormSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<HSN[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    // Table search state
    const [tableSearchTerm, setTableSearchTerm] = useState("");

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: HSNSalesData = {
        hsnCode: "",
        hsnDescription: "",
        salesAmount: 0,
        belowGst: {
            stateGST: 0,
            centralGST: 0,
            interGST: 0,
            serviceGST: 0,
        },
        aboveGst: {
            stateGST: 0,
            centralGST: 0,
            interGST: 0,
            serviceGST: 0,
        },
    };

    const [form, setForm] = useState<HSNSalesData>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    // Filtered data based on table search
    const filteredData = useMemo(() => {
        if (!tableSearchTerm.trim()) return hsnSalesData;
        
        return hsnSalesData.filter(item => 
            item.hsnCode.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
            item.hsnDescription.toLowerCase().includes(tableSearchTerm.toLowerCase())
        );
    }, [hsnSalesData, tableSearchTerm]);

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editId) {
            const dataToEdit = hsnSalesData.find(
                (data: HSNSalesData) => data.id === editId
            );
            if (dataToEdit) {
                setForm(dataToEdit);
                toastLoaded("HSN Tax Data");
                ScrollToTop();
            }
        }
    }, [editId, hsnSalesData]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    // Form search functionality
    useEffect(() => {
        if (formSearchTerm.trim() === "") {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = hsnList.filter(
            hsn => 
                hsn.HSNNUMBER.toLowerCase().includes(formSearchTerm.toLowerCase()) ||
                hsn.HSDESCRIPTION.toLowerCase().includes(formSearchTerm.toLowerCase())
        );
        setSearchResults(results);
        setShowSearchResults(results.length > 0);
    }, [formSearchTerm, hsnList]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof HSNSalesData, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleGSTChange = (section: 'belowGst' | 'aboveGst', field: keyof GSTRates, value: string) => {
        const numValue = parseFloat(value) || 0;
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: numValue,
            },
        }));
    };

    const selectHSN = (hsn: HSN) => {
        setForm((prev) => ({
            ...prev,
            hsnCode: hsn.HSNNUMBER,
            hsnDescription: hsn.HSDESCRIPTION,
        }));
        setFormSearchTerm("");
        setShowSearchResults(false);
    };

    const resetForm = () => {
        setEditId(null);
        setForm(emptyForm);
        setFormSearchTerm("");
        setShowSearchResults(false);
    };

    const clearTableSearch = () => {
        setTableSearchTerm("");
    };

    const validateForm = () => {
        if (!form.hsnCode?.trim()) {
            toastError("HSN code is required");
            return false;
        }
        if (!form.hsnDescription?.trim()) {
            toastError("HSN description is required");
            return false;
        }
        if (form.salesAmount <= 0) {
            toastError("Sales amount must be greater than 0");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            
            if (editId) {
                // Update existing data
                setHsnSalesData(prev => prev.map(data => 
                    data.id === editId 
                        ? { 
                            ...data, 
                            ...form,
                            id: editId,
                            createdDate: data.createdDate,
                          }
                        : data
                ));

                toaster.success({ 
                    title: "Success", 
                    description: "HSN Tax data updated successfully" 
                });
                setHighlightedId(editId);
            } else {
                // Create new data
                const newData: HSNSalesData = {
                    ...form,
                    id: Math.max(...hsnSalesData.map(d => d.id || 0), 0) + 1,
                    createdDate: new Date().toISOString().split('T')[0],
                };
                setHsnSalesData(prev => [...prev, newData]);

                toaster.success({ 
                    title: "Success", 
                    description: "HSN Tax data created successfully" 
                });
            }
            resetForm();
        } catch (error) {
            console.error("Form submission error:", error);
            toaster.error({ 
                title: "Error", 
                description: "Operation failed" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (data: HSNSalesData) => {
        setEditId(data.id!);
        setForm(data);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this HSN Tax data?")) {
            try {
                setIsLoading(true);
                setHsnSalesData(prev => prev.filter(data => data.id !== id));

                toaster.success({ 
                    title: "Success", 
                    description: "HSN Tax data deleted successfully" 
                });
            } catch (error) {
                console.error("Delete error:", error);
                toaster.error({ 
                    title: "Error", 
                    description: "Delete failed" 
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
        { key: 'DESCRIPTION', label: 'Description' },
        { key: 'SALESAMOUNT', label: 'Sales Amount' },
        { key: 'BELOWGST', label: 'Below GST (%)' },
        { key: 'ABOVEGST', label: 'Above GST (%)' },
        { key: 'CREATEDDATE', label: 'Created Date' },
        { key: 'actions', label: 'Actions' },
    ];

    /* -------------------- FORMAT HELPERS -------------------- */
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatGSTRates = (gst: GSTRates) => {
        return `S:${gst.stateGST}% C:${gst.centralGST}% I:${gst.interGST}% Ser:${gst.serviceGST}%`;
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
        setData(filteredData);
        setColumns([
            { key: "hsnCode", label: "HSN Code" },
            { key: "hsnDescription", label: "Description" },
            { key: "salesAmount", label: "Sales Amount" },
            { key: "belowGst", label: "Below GST" },
            { key: "aboveGst", label: "Above GST" },
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

                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4} width="100%">
                    {/* Left Column - HSN Search and Sales Amount */}
                    <GridItem>
                        <Card.Root border="1px solid #eef" bg={theme.colors.primary}>
                            <Card.Header pb={2}>
                                <Text fontSize="xs" fontWeight="600">HSN DETAILS</Text>
                            </Card.Header>
                            <Card.Body>
                                <VStack gap={3}>
                                    {/* HSN Search */}
                                    <Box width="100%" position="relative">
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="100px" fontSize="2xs">SEARCH HSN :</Box>
                                            <Box position="relative" flex={1}>
                                                <Input
                                                    value={formSearchTerm}
                                                    onChange={(e) => setFormSearchTerm(e.target.value)}
                                                    placeholder="Search by HSN code or description"
                                                    size="2xs"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "30px",
                                                        fontSize: "10px",
                                                        width: "100%",
                                                        padding: "0 30px 0 10px",
                                                    }}
                                                />
                                                <Box position="absolute" right="8px" top="6px">
                                                    <AiOutlineSearch size={14} color="#666" />
                                                </Box>
                                            </Box>
                                        </Box>
                                        
                                        {/* Search Results Dropdown */}
                                        {showSearchResults && (
                                            <Box
                                                position="absolute"
                                                top="100%"
                                                left="110px"
                                                right="0"
                                                bg="white"
                                                border="1px solid #eef"
                                                borderRadius="md"
                                                mt={1}
                                                maxH="200px"
                                                overflowY="auto"
                                                zIndex={10}
                                                boxShadow="lg"
                                            >
                                                {searchResults.map((hsn) => (
                                                    <Box
                                                        key={hsn.HSNCODE}
                                                        p={2}
                                                        cursor="pointer"
                                                        _hover={{ bg: "#f5f5f5" }}
                                                        onClick={() => selectHSN(hsn)}
                                                        borderBottom="1px solid #eef"
                                                        fontSize="2xs"
                                                    >
                                                        <Text fontWeight="bold">{hsn.HSNNUMBER}</Text>
                                                        <Text color="gray.600">{hsn.HSDESCRIPTION}</Text>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>

                                    {/* HSN Code Display */}
                                    <Box width="100%" display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">HSN CODE :</Box>
                                        <Input
                                            value={form.hsnCode}
                                            readOnly
                                            size="2xs"
                                            css={{
                                                backgroundColor: "#f5f5f5",
                                                color: "#111827",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "20px",
                                                height: "30px",
                                                fontSize: "10px",
                                                width: "200px",
                                                padding: "0 10px",
                                            }}
                                        />
                                    </Box>

                                    {/* HSN Description */}
                                    <Box width="100%" display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">DESCRIPTION :</Box>
                                        <Input
                                            value={form.hsnDescription}
                                            readOnly
                                            size="2xs"
                                            css={{
                                                backgroundColor: "#f5f5f5",
                                                color: "#111827",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "20px",
                                                height: "30px",
                                                fontSize: "10px",
                                                width: "300px",
                                                padding: "0 10px",
                                            }}
                                        />
                                    </Box>

                                    {/* Sales Amount */}
                                    <Box width="100%" display="flex" alignItems="center" gap={2} mt={2}>
                                        <Box minW="100px" fontSize="2xs">SALES AMOUNT :</Box>
                                        <Input
                                            type="number"
                                            value={form.salesAmount || ""}
                                            onChange={(e) => handleChange("salesAmount", parseFloat(e.target.value) || 0)}
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
                                                width: "200px",
                                                padding: "0 10px",
                                            }}
                                        />
                                    </Box>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </GridItem>

                    {/* Right Column - GST Sections */}
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
                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">State GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.belowGst.stateGST || ""}
                                                    onChange={(e) => handleGSTChange('belowGst', 'stateGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">Central GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.belowGst.centralGST || ""}
                                                    onChange={(e) => handleGSTChange('belowGst', 'centralGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">Inter GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.belowGst.interGST || ""}
                                                    onChange={(e) => handleGSTChange('belowGst', 'interGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">Service GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.belowGst.serviceGST || ""}
                                                    onChange={(e) => handleGSTChange('belowGst', 'serviceGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>
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
                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">State GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.aboveGst.stateGST || ""}
                                                    onChange={(e) => handleGSTChange('aboveGst', 'stateGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">Central GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.aboveGst.centralGST || ""}
                                                    onChange={(e) => handleGSTChange('aboveGst', 'centralGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">Inter GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.aboveGst.interGST || ""}
                                                    onChange={(e) => handleGSTChange('aboveGst', 'interGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Box minW="70px" fontSize="2xs">Service GST :</Box>
                                                <Input
                                                    type="number"
                                                    value={form.aboveGst.serviceGST || ""}
                                                    onChange={(e) => handleGSTChange('aboveGst', 'serviceGST', e.target.value)}
                                                    size="2xs"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    width="80px"
                                                    css={{
                                                        backgroundColor: "#eee",
                                                        color: "#111827",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "20px",
                                                        height: "25px",
                                                        fontSize: "10px",
                                                        padding: "0 8px",
                                                    }}
                                                />
                                                <Text fontSize="2xs">%</Text>
                                            </Box>
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            </GridItem>
                        </Grid>
                    </GridItem>
                </Grid>

                <HStack width="100%" pt={2} justifyContent="flex-end">
                    <Button
                        size="xs"
                        colorPalette="blue"
                        loading={isLoading}
                        onClick={handleSave}
                    >
                        <AiOutlineSave /> {editId ? "Update" : "Save"}
                    </Button>
                    <Button size="xs" colorPalette="blue" onClick={resetForm}>
                        <IoIosExit /> Exit
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
                                placeholder="Search by HSN code or description..."
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
                    data={filteredData}
                    isLoading={isLoading}
                    renderRow={(item: HSNSalesData, index: number) => (
                        <>
                            <Table.Cell>{index + 1}</Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette="blue" fontSize="2xs">
                                    {item.hsnCode}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Text maxW="200px" whiteSpace="normal" wordBreak="break-word" fontSize="2xs">
                                    {item.hsnDescription}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>
                                <Text fontWeight="bold" color="green.600" fontSize="2xs">
                                    {formatCurrency(item.salesAmount)}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>
                                <VStack gap={0.5} align="start">
                                    <Badge colorPalette="blue" fontSize="2xs">S:{item.belowGst.stateGST}%</Badge>
                                    <Badge colorPalette="green" fontSize="2xs">C:{item.belowGst.centralGST}%</Badge>
                                    <Badge colorPalette="purple" fontSize="2xs">I:{item.belowGst.interGST}%</Badge>
                                    <Badge colorPalette="orange" fontSize="2xs">Ser:{item.belowGst.serviceGST}%</Badge>
                                </VStack>
                            </Table.Cell>
                            <Table.Cell>
                                <VStack gap={0.5} align="start">
                                    <Badge colorPalette="blue" fontSize="2xs">S:{item.aboveGst.stateGST}%</Badge>
                                    <Badge colorPalette="green" fontSize="2xs">C:{item.aboveGst.centralGST}%</Badge>
                                    <Badge colorPalette="purple" fontSize="2xs">I:{item.aboveGst.interGST}%</Badge>
                                    <Badge colorPalette="orange" fontSize="2xs">Ser:{item.aboveGst.serviceGST}%</Badge>
                                </VStack>
                            </Table.Cell>
                            <Table.Cell fontSize="2xs">{formatDate(item.createdDate)}</Table.Cell>
                            <Table.Cell>
                                <Box display="flex" justifyContent="center" gap={2}>
                                    <FaEdit 
                                        onClick={() => handleEdit(item)} 
                                        cursor="pointer"
                                        color={theme.colors.primaryText}
                                        size={14}
                                    />
                                    <FaTrash 
                                        onClick={() => handleDelete(item.id!)} 
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
                    rowIdKey="id"
                    emptyText={tableSearchTerm ? `No results found for "${tableSearchTerm}"` : "No HSN Tax data available"}
                />
            </Box>
        </Box>
    );
}
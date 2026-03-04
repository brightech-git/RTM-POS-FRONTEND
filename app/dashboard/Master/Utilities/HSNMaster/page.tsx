"use client";

import React, { useState, useEffect } from "react";
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
    Textarea,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
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
    ACTIVE: "Y" | "N";
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

interface CreateHSNPayload {
    HSNNUMBER: string;
    HSDESCRIPTION: string;
    ACTIVE: "Y" | "N";
}

// Mock data for development
const MOCK_HSN: HSN[] = [
    {
        HSNCODE: 1,
        HSNNUMBER: "1001",
        HSDESCRIPTION: "Live animals",
        ACTIVE: "Y",
        CREATEDDATE: "2024-01-15",
        CREATEDTIME: "10:30:00"
    },
    {
        HSNCODE: 2,
        HSNNUMBER: "1002",
        HSDESCRIPTION: "Meat and edible meat offal",
        ACTIVE: "Y",
        CREATEDDATE: "2024-01-15",
        CREATEDTIME: "11:45:00"
    },
    {
        HSNCODE: 3,
        HSNNUMBER: "1003",
        HSDESCRIPTION: "Fish and crustaceans, molluscs and other aquatic invertebrates",
        ACTIVE: "Y",
        CREATEDDATE: "2024-01-16",
        CREATEDTIME: "09:15:00"
    },
    {
        HSNCODE: 4,
        HSNNUMBER: "1004",
        HSDESCRIPTION: "Dairy produce; birds' eggs; natural honey; edible products of animal origin",
        ACTIVE: "N",
        CREATEDDATE: "2024-01-16",
        CREATEDTIME: "14:20:00"
    },
    {
        HSNCODE: 5,
        HSNNUMBER: "1005",
        HSDESCRIPTION: "Products of animal origin",
        ACTIVE: "Y",
        CREATEDDATE: "2024-01-17",
        CREATEDTIME: "16:00:00"
    },
    {
        HSNCODE: 6,
        HSNNUMBER: "2001",
        HSDESCRIPTION: "Vegetables and certain roots and tubers",
        ACTIVE: "Y",
        CREATEDDATE: "2024-01-18",
        CREATEDTIME: "10:00:00"
    },
    {
        HSNCODE: 7,
        HSNNUMBER: "2002",
        HSDESCRIPTION: "Edible vegetables and certain roots and tubers",
        ACTIVE: "Y",
        CREATEDDATE: "2024-01-18",
        CREATEDTIME: "11:30:00"
    }
];

export default function HSNMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS (with mock fallback) -------------------- */
    // Mock data state
    const [hsnList, setHsnList] = useState<HSN[]>(MOCK_HSN);
    const [isLoading, setIsLoading] = useState(false);

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: CreateHSNPayload = {
        HSNNUMBER: "",
        HSDESCRIPTION: "",
        ACTIVE: "Y",
    };

    const [form, setForm] = useState<CreateHSNPayload>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    /* -------------------- SELECT OPTIONS -------------------- */
    const activeStatus = [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
    ];

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editId) {
            const hsnToEdit = hsnList.find(
                (hsn: HSN) => hsn.HSNCODE === editId
            );
            if (hsnToEdit) {
                setForm({
                    HSNNUMBER: hsnToEdit.HSNNUMBER,
                    HSDESCRIPTION: hsnToEdit.HSDESCRIPTION,
                    ACTIVE: hsnToEdit.ACTIVE,
                });
                toastLoaded("HSN");
                ScrollToTop();
            }
        }
    }, [editId, hsnList]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof CreateHSNPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm(emptyForm);
    };

    const validateForm = () => {
        if (!form.HSNNUMBER?.trim()) {
            toastError("HSN code is required");
            return false;
        }
        if (form.HSNNUMBER.length > 20) {
            toastError("HSN code must be at most 20 characters");
            return false;
        }
        // Check if HSN code already exists (for new entries)
        if (!editId) {
            const existingHSN = hsnList.find(
                hsn => hsn.HSNNUMBER.toLowerCase() === form.HSNNUMBER.toLowerCase()
            );
            if (existingHSN) {
                toastError("HSN code already exists");
                return false;
            }
        }
        if (!form.HSDESCRIPTION?.trim()) {
            toastError("HSN description is required");
            return false;
        }
        if (form.HSDESCRIPTION.length > 500) {
            toastError("Description must be at most 500 characters");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            
            if (editId) {
                // Update existing HSN
                setHsnList(prev => prev.map(hsn => 
                    hsn.HSNCODE === editId 
                        ? { 
                            ...hsn, 
                            ...form,
                            HSNCODE: editId,
                            CREATEDDATE: hsn.CREATEDDATE,
                            CREATEDTIME: hsn.CREATEDTIME
                          }
                        : hsn
                ));

                toaster.success({ 
                    title: "Success", 
                    description: "HSN updated successfully" 
                });
                setHighlightedId(editId);
            } else {
                // Create new HSN
                const newHSN: HSN = {
                    ...form,
                    HSNCODE: Math.max(...hsnList.map(h => h.HSNCODE || 0), 0) + 1,
                    CREATEDDATE: new Date().toISOString().split('T')[0],
                    CREATEDTIME: new Date().toTimeString().split(' ')[0]
                };
                setHsnList(prev => [...prev, newHSN]);

                toaster.success({ 
                    title: "Success", 
                    description: "HSN created successfully" 
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

    const handleEdit = (hsn: HSN) => {
        setEditId(hsn.HSNCODE!);
    };

    const handleDelete = async (code: number) => {
        if (window.confirm("Are you sure you want to delete this HSN?")) {
            try {
                setIsLoading(true);
                setHsnList(prev => prev.filter(hsn => hsn.HSNCODE !== code));

                toaster.success({ 
                    title: "Success", 
                    description: "HSN deleted successfully" 
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
    const hsnColumns = [
        { key: 'SNO', label: 'S.No' },
        { key: 'HSNNUMBER', label: 'HSN Code' },
        { key: 'HSDESCRIPTION', label: 'Description' },
        { key: 'ACTIVE', label: 'Status' },
        { key: 'actions', label: 'Actions' },
    ];

    /* -------------------- FORMAT HELPERS -------------------- */
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
        setData(hsnList);
        setColumns([
            { key: "HSNNUMBER", label: "HSN Code" },
            { key: "HSDESCRIPTION", label: "Description" },
            { key: "ACTIVE", label: "Status" },
        ]);
        setShowSno(true);
        title?.("HSN Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- UI -------------------- */
    return (
        <Box
            fontWeight="semibold"
            bg={theme.colors.primary}
            color={theme.colors.secondary}
        >
            <Toaster />
            <Grid templateColumns={{ base: "1fr", lg: "500px 1fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            HSN MASTER
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={3} width="100%">
                                    {/* HSN CODE */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">HSN CODE :</Box>
                                        <Input
                                            value={form.HSNNUMBER}
                                            onChange={(e) => handleChange("HSNNUMBER", e.target.value)}
                                            size="2xs"
                                            placeholder="Enter HSN code"
                                            maxLength={20}
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

                                    {/* HSN DESCRIPTION */}
                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                        <Box minW="110px" fontSize="2xs">DESCRIPTION :</Box>
                                        <Textarea
                                            value={form.HSDESCRIPTION}
                                            onChange={(e) => handleChange("HSDESCRIPTION", e.target.value)}
                                            size="xs"
                                            placeholder="Enter HSN description"
                                            maxLength={500}
                                            rows={3}
                                            css={{
                                                backgroundColor: "#eee",
                                                color: "#111827",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "10px",
                                                fontSize: "10px",
                                                width: "300px",
                                                padding: "8px",
                                                resize: "vertical",
                                            }}
                                        />
                                    </Box>

                                    {/* ACTIVE STATUS */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">STATUS :</Box>
                                        <NativeSelect.Root size="xs" maxW="100px" fontSize="2xs">
                                            <NativeSelect.Field
                                                value={form.ACTIVE}
                                                onChange={(e) => handleChange("ACTIVE", e.target.value as "Y" | "N")}
                                                css={{
                                                    backgroundColor: "#eee",
                                                    color: "#111827",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "20px",
                                                    height: "30px",
                                                    fontSize: "10px",
                                                }}
                                            >
                                                <For each={activeStatus}>
                                                    {(item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {item.label}
                                                        </option>
                                                    )}
                                                </For>
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                    </Box>
                                </Grid>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack width="100%" pt={2}>
                            <Button
                                size="xs"
                                colorPalette="blue"
                                loading={isLoading}
                                onClick={handleSave}
                                flex={1}
                            >
                                <AiOutlineSave /> {editId ? "Update" : "Save"}
                            </Button>
                            <Button size="xs" colorPalette="blue" onClick={resetForm} flex={1}>
                                <IoIosExit /> Exit
                            </Button>
                        </HStack>
                    </VStack>
                </GridItem>

                {/* ---------------- TABLE ---------------- */}
                <GridItem minW={0}>
                    <Box bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Box display='flex' mb={2} gap={2} justifyContent='space-between' alignItems='center'>
                            <Text fontWeight="semibold" fontSize="small">
                                HSN LIST
                            </Text>

                            <Flex>
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

                        <CustomTable
                            columns={hsnColumns}
                            data={hsnList}
                            isLoading={isLoading}
                            renderRow={(hsn: HSN, index: number) => (
                                <>
                                    <Table.Cell>{index + 1}</Table.Cell>
                                    <Table.Cell>
                                        <Text fontWeight="medium">{hsn.HSNNUMBER}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text maxW="300px" whiteSpace="normal" wordBreak="break-word">
                                            {hsn.HSDESCRIPTION}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge 
                                            colorPalette={hsn.ACTIVE === "Y" ? "green" : "red"}
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {hsn.ACTIVE === "Y" ? "Active" : "Inactive"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" gap={2}>
                                            <FaEdit 
                                                onClick={() => handleEdit(hsn)} 
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                            />
                                            <FaTrash 
                                                onClick={() => handleDelete(hsn.HSNCODE!)} 
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
                            rowIdKey="HSNCODE"
                            emptyText="No HSN codes available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

// Badge component helper
const Badge = ({ children, colorPalette, fontSize, px, py, borderRadius }: any) => {
    const bgColor = 
        colorPalette === "green" ? "green.100" : 
        colorPalette === "red" ? "red.100" : "gray.100";
    
    const textColor = 
        colorPalette === "green" ? "green.800" : 
        colorPalette === "red" ? "red.800" : "gray.800";
    
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
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
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { toastError, toastLoaded, toastCreated, toastUpdated, toastDeleted } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/component/form/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import {
    useAllTaxes,
    useCreateTax,
    useUpdateTax,
    useDeleteTax,
} from "@/hooks/Tax/useTax";

// Types based on API response
interface GST {
    TAXCODE?: number;
    TAXNAME: string;
    SHOTNAME: string;
    TAXPER: number;
    TAXTYPE: string; // "P" for Percentage, might be other values
  
    CREATEDDATE?: string;
    CREATEDTIME?: string;
    SNO?: number;
}

interface CreateGSTPayload {
    TAXNAME: string;
    SHOTNAME: string;
    TAXPER: number;
    TAXTYPE: string;
}

// Map TAXTYPE to display type


// Map display type to TAXTYPE


export default function GSTMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: taxes, isLoading: isApiLoading, refetch: taxRefetch } = useAllTaxes();
    const createMutation = useCreateTax();
    const updateMutation = useUpdateTax();
    const deleteMutation = useDeleteTax();

    // Transform API data to match our interface
    const gstList = React.useMemo(() => {
        if (!taxes) return [];
        return taxes.map((tax: any) => ({
            ...tax,
            // Ensure we have all required fields
        }));
    }, [taxes]);

    const [isLoading, setIsLoading] = useState(false);

    /* -------------------- FORM STATE -------------------- */
const emptyForm: CreateGSTPayload = {
    TAXNAME: "",
    SHOTNAME: "",
    TAXPER: 0,
    TAXTYPE: "SG",
};
    const [form, setForm] = useState<CreateGSTPayload>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    /* -------------------- SELECT OPTIONS -------------------- */
const gstTypes = [
    { label: "SGST", value: "SG" },
    { label: "CGST", value: "CG" },
    { label: "IGST", value: "IG" },
    { label: "UGST", value: "UG" },
    { label: "OTHER", value: "OT" },
];



    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editId) {
            const gstToEdit = gstList.find(
                (gst: GST) => gst.TAXCODE === editId
            );
            if (gstToEdit) {
                setForm({
                    TAXNAME: gstToEdit.TAXNAME,
                    SHOTNAME: gstToEdit.SHOTNAME,
                    TAXPER: gstToEdit.TAXPER,
                    TAXTYPE: gstToEdit.TAXTYPE,
                });
                toastLoaded("GST");
                ScrollToTop();
            }
        }
    }, [editId, gstList]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof CreateGSTPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm(emptyForm);
    };

    const validateForm = () => {
        if (!form.TAXNAME?.trim()) {
            toastError("GST name is required");
            return false;
        }
        if (form.TAXNAME.length > 100) {
            toastError("GST name must be at most 100 characters");
            return false;
        }
        if (!form.SHOTNAME?.trim()) {
            toastError("Short name is required");
            return false;
        }
        if (form.SHOTNAME.length > 10) {
            toastError("Short name must be at most 10 characters");
            return false;
        }
        
        if (!form.TAXPER || form.TAXPER <= 0) {
            toastError("GST percentage must be greater than 0");
            return false;
        }
        if (form.TAXPER > 100) {
            toastError("GST percentage cannot exceed 100%");
            return false;
        }
        return true;
    };

const handleSave = async () => {
    if (!validateForm()) return;

    try {
        setIsLoading(true);

        const payload = {
            TAXNAME: form.TAXNAME.trim(),
            SHOTNAME: form.SHOTNAME.trim(),
            TAXPER: Number(form.TAXPER),
            TAXTYPE: form.TAXTYPE,
        };

        if (editId) {
            await updateMutation.mutateAsync({
                id: editId,
                payload,
            });

            toaster.success({
                title: "Success",
                description: "GST updated successfully",
            });

            setHighlightedId(editId);
        } else {
            await createMutation.mutateAsync(payload);

            toaster.success({
                title: "Success",
                description: "GST created successfully",
            });
        }

        await taxRefetch();
        resetForm();

    } catch (error: any) {
        toaster.error({
            title: "Error",
            description: error?.message || "Operation failed",
        });
    } finally {
        setIsLoading(false);
    }
};
    const handleEdit = (gst: GST) => {
        setEditId(gst.TAXCODE!);
    };

    const handleDelete = async (code: number) => {
        if (window.confirm("Are you sure you want to delete this GST?")) {
            try {
                setIsLoading(true);
                await deleteMutation.mutateAsync(code);

                toaster.success({ 
                    title: "Success", 
                    description: "GST deleted successfully" 
                });
                await taxRefetch();
            } catch (error: any) {
                console.error("Delete error:", error);
                toaster.error({ 
                    title: "Error", 
                    description: error?.response?.data?.message || "Delete failed" 
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    /* -------------------- TABLE COLUMNS -------------------- */
    const gstColumns = [
        { key: 'SNO', label: 'S.No' },
        { key: 'TAXNAME', label: 'GST Name' },
        { key: 'SHOTNAME', label: 'Short Name' },
        { key: 'TAXPER', label: 'Percentage' },
        { key: 'TAXTYPE', label: 'GST Type' },
        { key: 'CREATEDDATE', label: 'Created Date' },
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

    const formatTime = (timeString?: string) => {
        if (!timeString) return "-";
        return new Date(timeString).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(gstList);
        setColumns([
            { key: "TAXNAME", label: "GST Name" },
            { key: "SHOTNAME", label: "Short Name" },
            { key: "TAXPER", label: "Percentage" },
            { key: "TAXTYPE", label: "GST Type" },
            { key: "CREATEDDATE", label: "Created Date" },
        ]);
        setShowSno(true);
        title?.("GST Master");
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
                            GST MASTER
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={3} width="100%">
                                    {/* GST NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">GST NAME :</Box>
                                        <CapitalizedInput
                                            field="TAXNAME"
                                            value={form.TAXNAME}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                            placeholder="Enter GST name"
                                            max={100}
                                        />
                                    </Box>

                                    {/* SHORT NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">SHORT NAME :</Box>
                                        <CapitalizedInput
                                            field="SHOTNAME"
                                            value={form.SHOTNAME}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                            placeholder="Enter short name"
                                            max={10}
                                        />
                                    </Box>

                                    {/* GST PERCENTAGE */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">PERCENTAGE :</Box>
                                        <Input
                                            type="number"
                                            value={form.TAXPER || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                handleChange("TAXPER", value === "" ? 0 : parseFloat(value));
                                            }}
                                            size="2xs"
                                            placeholder="Enter percentage"
                                            min="0"
                                            max="100"
                                            step="0.01"
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
                                        %
                                    </Box>

                                    {/* GST TYPE - For display purposes only, but sends P to API */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">GST TYPE :</Box>
                                        <NativeSelect.Root size="xs" maxW="150px" fontSize="2xs">
                                           <NativeSelect.Field
    value={form.TAXTYPE}
    onChange={(e) => {
        handleChange("TAXTYPE", e.target.value);
    }}
>
    {gstTypes.map((item) => (
        <option key={item.value} value={item.value}>
            {item.label}
        </option>
    ))}
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
                                loading={isLoading || createMutation.isPending || updateMutation.isPending}
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
                                GST LIST
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
                            columns={gstColumns}
                            data={gstList}
                            isLoading={isApiLoading || isLoading}
                            renderRow={(gst: GST, index: number) => (
                                <>
                                    <Table.Cell>{gst.SNO || index + 1}</Table.Cell>
                                    <Table.Cell>{gst.TAXNAME}</Table.Cell>
                                    <Table.Cell>{gst.SHOTNAME}</Table.Cell>
                                    <Table.Cell>{gst.TAXPER}%</Table.Cell>
                                    <Table.Cell>
                                        <Badge 
                                            colorPalette={
                                                gst.TAXNAME?.includes("SGST") ? "blue" :
                                                gst.TAXNAME?.includes("CGST") ? "green" :
                                                gst.TAXNAME?.includes("IGST") ? "purple" :
                                                gst.TAXNAME?.includes("UGST") ? "orange" : "gray"
                                            }
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {gst.TAXNAME?.includes("SGST") ? "SGST" :
                                             gst.TAXNAME?.includes("CGST") ? "CGST" :
                                             gst.TAXNAME?.includes("IGST") ? "IGST" :
                                             gst.TAXNAME?.includes("UGST") ? "UGST" : "OTHER"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatDate(gst.CREATEDDATE)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" gap={2}>
                                            <FaEdit 
                                                onClick={() => handleEdit(gst)} 
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                            />
                                            <FaTrash 
                                                onClick={() => handleDelete(gst.TAXCODE!)} 
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
                            rowIdKey="TAXCODE"
                            emptyText="No GST available"
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
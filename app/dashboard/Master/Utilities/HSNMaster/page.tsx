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
import { CapitalizedInput } from "@/components/ui/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import {
    useAllHSN,
    useCreateHSN,
    useUpdateHSN,
    useDeleteHSN,
} from "@/hooks/HSN/useHSN";
import { HSN, CreateHSNPayload } from "@/service/HSNService";

export default function HSNMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: hsnList = [], isLoading: isApiLoading, refetch: hsnRefetch } = useAllHSN();
    const createMutation = useCreateHSN();
    const updateMutation = useUpdateHSN();
    const deleteMutation = useDeleteHSN();

    const [isLoading, setIsLoading] = useState(false);

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: CreateHSNPayload = {
        HSNCODE: "",
        HSNDESCRIPTION: "",
        ACTIVE: "Y",
    };

    const [form, setForm] = useState<CreateHSNPayload>(emptyForm);
    const [editCode, setEditCode] = useState<string | null>(null);
    const [highlightedCode, setHighlightedCode] = useState<string | null>(null);

    /* -------------------- SELECT OPTIONS -------------------- */
    const activeStatus = [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
    ];

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editCode) {
            const hsnToEdit = hsnList.find(
                (hsn: HSN) => String(hsn.HSNCODE)=== editCode
            );
            if (hsnToEdit) {
                setForm({
                    HSNCODE: String(hsnToEdit.HSNCODE),
                    HSNDESCRIPTION: hsnToEdit.HSNDESCRIPTION,
                    ACTIVE: hsnToEdit.ACTIVE,
                    
               });
                toastLoaded("HSN");
                ScrollToTop();
            }
        }
    }, [editCode, hsnList]);

    useEffect(() => {
        if (!highlightedCode) return;

        const timer = setTimeout(() => {
            setHighlightedCode(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedCode]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof CreateHSNPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditCode(null);
        setForm(emptyForm);
    };

    const validateForm = () => {
        if (!form.HSNCODE?.trim()) {
            toastError("HSN code is required");
            return false;
        }
        if (form.HSNCODE.length > 20) {
            toastError("HSN code must be at most 20 characters");
            return false;
        }
        // Check if HSN code already exists (for new entries)
        if (!editCode) {
            const existingHSN = hsnList.find(
                (hsn: HSN) =>String(hsn.HSNCODE) === form.HSNCODE.toLowerCase()
            );
            if (existingHSN) {
                toastError("HSN code already exists");
                return false;
            }
        }
        if (!form.HSNDESCRIPTION?.trim()) {
            toastError("HSN description is required");
            return false;
        }
        if (form.HSNDESCRIPTION.length > 500) {
            toastError("Description must be at most 500 characters");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            const payload = {
                HSNCODE: Number(form.HSNCODE.trim()),
                HSNDESCRIPTION: form.HSNDESCRIPTION.trim(),
                ACTIVE: form.ACTIVE,
                
            };

            if (editCode) {
                // UPDATE
                await updateMutation.mutateAsync({
                    code: editCode,
                    payload,
                });

                toaster.success({
                    title: "Success",
                    description: "HSN updated successfully",
                });

                setHighlightedCode(editCode);
            } else {
                // CREATE
                await createMutation.mutateAsync(payload);

                toaster.success({
                    title: "Success",
                    description: "HSN created successfully",
                });
            }

            await hsnRefetch();
            resetForm();

        } catch (error: any) {
            console.error("Form submission error:", error);
            toaster.error({
                title: "Error",
                description: error?.message || "Operation failed",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (hsn: HSN) => {
        setEditCode(String(hsn.HSNCODE));
        setForm({
            HSNCODE: String(hsn.HSNCODE),
            HSNDESCRIPTION: hsn.HSNDESCRIPTION,
            ACTIVE:hsn.ACTIVE
        });
        ScrollToTop();
    };

    const handleDelete = async (code: string) => {
        if (window.confirm("Are you sure you want to delete this HSN?")) {
            try {
                setIsLoading(true);
                await deleteMutation.mutateAsync(code);

                toaster.success({
                    title: "Success",
                    description: "HSN deleted successfully"
                });
                await hsnRefetch();

                if (editCode === code) {
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
    const hsnColumns = [
        { key: 'sno', label: 'S.No' },
        { key: 'code', label: 'HSN Code' },
        { key: 'description', label: 'Description' },
        { key: 'taxPercentage', label: 'Tax %' },
        { key: 'createdDate', label: 'Created Date' },
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
            { key: "code", label: "HSN Code" },
            { key: "description", label: "Description" },
            { key: "taxPercentage", label: "Tax %" },
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
                                            value={form.HSNCODE}
                                            onChange={(e) => handleChange("HSNCODE", e.target.value)}
                                            size="2xs"
                                            placeholder="Enter HSN code"
                                            maxLength={20}

                                            css={{
                                                backgroundColor: editCode ? "#f5f5f5" : "#eee",
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
                                            value={form.HSNDESCRIPTION}
                                            onChange={(e) => handleChange("HSNDESCRIPTION", e.target.value)}
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
                                                {activeStatus.map((item) => (
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
                                <AiOutlineSave /> {editCode ? "Update" : "Save"}
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
                            isLoading={isApiLoading || isLoading}
                            renderRow={(hsn: HSN, index: number) => (
                                <>
                                    <Table.Cell>{hsn.SNO || index + 1}</Table.Cell>
                                    <Table.Cell>
                                        <Text fontWeight="medium">{hsn.HSNCODE}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text maxW="300px" whiteSpace="normal" wordBreak="break-word">
                                            {hsn.HSNDESCRIPTION}
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
                                        {formatDate(hsn.CREATEDDATE)}
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
                                                onClick={() => handleDelete(String(hsn.HSNCODE))} 
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
                            highlightRowId={highlightedCode ? highlightedCode : null}
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
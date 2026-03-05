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
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import {
    useAllDesignations,
    useCreateDesignation,
    useUpdateDesignation,
    useDeleteDesignation,
} from "@/hooks/Designation/useDesignation";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { toastError, toastLoaded, toastCreated, toastUpdated, toastDeleted } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/components/ui/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { FaPrint, FaFileExcel } from "react-icons/fa";

// Types
interface Designation {
    DESIGNATIONCODE?: number;
    DESCRIPTION: string;
    ACTIVE: "Y" | "N";
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

interface CreateDesignationPayload {
    DESCRIPTION: string;
    ACTIVE: "Y" | "N";
}

export default function DesignationMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: designations, isLoading, refetch: designationRefetch } = useAllDesignations();
    const createMutation = useCreateDesignation();
    const updateMutation = useUpdateDesignation();
    const deleteMutation = useDeleteDesignation();

    const designationList = designations ?? [];

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: CreateDesignationPayload = {
        DESCRIPTION: "",
        ACTIVE: "Y",
    };

    const [form, setForm] = useState<CreateDesignationPayload>(emptyForm);
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
            const designationToEdit = designationList.find(
                (des: Designation) => des.DESIGNATIONCODE === editId
            );
            if (designationToEdit) {
                setForm({
                    DESCRIPTION: designationToEdit.DESCRIPTION,
                    ACTIVE: designationToEdit.ACTIVE,
                });
                toastLoaded("Designation");
                ScrollToTop();
            }
        }
    }, [editId, designationList]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof CreateDesignationPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm(emptyForm);
    };

    const validateForm = () => {
        if (!form.DESCRIPTION?.trim()) {
            toastError("Description is required");
            return false;
        }
        if (form.DESCRIPTION.length > 50) {
            toastError("Description must be at most 50 characters");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            if (editId) {
                await updateMutation.mutateAsync({
                    DESIGNATIONCODE: editId,
                    ...form,
                });
                toaster.success({
                    title: "Success",
                    description: "Designation updated successfully"
                });
                await designationRefetch();
                setHighlightedId(editId);
            } else {
                await createMutation.mutateAsync(form);
                toaster.success({
                    title: "Success",
                    description: "Designation created successfully"
                });
                await designationRefetch();
            }
            resetForm();
        } catch (error) {
            console.error("Form submission error:", error);
            toaster.error({
                title: "Error",
                description: "Operation failed"
            });
        }
    };

    const handleEdit = (designation: Designation) => {
        setEditId(designation.DESIGNATIONCODE!);
    };

    const handleDelete = async (code: number) => {
        if (window.confirm("Are you sure you want to delete this designation?")) {
            try {
                await deleteMutation.mutateAsync(code);
                toaster.success({
                    title: "Success",
                    description: "Designation deleted successfully"
                });
                await designationRefetch();
            } catch (error) {
                console.error("Delete error:", error);
                toaster.error({
                    title: "Error",
                    description: "Delete failed"
                });
            }
        }
    };

    /* -------------------- TABLE COLUMNS -------------------- */
    const designationColumns = [
        { key: 'SNO', label: 'S.No' },
        { key: 'DESIGNATIONCODE', label: 'Code' },
        { key: 'DESCRIPTION', label: 'Description' },
        { key: 'ACTIVE', label: 'Status' },

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
        return timeString.substring(0, 5); // HH:MM format
    };

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(designationList);
        setColumns([
            { key: "DESIGNATIONCODE", label: "Code" },
            { key: "DESCRIPTION", label: "Description" },
            { key: "ACTIVE", label: "Status" },
            { key: "CREATEDBY", label: "Created By" },
            { key: "CREATEDDATE", label: "Created Date" },
            { key: "CREATEDTIME", label: "Created Time" },
        ]);
        setShowSno(true);
        title?.("Designation Master");
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
            <Grid templateColumns={{ base: "1fr", lg: "400px 1fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            DESIGNATION MASTER
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={3} width="100%">
                                    {/* DESCRIPTION */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">DESCRIPTION :</Box>
                                        <CapitalizedInput
                                            field="DESCRIPTION"
                                            value={form.DESCRIPTION}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                            placeholder="Enter designation description"
                                            max={50}
                                        />
                                    </Box>

                                    {/* ACTIVE STATUS */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">STATUS :</Box>
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
                                loading={createMutation.isPending || updateMutation.isPending}
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
                                DESIGNATION LIST
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
                            columns={designationColumns}
                            data={designationList}
                            isLoading={isLoading}
                            renderRow={(designation: Designation, index: number) => (
                                <>
                                    <Table.Cell>{index + 1}</Table.Cell>
                                    <Table.Cell>{designation.DESIGNATIONCODE}</Table.Cell>
                                    <Table.Cell>{designation.DESCRIPTION}</Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            colorPalette={designation.ACTIVE === "Y" ? "green" : "red"}
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {designation.ACTIVE === "Y" ? "Active" : "Inactive"}
                                        </Badge>
                                    </Table.Cell>

                                    <Table.Cell>{formatDate(designation.CREATEDDATE)}</Table.Cell>

                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" gap={2}>
                                            <FaEdit
                                                onClick={() => handleEdit(designation)}
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                            />
                                            {/* <FaTrash 
                                                onClick={() => handleDelete(designation.DESIGNATIONCODE!)} 
                                                cursor="pointer"
                                                color="red.500"
                                                size={14}
                                            /> */}
                                        </Box>
                                    </Table.Cell>
                                </>
                            )}
                            headerBg="blue.800"
                            headerColor="white"
                            borderColor="white"
                            bodyBg={theme.colors.primary}
                            highlightRowId={highlightedId ? Number(highlightedId) : null}
                            rowIdKey="DESIGNATIONCODE"
                            emptyText="No designations available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

// Badge component helper
const Badge = ({ children, colorPalette, fontSize, px, py, borderRadius }: any) => {
    const bgColor = colorPalette === "green" ? "green.100" : "red.100";
    const textColor = colorPalette === "green" ? "green.800" : "red.800";

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
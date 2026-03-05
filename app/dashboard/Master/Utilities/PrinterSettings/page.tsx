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
import { toastError, toastLoaded } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/component/form/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import {
    useAllPrinters,
    useCreatePrinter,
    useUpdatePrinter,
    useDeletePrinter,
} from "@/hooks/PrinterSettings/usePrinterSettings";

// Types based on API response
interface Printer {
    IPID?: number;
    PRINTCODE?: number;
    PRINTERNAME: string;
    IPADDRESS: string;
    EXENAME: string;
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

interface CreatePrinterPayload {
    IPADDRESS: string;
    IPID: number;
    PRINTERNAME: string;
    EXENAME: string;
}

export default function PrinterSettingsMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: printers = [], isLoading: isApiLoading, refetch: printerRefetch } = useAllPrinters();
    const createMutation = useCreatePrinter();
    const updateMutation = useUpdatePrinter();
    const deleteMutation = useDeletePrinter();

    const [isLoading, setIsLoading] = useState(false);

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: CreatePrinterPayload = {
        IPADDRESS: "",
        IPID: 0,
        PRINTERNAME: "",
        EXENAME: "",
    };

    const [form, setForm] = useState<CreatePrinterPayload>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editId) {
            const printerToEdit = printers.find(
                (printer: Printer) => printer.PRINTCODE === editId
            );
            if (printerToEdit) {
                setForm({
                    IPADDRESS: printerToEdit.IPADDRESS,
                    IPID: printerToEdit.IPID || 0,
                    PRINTERNAME: printerToEdit.PRINTERNAME,
                    EXENAME: printerToEdit.EXENAME,
                });
                toastLoaded("Printer");
                ScrollToTop();
            }
        }
    }, [editId, printers]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof CreatePrinterPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm(emptyForm);
    };

    const validateForm = () => {
        if (!form.IPADDRESS?.trim()) {
            toastError("IP Address is required");
            return false;
        }
        // Simple IP validation pattern
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipPattern.test(form.IPADDRESS)) {
            toastError("Please enter a valid IP address");
            return false;
        }
        if (!form.IPID || form.IPID <= 0) {
            toastError("IP ID must be greater than 0");
            return false;
        }
        if (!form.PRINTERNAME?.trim()) {
            toastError("Printer name is required");
            return false;
        }
        if (form.PRINTERNAME.length > 100) {
            toastError("Printer name must be at most 100 characters");
            return false;
        }
        if (!form.EXENAME?.trim()) {
            toastError("Executable name is required");
            return false;
        }
        if (form.EXENAME.length > 100) {
            toastError("Executable name must be at most 100 characters");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            const payload = {
                IPADDRESS: form.IPADDRESS.trim(),
                IPID: Number(form.IPID),
                PRINTERNAME: form.PRINTERNAME.trim(),
                EXENAME: form.EXENAME.trim(),
            };

            console.log("Saving payload:", payload);

            if (editId !== null) {
                // UPDATE
                await updateMutation.mutateAsync({
                    id: editId,
                    payload: {
                        ...payload,
                        PRINTCODE: editId,
                    },
                });

                toaster.success({
                    title: "Success",
                    description: "Printer updated successfully",
                });

                setHighlightedId(editId);
            } else {
                // CREATE
                await createMutation.mutateAsync(payload);

                toaster.success({
                    title: "Success",
                    description: "Printer created successfully",
                });
            }

            await printerRefetch();
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

    const handleEdit = (printer: Printer) => {
        if (printer.PRINTCODE === undefined || printer.PRINTCODE === null) return;
        setEditId(printer.PRINTCODE);
        setForm({
            IPADDRESS: printer.IPADDRESS,
            IPID: printer.IPID || 0,
            PRINTERNAME: printer.PRINTERNAME,
            EXENAME: printer.EXENAME,
        });
        ScrollToTop();
    };

    const handleDelete = async (code: number) => {
        if (window.confirm("Are you sure you want to delete this printer?")) {
            try {
                setIsLoading(true);
                await deleteMutation.mutateAsync(code);

                toaster.success({ 
                    title: "Success", 
                    description: "Printer deleted successfully" 
                });
                await printerRefetch();
                
                if (editId === code) {
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
    const printerColumns = [
        { key: 'SNO', label: 'S.No' },
        { key: 'PRINTCODE', label: 'Print Code' },
        { key: 'PRINTERNAME', label: 'Printer Name' },
        { key: 'IPADDRESS', label: 'IP Address' },
        { key: 'IPID', label: 'IP ID' },
        { key: 'EXENAME', label: 'Executable' },
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

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(printers);
        setColumns([
            { key: "PRINTCODE", label: "Print Code" },
            { key: "PRINTERNAME", label: "Printer Name" },
            { key: "IPADDRESS", label: "IP Address" },
            { key: "IPID", label: "IP ID" },
            { key: "EXENAME", label: "Executable" },
            { key: "CREATEDDATE", label: "Created Date" },
        ]);
        setShowSno(true);
        title?.("Printer Settings");
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
            <Grid templateColumns={{ base: "1fr", lg: "600px 1fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            PRINTER SETTINGS
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={3} width="100%">
                                    {/* IP ADDRESS */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">IP ADDRESS :</Box>
                                        <Input
                                            value={form.IPADDRESS}
                                            onChange={(e) => handleChange("IPADDRESS", e.target.value)}
                                            size="2xs"
                                            placeholder="Enter IP address (e.g., 192.168.1.100)"
                                            maxLength={15}
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

                                    {/* IP ID */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">IP ID :</Box>
                                        <Input
                                            type="number"
                                            value={form.IPID || ""}
                                            onChange={(e) => handleChange("IPID", parseInt(e.target.value) || 0)}
                                            size="2xs"
                                            placeholder="Enter IP ID"
                                            min="1"
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

                                    {/* PRINTER NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">PRINTER NAME :</Box>
                                        <CapitalizedInput
                                            field="PRINTERNAME"
                                            value={form.PRINTERNAME}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                            placeholder="Enter printer name"
                                            max={100}
                                        />
                                    </Box>

                                    {/* EXECUTABLE NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="110px" fontSize="2xs">EXECUTABLE :</Box>
                                        <CapitalizedInput
                                            field="EXENAME"
                                            value={form.EXENAME}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                            placeholder="Enter executable name (e.g., PRINT_APP.EXE)"
                                            max={100}
                                        />
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
                                PRINTER LIST
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
                            columns={printerColumns}
                            data={printers}
                            isLoading={isApiLoading || isLoading}
                            renderRow={(printer: Printer, index: number) => (
                                <>
                                    <Table.Cell>{index + 1}</Table.Cell>
                                    <Table.Cell>{printer.PRINTCODE}</Table.Cell>
                                    <Table.Cell>{printer.PRINTERNAME}</Table.Cell>
                                    <Table.Cell>{printer.IPADDRESS}</Table.Cell>
                                    <Table.Cell>{printer.IPID}</Table.Cell>
                                    <Table.Cell>{printer.EXENAME}</Table.Cell>
                                    <Table.Cell>{formatDate(printer.CREATEDDATE)}</Table.Cell>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" gap={2}>
                                            <FaEdit 
                                                onClick={() => handleEdit(printer)} 
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                            />
                                            <FaTrash 
                                                onClick={() => handleDelete(printer.PRINTCODE!)} 
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
                            rowIdKey="PRINTCODE"
                            emptyText="No printers available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}
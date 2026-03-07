// app/(dashboard)/rates/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Grid,
    GridItem,
    VStack,
    HStack,
    Text,
    Fieldset
} from "@chakra-ui/react";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaPrint, FaFileExcel, FaTrash } from "react-icons/fa";
import { Table } from "@chakra-ui/react/table";
import { useTheme } from "@/context/theme/themeContext";
import { Toaster } from "@/components/ui/toaster";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

import { CustomTable } from "@/component/table/CustomTable";
import {
    useAllRates,
    useRateById,
    useCreateRate,
    useUpdateRate,
    useDeleteRate
} from "@/hooks/Rate/useRate";
import { useAllProducts } from "@/hooks/product/useProducts";
import { useAllSubProducts } from "@/hooks/SubProducts/useSubProducts";
import { Rate, RateForm } from "@/types/Rate/Rate";

import { toastCreated, toastError, toastLoaded, toastUpdated, toastDeleted } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { RateConfig } from "@/config/Master/Object/Rate";
import { DynamicForm } from "@/component/form/DynamicForm";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { DeleteDialog } from "@/components/ui/DeleteDialog";

function RateMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: ratesData, refetch: refetchRates } = useAllRates();
    const rates = ratesData ?? [];

    const { data: productsData } = useAllProducts();
    const products = productsData ?? [];

    const { data: subProductsData } = useAllSubProducts();
    const subProducts = subProductsData ?? [];

    const [editId, setEditId] = useState<string | number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: rateById } = useRateById(Number(editId) || 0);
    const rate = rateById ?? null;

    const { mutate: createRate } = useCreateRate();
    const { mutate: updateRate } = useUpdateRate();
    const { mutate: deleteRate } = useDeleteRate();

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<RateForm>({
        PRODUCTCODE: "",
        SUBPRODUCTCODE: "",
        PURRATE: "",
        MRP: "",
        SELLINGRATE: "",
        ACTIVE: "Y",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Filter subproducts based on selected product
    const [filteredSubProducts, setFilteredSubProducts] = useState<any[]>([]);

    // Prepare products with string values for the dropdown
    const productsForDropdown = products.map((p: any) => ({
        ...p,
        PRODUCTCODE: p.PRODUCTCODE.toString()
    }));

    // Filter subproducts when product changes
    useEffect(() => {
        if (form.PRODUCTCODE) {
            const filtered = subProducts.filter(
                (s: any) => s.product?.PRODUCTCODE?.toString() === form.PRODUCTCODE.toString()
            );
            setFilteredSubProducts(filtered);
            
            // Clear subproduct if it doesn't belong to selected product
            if (form.SUBPRODUCTCODE) {
                const stillValid = filtered.some(
                    (s: any) => s.SUBPRODUCTCODE?.toString() === String(form.SUBPRODUCTCODE).toString()
                );
                if (!stillValid) {
                    setForm(prev => ({ ...prev, SUBPRODUCTCODE: "" }));
                }
            }
        } else {
            setFilteredSubProducts([]);
            setForm(prev => ({ ...prev, SUBPRODUCTCODE: "" }));
        }
    }, [form.PRODUCTCODE, subProducts]);

    // Prepare subproducts with string values for the dropdown
    const subProductsForDropdown = filteredSubProducts.map((s: any) => ({
        ...s,
        SUBPRODUCTCODE: s.SUBPRODUCTCODE.toString()
    }));

    useEffect(() => {
        if (!rate) return;
        
    
        
        // Get codes from nested objects
        const productCodeFromNested = rate.product?.PRODUCTCODE;
        const subProductCodeFromNested = rate.subProduct?.SUBPRODUCTCODE;
        
     
        
        // Set form with string values
        setForm({
            PRODUCTCODE: productCodeFromNested?.toString() || "",
            SUBPRODUCTCODE: subProductCodeFromNested?.toString() || "",
            PURRATE: rate.PURRATE?.toString() || "",
            MRP: rate.MRP?.toString() || "",
            SELLINGRATE: rate.SELLINGRATE?.toString() || "",
            ACTIVE: rate.ACTIVE || "Y",
        });

        setTimeout(() => {
            toastLoaded("Rate");
            ScrollToTop();
        }, 100);
    }, [rate]);

    useEffect(() => {
        if (!highlightedId) return;
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: any, value: any) => {
        console.log(`Field ${field} changed to:`, value, "Type:", typeof value);
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm({
            PRODUCTCODE: "",
            SUBPRODUCTCODE: "",
            PURRATE: "",
            MRP: "",
            SELLINGRATE: "",
            ACTIVE: "Y",
        });
        setFormErrors({});
    };

    const handleEdit = (rate: any) => {
        setEditId(rate.RATEID);
        
        // Get codes from nested objects
        const productCodeFromNested = rate.product?.PRODUCTCODE;
        const subProductCodeFromNested = rate.subProduct?.SUBPRODUCTCODE;
        
        // Set form with string values
        setForm({
            PRODUCTCODE: productCodeFromNested?.toString() || "",
            SUBPRODUCTCODE: subProductCodeFromNested?.toString() || "",
            PURRATE: rate.PURRATE?.toString() || "",
            MRP: rate.MRP?.toString() || "",
            SELLINGRATE: rate.SELLINGRATE?.toString() || "",
            ACTIVE: rate.ACTIVE || "Y",
        });
        
        ScrollToTop();
    };

    const handleSave = () => {
        const errors: Record<string, string> = {};

        // Validation
        if (!form.PRODUCTCODE) errors.PRODUCTCODE = "Product is required";
        if (!form.PURRATE) errors.PURRATE = "Purchase Rate is required";
        if (!form.MRP) errors.MRP = "MRP is required";
        if (!form.SELLINGRATE) errors.SELLINGRATE = "Selling Rate is required";
        if (!form.ACTIVE?.trim()) errors.ACTIVE = "Active selection is required";

        // Validate that PURRATE, MRP, SELLINGRATE are valid numbers
        if (form.PURRATE && isNaN(Number(form.PURRATE))) {
            errors.PURRATE = "Purchase Rate must be a number";
        }
        if (form.MRP && isNaN(Number(form.MRP))) {
            errors.MRP = "MRP must be a number";
        }
        if (form.SELLINGRATE && isNaN(Number(form.SELLINGRATE))) {
            errors.SELLINGRATE = "Selling Rate must be a number";
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const payload: Rate = {
            PURRATE: Number(form.PURRATE),
            MRP: Number(form.MRP),
            SELLINGRATE: Number(form.SELLINGRATE),
            ACTIVE: form.ACTIVE,
        };

        if (editId) {
            // Update existing rate
            console.log("Updating rate with ID:", editId, "Payload:", payload);
            updateRate({
                ...payload,
                RATEID: Number(editId)
            }, {
                onSuccess: () => {
                    refetchRates();
                    resetForm();
                    setHighlightedId(Number(editId));
                    toastUpdated("Rate");
                },
                onError: (error) => {
                    console.error('Update error:', error);
                    toastError("Failed to update rate");
                },
            });
        } else {
            // Create new rate
            createRate({
                rate: payload,
                productCode: Number(form.PRODUCTCODE),
                subProductCode: form.SUBPRODUCTCODE ? Number(form.SUBPRODUCTCODE) : undefined,
                createdBy: 1
            }, {
                onSuccess: () => {
                    refetchRates();
                    resetForm();
                    toastCreated("Rate");
                },
                onError: (error) => {
                    console.error('Create error:', error);
                    toastError("Failed to create rate");
                },
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteId) {
            deleteRate(deleteId, {
                onSuccess: () => {
                    refetchRates();
                    toastDeleted("Rate");
                    setIsDeleteDialogOpen(false);
                    setDeleteId(null);
                },
                onError: (error) => {
                    console.error('Delete error:', error);
                    toastError("Failed to delete rate");
                },
            });
        }
    };

    const RateColumns = [
        { key: "RATEID", label: "ID" },
        { key: "PRODUCTNAME", label: "Product Name" },
        { key: "SUBPRODUCTNAME", label: "Sub Product Name" },
        { key: "PURRATE", label: "Purchase Rate" },
        { key: "MRP", label: "MRP" },
        { key: "SELLINGRATE", label: "Selling Rate" },
        { key: "ACTIVE", label: "Active" },
    ];

    const handleExport = (option: string) => {
        const exportData = rates.map((item: any) => ({
            RATEID: item.RATEID,
            PRODUCTNAME: item.product?.PRODUCTNAME || '',
            SUBPRODUCTNAME: item.subProduct?.SUBPRODUCTNAME || '-',
            PURRATE: item.PURRATE,
            MRP: item.MRP,
            SELLINGRATE: item.SELLINGRATE,
            ACTIVE: item.ACTIVE,
        }));

        setData(exportData);
        setColumns(RateColumns);
        setShowSno(true);
        title?.("Rate Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- FORM CONFIG -------------------- */
    const rateFormFields = RateConfig(productsForDropdown, subProductsForDropdown);
    const fieldSequence = rateFormFields.map(f => f.name);

    const { register, focusNext } = useEnterNavigation(fieldSequence, () => {
        handleSave();
    });

    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary}>
            <Toaster />
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Rate"
                message="Are you sure you want to delete this rate? This action cannot be undone."
            />

            <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            RATE {editId ? 'EDIT' : 'CREATION'}
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <DynamicForm
                                    fields={rateFormFields}
                                    formData={form}
                                    onChange={handleChange}
                                    register={register}
                                    focusNext={focusNext}
                                    errors={formErrors}
                                />
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack mt={2}>
                            <Button size="xs" colorPalette="blue" onClick={handleSave}>
                                <AiOutlineSave /> {editId ? "Update" : "Save"}
                            </Button>
                            <Button size="xs" colorPalette="blue" onClick={resetForm}>
                                <IoIosExit /> Exit
                            </Button>
                        </HStack>
                    </VStack>
                </GridItem>

                {/* ---------------- TABLE ---------------- */}
                <GridItem minW={0}>
                    <Box bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Box display="flex" mb={2} gap={2} justifyContent="space-between" alignItems="center">
                            <Text fontWeight="semibold" fontSize="small">
                                RATE DETAILS
                            </Text>
                            <HStack>
                                <Button variant="ghost" size="sm" onClick={() => handleExport("excel")}>
                                    <FaFileExcel />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")}>
                                    <FaPrint />
                                </Button>
                            </HStack>
                        </Box>

                        <CustomTable
                            columns={RateColumns}
                            data={rates}
                            headerBg={theme.colors.accient}
                            headerColor="white"
                            renderRow={(rate: any, index: number) => (
                                <>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" alignItems='center' gap={2}>
                                            {index + 1}
                                            <FaEdit 
                                                onClick={() => handleEdit(rate)} 
                                                cursor="pointer" 
                                                color="blue"
                                            />
                                            <FaTrash 
                                                onClick={() => handleDeleteClick(rate.RATEID)} 
                                                cursor="pointer" 
                                                color="red"
                                            />
                                        </Box>
                                    </Table.Cell>
                                    <Table.Cell>{rate.product?.PRODUCTNAME || ''}</Table.Cell>
                                    <Table.Cell>{rate.subProduct?.SUBPRODUCTNAME || '-'}</Table.Cell>
                                    <Table.Cell>{rate.PURRATE}</Table.Cell>
                                    <Table.Cell>{rate.MRP}</Table.Cell>
                                    <Table.Cell>{rate.SELLINGRATE}</Table.Cell>
                                    <Table.Cell>{rate.ACTIVE}</Table.Cell>
                                </>
                            )}
                            highlightRowId={highlightedId}
                            rowIdKey="RATEID"
                            emptyText="No rates available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

export default RateMaster;
// app/(master)/orionbarcode/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    useAllBarcodes,
    useBarcodeById,
    useCreateBarcode,
    useUpdateBarcode,
    useDeleteBarcode,
} from "@/hooks/OrionBarcode/useOrionBarcode";
import { Barcode, BarcodeForm } from "@/types/OrionBarcode/OrionBarcode";
import { useAllVendors } from "@/hooks/Vendor/useVendor";
import { useAllProducts } from "@/hooks/product/useProducts";
import { useAllSubProducts } from "@/hooks/SubProducts/useSubProducts";

import { toastCreated, toastError, toastLoaded, toastUpdated, toastDeleted } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { BarcodeConfig } from "@/config/Master/Object/OrionBarcode";
import { DynamicForm } from "@/component/form/DynamicForm";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { DeleteDialog } from "@/components/ui/DeleteDialog";

function OrionBarcodeMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: barcodesData, refetch: refetchBarcodes, isLoading: barcodesLoading } = useAllBarcodes();
    const barcodes = barcodesData ?? [];

    const { data: vendorsData, isLoading: vendorsLoading } = useAllVendors();
    const vendors = vendorsData ?? [];

    const { data: productsData, isLoading: productsLoading } = useAllProducts();
    const products = productsData ?? [];

    const { data: subProductsData, isLoading: subProductsLoading } = useAllSubProducts();
    const allSubProducts = subProductsData ?? [];

    const [editId, setEditId] = useState<string | number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: barcodeById } = useBarcodeById(Number(editId) || 0);
    const barcode = barcodeById ?? null;

    const { mutate: createBarcode } = useCreateBarcode();
    const { mutate: updateBarcode } = useUpdateBarcode();
    const { mutate: deleteBarcode } = useDeleteBarcode();

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<BarcodeForm>({
        VENDORCODE: "",
        PRODUCTCODE: "",
        SUBPRODUCTCODE: "",
        ORIONBARCODE: "",
        MRP: "",
        PURRATE: "",
        SELLINGRATE: "",
        ACTIVE: "Y",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Prepare vendors with string values for the dropdown - like in RateMaster
    const vendorsForDropdown = useMemo(() => {
        return vendors.map((v: any) => ({
            ...v,
            VENDORCODE: v.VENDORCODE?.toString()
        }));
    }, [vendors]);

    // Prepare products with string values for the dropdown - like in RateMaster
    const productsForDropdown = useMemo(() => {
        return products.map((p: any) => ({
            ...p,
            PRODUCTCODE: p.PRODUCTCODE?.toString()
        }));
    }, [products]);

    // Filter subproducts based on selected product
    const [filteredSubProducts, setFilteredSubProducts] = useState<any[]>([]);

    // Filter subproducts when product changes
 useEffect(() => {
    if (form.PRODUCTCODE && allSubProducts.length > 0) {

        const filtered = allSubProducts.filter(
            (s: any) =>
                s.product?.PRODUCTCODE?.toString() === form.PRODUCTCODE.toString()
        );

        setFilteredSubProducts(filtered);

        // ✅ AUTO SELECT if only one subproduct
        if (filtered.length === 1) {
            setForm(prev => ({
                ...prev,
                SUBPRODUCTCODE: filtered[0].SUBPRODUCTCODE.toString()
            }));
            return;
        }

        // Clear invalid selection
        if (form.SUBPRODUCTCODE) {
            const stillValid = filtered.some(
                (s: any) =>
                    s.SUBPRODUCTCODE?.toString() === form.SUBPRODUCTCODE?.toString()
            );

            if (!stillValid) {
                setForm(prev => ({ ...prev, SUBPRODUCTCODE: "" }));
            }
        }

    } else {
        setFilteredSubProducts([]);
        setForm(prev => ({ ...prev, SUBPRODUCTCODE: "" }));
    }
}, [form.PRODUCTCODE, allSubProducts]);

    // Prepare subproducts with string values for the dropdown - like in RateMaster
    const subProductsForDropdown = useMemo(() => {
        return filteredSubProducts.map((s: any) => ({
            ...s,
            SUBPRODUCTCODE: s.SUBPRODUCTCODE?.toString()
        }));
    }, [filteredSubProducts]);

    /* -------------------- USE EFFECTS -------------------- */
    useEffect(() => {
        if (!barcode) return;

        console.log('Loading barcode for edit:', barcode);
        
        setForm({
            VENDORCODE: barcode.vendor?.VENDORCODE?.toString() || barcode.VENDORCODE?.toString() || "",
            PRODUCTCODE: barcode.product?.PRODUCTCODE?.toString() || barcode.PRODUCTCODE?.toString() || "",
            SUBPRODUCTCODE: barcode.subProduct?.SUBPRODUCTCODE?.toString() || barcode.SUBPRODUCTCODE?.toString() || "",
            ORIONBARCODE: barcode.ORIONBARCODE || "",
            MRP: barcode.MRP?.toString() || "",
            PURRATE: barcode.PURRATE?.toString() || "",
            SELLINGRATE: barcode.SELLINGRATE?.toString() || "",
            ACTIVE: barcode.ACTIVE || "Y",
        });

        setTimeout(() => {
            toastLoaded("Barcode");
            ScrollToTop();
        }, 100);
    }, [barcode]);

    useEffect(() => {
        if (!highlightedId) return;
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
const handleChange = (field: string | number, value: any) => {
    console.log("Field changed:", field, value);

    setForm(prev => ({
        ...prev,
        [field]: value // ✅ works because object keys in JS can be strings or numbers
    }));
};

    const resetForm = () => {
        setEditId(null);
        setForm({
            VENDORCODE: "",
            PRODUCTCODE: "",
            SUBPRODUCTCODE: "",
            ORIONBARCODE: "",
            MRP: "",
            PURRATE: "",
            SELLINGRATE: "",
            ACTIVE: "Y",
        });
        setFormErrors({});
    };

    const handleEdit = (barcode: any) => {
        console.log('Editing barcode:', barcode);
        setEditId(barcode.ORIONID || "");
        
        setForm({
            VENDORCODE: barcode.vendor?.VENDORCODE?.toString() || barcode.VENDORCODE?.toString() || "",
            PRODUCTCODE: barcode.product?.PRODUCTCODE?.toString() || barcode.PRODUCTCODE?.toString() || "",
            SUBPRODUCTCODE: barcode.subProduct?.SUBPRODUCTCODE?.toString() || barcode.SUBPRODUCTCODE?.toString() || "",
            ORIONBARCODE: barcode.ORIONBARCODE || "",
            MRP: barcode.MRP?.toString() || "",
            PURRATE: barcode.PURRATE?.toString() || "",
            SELLINGRATE: barcode.SELLINGRATE?.toString() || "",
            ACTIVE: barcode.ACTIVE || "Y",
        });
        
        ScrollToTop();
    };

  const handleSave = () => {
    const errors: Record<string, string> = {};

    if (!form.VENDORCODE) errors.VENDORCODE = "Vendor is required";
    if (!form.PRODUCTCODE) errors.PRODUCTCODE = "Product is required";
    if (!form.ORIONBARCODE?.trim()) errors.ORIONBARCODE = "Barcode is required";
    if (!form.MRP) errors.MRP = "MRP is required";
    if (!form.PURRATE) errors.PURRATE = "Purchase Rate is required";
    if (!form.SELLINGRATE) errors.SELLINGRATE = "Selling Rate is required";

    console.log("Form Data:", form);
    console.log("Validation Errors:", errors);

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
        console.log("Save stopped due to validation errors");
        return;
    }
        // Validate numeric values
        if (form.MRP && isNaN(Number(form.MRP))) {
            errors.MRP = "MRP must be a number";
        } else if (Number(form.MRP) <= 0) errors.MRP = "MRP must be greater than 0";
        
        if (form.PURRATE && isNaN(Number(form.PURRATE))) {
            errors.PURRATE = "Purchase Rate must be a number";
        } else if (Number(form.PURRATE) <= 0) errors.PURRATE = "Purchase Rate must be greater than 0";
        
        if (form.SELLINGRATE && isNaN(Number(form.SELLINGRATE))) {
            errors.SELLINGRATE = "Selling Rate must be a number";
        } else if (Number(form.SELLINGRATE) <= 0) errors.SELLINGRATE = "Selling Rate must be greater than 0";

        setFormErrors(errors);

        // Stop if there are validation errors
        if (Object.keys(errors).length > 0) {
            return;
        }

        const payload: Barcode = {
            VENDORCODE: Number(form.VENDORCODE),
            PRODUCTCODE: Number(form.PRODUCTCODE),
            SUBPRODUCTCODE:
    form.SUBPRODUCTCODE ||
    filteredSubProducts.length === 1
        ? Number(form.SUBPRODUCTCODE || filteredSubProducts[0]?.SUBPRODUCTCODE)
        : undefined,
            ORIONBARCODE: form.ORIONBARCODE,
            MRP: Number(form.MRP),
            PURRATE: Number(form.PURRATE),
            SELLINGRATE: Number(form.SELLINGRATE),
            ACTIVE: form.ACTIVE,
        };

        console.log('Saving payload:', payload);

        if (editId) {
            // Update existing barcode
            updateBarcode({
                ...payload,
                ORIONID: Number(editId)
            }, {
                onSuccess: () => {
                    refetchBarcodes();
                    resetForm();
                    setHighlightedId(Number(editId));
                    toastUpdated("Barcode");
                },
                onError: (error) => {
                    console.error('Update error:', error);
                    toastError("Failed to update barcode");
                },
            });
        } else {
            // Create new barcode
            createBarcode({
                barcode: payload,
                createdBy: 1 // You might want to get this from auth context
            }, {
                onSuccess: () => {
                    refetchBarcodes();
                    resetForm();
                    toastCreated("Barcode");
                },
                onError: (error) => {
                    console.error('Create error:', error);
                    toastError("Failed to create barcode");
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
            deleteBarcode(deleteId, {
                onSuccess: () => {
                    refetchBarcodes();
                    toastDeleted("Barcode");
                    setIsDeleteDialogOpen(false);
                    setDeleteId(null);
                },
                onError: (error) => {
                    console.error('Delete error:', error);
                    toastError("Failed to delete barcode");
                },
            });
        }
    };

    // Helper functions to get names from codes (using nested objects if available)
    const getVendorName = (barcode: any) => {
        if (barcode.vendor?.VENDORNAME) return barcode.vendor.VENDORNAME;
        const vendor = vendors.find((v: any) => v.VENDORCODE === barcode.VENDORCODE);
        return vendor?.VENDORNAME || barcode.VENDORCODE?.toString() || '-';
    };

    const getProductName = (barcode: any) => {
        if (barcode.product?.PRODUCTNAME) return barcode.product.PRODUCTNAME;
        const product = products.find((p: any) => p.PRODUCTCODE === barcode.PRODUCTCODE);
        return product?.PRODUCTNAME || barcode.PRODUCTCODE?.toString() || '-';
    };

    const getSubProductName = (barcode: any) => {
        if (barcode.subProduct?.SUBPRODUCTNAME) return barcode.subProduct.SUBPRODUCTNAME;
        if (!barcode.SUBPRODUCTCODE) return '-';
        const subProduct = allSubProducts.find((sp: any) => sp.SUBPRODUCTCODE === barcode.SUBPRODUCTCODE);
        return subProduct?.SUBPRODUCTNAME || barcode.SUBPRODUCTCODE?.toString() || '-';
    };

  const BarcodeColumns = [
    { key: "ACTION", label: "Action" },   // 👈 add this
    { key: "ORIONID", label: "ID" },
    { key: "VENDORNAME", label: "Vendor" },
    { key: "PRODUCTNAME", label: "Product" },
    { key: "SUBPRODUCTNAME", label: "Sub Product" },
    { key: "ORIONBARCODE", label: "Barcode" },
    { key: "MRP", label: "MRP (₹)" },
    { key: "PURRATE", label: "Purchase Rate (₹)" },
    { key: "SELLINGRATE", label: "Selling Rate (₹)" },
    { key: "ACTIVE", label: "Status" },
];

    const handleExport = (option: string) => {
        const exportData = barcodes.map((barcode: any) => ({
            ORIONID: barcode.ORIONID,
            VENDORNAME: getVendorName(barcode),
            PRODUCTNAME: getProductName(barcode),
            SUBPRODUCTNAME: getSubProductName(barcode),
            ORIONBARCODE: barcode.ORIONBARCODE,
            MRP: `₹${barcode.MRP?.toFixed(2)}`,
            PURRATE: `₹${barcode.PURRATE?.toFixed(2)}`,
            SELLINGRATE: `₹${barcode.SELLINGRATE?.toFixed(2)}`,
            ACTIVE: barcode.ACTIVE,
        }));

        setData(exportData);
        setColumns(BarcodeColumns);
        setShowSno(true);
        title?.("Barcode Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- FORM CONFIG -------------------- */
    // Pass the prepared dropdown data to the config
    const barcodeFormFields = BarcodeConfig(
        vendorsForDropdown, 
        productsForDropdown, 
        subProductsForDropdown
    );
    
    const fieldSequence = barcodeFormFields.map(f => f.name);

    const { register, focusNext } = useEnterNavigation(fieldSequence, () => {
        handleSave();
    });

    // Log to check if data is being passed correctly
    console.log('Vendors for dropdown:', vendorsForDropdown);
    console.log('Products for dropdown:', productsForDropdown);
    console.log('SubProducts for dropdown:', subProductsForDropdown);
    console.log('Form fields:', barcodeFormFields);

    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary}>
            <Toaster />
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Barcode"
                message="Are you sure you want to delete this barcode? This action cannot be undone."
            />

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            BARCODE {editId ? 'EDIT' : 'CREATION'}
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                {vendorsLoading || productsLoading || subProductsLoading ? (
                                    <Text>Loading dropdown data...</Text>
                                ) : (
                                    <DynamicForm
                                        fields={barcodeFormFields}
                                        formData={form}
                                        onChange={handleChange}
                                        register={register}
                                        focusNext={focusNext}
                                        errors={formErrors}
                                        grid={{ columns: 1 }}
                                    />
                                )}
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack mt={2} gap={2}>
                            <Button size="xs" colorPalette="blue" onClick={handleSave}>
                                <AiOutlineSave /> {editId ? "Update" : "Save"}
                            </Button>
                            <Button size="xs" colorPalette="blue" variant="outline" onClick={resetForm}>
                                <IoIosExit /> Clear
                            </Button>
                        </HStack>
                    </VStack>
                </GridItem>

                {/* ---------------- TABLE ---------------- */}
                <GridItem minW={0}>
                    <Box bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Box display="flex" mb={2} gap={2} justifyContent="space-between" alignItems="center">
                            <Text fontWeight="semibold" fontSize="small">
                                BARCODE LIST
                            </Text>
                            <HStack>
                                <Button variant="ghost" size="sm" onClick={() => handleExport("excel")} title="Export to Excel">
                                    <FaFileExcel />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")} title="Export to PDF">
                                    <FaPrint />
                                </Button>
                            </HStack>
                        </Box>

                        <CustomTable
                            columns={BarcodeColumns}
                            data={barcodes}
                            headerBg={theme.colors.accient}
                            headerColor="white"
                            renderRow={(barcode: any, index: number) => (
                                <>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" alignItems='center' gap={2}>
                                            {index + 1}
                                            <FaEdit 
                                                onClick={() => handleEdit(barcode)} 
                                                cursor="pointer" 
                                                color="blue"
                                                size={16}
                                                title="Edit"
                                            />
                                            <FaTrash
                                                onClick={() => handleDeleteClick(barcode.ORIONID)}
                                                cursor="pointer"
                                                color="red"
                                                size={16}
                                                title="Delete"
                                            />
                                        </Box>
                                    </Table.Cell>

                                    <Table.Cell>{barcode.ORIONID}</Table.Cell>
                                    <Table.Cell>{getVendorName(barcode)}</Table.Cell>
                                    <Table.Cell>{getProductName(barcode)}</Table.Cell>
                                    <Table.Cell>{getSubProductName(barcode)}</Table.Cell>
                                    <Table.Cell fontWeight="bold">{barcode.ORIONBARCODE}</Table.Cell>
                                    <Table.Cell>₹{barcode.MRP?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>₹{barcode.PURRATE?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>₹{barcode.SELLINGRATE?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>
                                        <Box
                                            as="span"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                            bg={barcode.ACTIVE === "Y" ? "green.500" : "red.500"}
                                            color="white"
                                            fontSize="xs"
                                            fontWeight="bold"
                                        >
                                            {barcode.ACTIVE === "Y" ? "ACTIVE" : "INACTIVE"}
                                        </Box>
                                    </Table.Cell>
                                </>
                            )}
                            highlightRowId={highlightedId}
                            rowIdKey="ORIONID"
                            emptyText="No barcodes available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

export default OrionBarcodeMaster;
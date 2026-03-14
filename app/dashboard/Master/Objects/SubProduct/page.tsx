// app/(dashboard)/subproducts/page.tsx
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
    useAllSubProducts,
    useSubProductById,
    useCreateSubProduct,
    useUpdateSubProduct,
    useDeleteSubProduct
} from "@/hooks/SubProducts/useSubProducts";
import { useAllProducts } from "@/hooks/product/useProducts";
import { SubProduct, SubProductForm } from "@/types/subproduct/subproduct";

import { toastCreated, toastError, toastLoaded, toastUpdated, toastDeleted } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { SubProductConfig } from "@/config/Master/Object/SubProducts";
import { DynamicForm } from "@/component/form/DynamicForm";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { DeleteDialog } from "@/components/ui/DeleteDialog";

function SubProductMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: subProductsData, refetch: refetchSubProducts } = useAllSubProducts();
    const subProducts = subProductsData ?? [];

    const { data: productsData } = useAllProducts();
    const products = productsData ?? [];

    const [editId, setEditId] = useState<string | number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: subProductById } = useSubProductById(Number(editId) || 0);
    const subProduct = subProductById ?? null;

    const { mutate: createSubProduct } = useCreateSubProduct();
    const { mutate: updateSubProduct } = useUpdateSubProduct();
    const { mutate: deleteSubProduct } = useDeleteSubProduct();

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<SubProductForm>({
        SUBPRODUCTNAME: "",
        SHORTNAME: "",
        ACTIVE: "Y",
        PRODUCTCODE: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Prepare products with string values for the dropdown
    const productsForDropdown = products.map((p: { PRODUCTCODE: { toString: () => any; }; }) => ({
        ...p,
        PRODUCTCODE: p.PRODUCTCODE.toString()
    }));

    useEffect(() => {
        if (!subProduct) return;
        
       
        
        // IMPORTANT: Get PRODUCTCODE from the nested product object
        // Since the main subproduct object doesn't have PRODUCTCODE directly
        const productCodeFromNested = subProduct.product?.PRODUCTCODE;
        

        
        // Find the matching product to verify
        const matchingProduct = products.find((p: { PRODUCTCODE: any; }) => p.PRODUCTCODE === productCodeFromNested);
      
        
        // Set form with string value from nested product
        const productCodeValue = productCodeFromNested?.toString() || "";

        
        setForm({
            SUBPRODUCTNAME: subProduct.SUBPRODUCTNAME,
            SHORTNAME: subProduct.SHORTNAME ?? "",
            ACTIVE: subProduct.ACTIVE ?? "Y",
            PRODUCTCODE: productCodeValue,
        });

        setTimeout(() => {
            toastLoaded("Sub Product");
            ScrollToTop();
        }, 100);
    }, [subProduct, products]);

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
            SUBPRODUCTNAME: "",
            SHORTNAME: "",
            ACTIVE: "Y",
            PRODUCTCODE: "",
        });
        setFormErrors({});
    };

    const handleEdit = (subProduct: any) => {
      
        
        // IMPORTANT: Get PRODUCTCODE from the nested product object
        const productCodeFromNested = subProduct.product?.PRODUCTCODE;
        
      
        setEditId(subProduct.SUBPRODUCTCODE);
        
        // Find the matching product to verify
        const matchingProduct = products.find((p: { PRODUCTCODE: any; }) => p.PRODUCTCODE === productCodeFromNested);
      
        // Set form with string value from nested product
        const productCodeValue = productCodeFromNested?.toString() || "";
       
        setForm({
            SUBPRODUCTNAME: subProduct.SUBPRODUCTNAME,
            SHORTNAME: subProduct.SHORTNAME ?? "",
            ACTIVE: subProduct.ACTIVE ?? "Y",
            PRODUCTCODE: productCodeValue,
        });
        
        ScrollToTop();
    };

    const handleSave = () => {
        const errors: Record<string, string> = {};

        if (!form.SUBPRODUCTNAME?.trim()) errors.SUBPRODUCTNAME = "Sub Product Name is required";
        if (!form.SHORTNAME?.trim()) errors.SHORTNAME = "Short Name is required";
        if (!form.PRODUCTCODE) errors.PRODUCTCODE = "Parent Product is required";
        if (!form.ACTIVE?.trim()) errors.ACTIVE = "Active selection is required";

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const payload: SubProduct = {
            SUBPRODUCTNAME: form.SUBPRODUCTNAME,
            SHORTNAME: form.SHORTNAME,
            ACTIVE: form.ACTIVE,
            PRODUCTCODE: Number(form.PRODUCTCODE),
        };



        if (editId) {
            updateSubProduct({
                id: Number(editId),
                subProduct: payload
            }, {
                onSuccess: () => {
                    refetchSubProducts();
                    resetForm();
                    setHighlightedId(Number(editId));
                    toastUpdated("Sub Product");
                },
                onError: (error) => {
                    console.error('Update error:', error);
                    toastError("Failed to update sub product");
                },
            });
        } else {
            createSubProduct({
                subProduct: payload,
                createdBy: 1
            }, {
                onSuccess: () => {
                    refetchSubProducts();
                    resetForm();
                    toastCreated("Sub Product");
                },
                onError: (error) => {
                    console.error('Create error:', error);
                    toastError("Failed to create sub product");
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
            deleteSubProduct(deleteId, {
                onSuccess: () => {
                    refetchSubProducts();
                    toastDeleted("Sub Product");
                    setIsDeleteDialogOpen(false);
                    setDeleteId(null);
                },
                onError: (error) => {
                    console.error('Delete error:', error);
                    toastError("Failed to delete sub product");
                },
            });
        }
    };

    const SubProductColumns = [
        { key: "SUBPRODUCTCODE", label: "Code" },
        { key: "SUBPRODUCTNAME", label: "Sub Product Name" },
        { key: "SHORTNAME", label: "Short Name" },
        { key: "PRODUCTNAME", label: "Parent Product" },
        { key: "ACTIVE", label: "Active" },
    ];

    const handleExport = (option: string) => {
        const exportData = subProducts.map((item: any) => ({
            SUBPRODUCTCODE: item.SUBPRODUCTCODE,
            SUBPRODUCTNAME: item.SUBPRODUCTNAME,
            SHORTNAME: item.SHORTNAME,
            PRODUCTNAME: item.product?.PRODUCTNAME || '',
            ACTIVE: item.ACTIVE,
        }));

        setData(exportData);
        setColumns(SubProductColumns);
        setShowSno(true);
        title?.("Sub Product Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- FORM CONFIG -------------------- */
    const subProductFormFields = SubProductConfig(productsForDropdown);
    const fieldSequence = subProductFormFields.map(f => f.name);

    const { register, focusNext } = useEnterNavigation(fieldSequence, () => {
        handleSave();
        return true;
    });

    // Debug logs
   
    console.log("Does PRODUCTCODE match any option?", 
        productsForDropdown.some((p: { PRODUCTCODE: string | number; }) => p.PRODUCTCODE === form.PRODUCTCODE));
    if (form.PRODUCTCODE) {
        const matchingOption = productsForDropdown.find((p: { PRODUCTCODE: string | number; }) => p.PRODUCTCODE === form.PRODUCTCODE);
  
    }


    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary}>
            <Toaster />
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Sub Product"
                message="Are you sure you want to delete this sub product? This action cannot be undone."
            />

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1.5fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem >
                    <VStack bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            SUB PRODUCT {editId ? 'EDIT' : 'CREATION'}
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <DynamicForm
                                    fields={subProductFormFields}
                                    formData={form}
                                    onChange={handleChange}
                                    register={register}
                                    focusNext={focusNext}
                                    errors={formErrors}
                                    grid={{ columns: 1 }}
                                />
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack mt={2}>
                            <Button size="xs" colorPalette="blue" onClick={handleSave}>
                                <AiOutlineSave /> {editId ? "Update" : "Save"}
                            </Button>
                            <Button size="xs" colorPalette="blue" onClick={resetForm}>
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
                                SUB PRODUCT DETAILS
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
                            columns={SubProductColumns}
                            data={subProducts}
                            headerBg={theme.colors.accient}
                            headerColor="white"
                            renderRow={(subProduct: any, index: number) => (
                                <>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" alignItems='center' gap={2}>
                                            {index + 1}
                                            <FaEdit 
                                                onClick={() => handleEdit(subProduct)} 
                                                cursor="pointer" 
                                                color="blue"
                                            />
                                            <FaTrash 
                                                onClick={() => handleDeleteClick(subProduct.SUBPRODUCTCODE)} 
                                                cursor="pointer" 
                                                color="red"
                                            />
                                        </Box>
                                    </Table.Cell>
                                    <Table.Cell>{subProduct.SUBPRODUCTNAME}</Table.Cell>
                                    <Table.Cell>{subProduct.SHORTNAME}</Table.Cell>
                                    <Table.Cell>{subProduct.product?.PRODUCTNAME || ''}</Table.Cell>
                                    <Table.Cell>{subProduct.ACTIVE}</Table.Cell>
                                </>
                            )}
                            highlightRowId={highlightedId}
                            rowIdKey="SUBPRODUCTCODE"
                            emptyText="No sub products available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

export default SubProductMaster;
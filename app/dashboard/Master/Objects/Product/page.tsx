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
import { FaEdit, FaPrint, FaFileExcel } from "react-icons/fa";
import { Table } from "@chakra-ui/react/table";
import { useTheme } from "@/context/theme/themeContext";
import { Toaster } from "@/components/ui/toaster";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

import { CustomTable } from "@/component/table/CustomTable";
import {
    useAllProducts,
    useProductById,
    useCreateProduct,
    useUpdateProduct,
} from "@/hooks/product/useProducts";
import { Product, ProductForm, AllProducts } from "@/types/product/Product";

import { toastCreated, toastError, toastLoaded, toastUpdated } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { ProductConfig } from "@/config/Master/Object/Product";
import { DynamicForm } from "@/component/form/DynamicForm";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";


function ProductMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: productsData, refetch: refetchProducts } = useAllProducts();
    const products = productsData ?? [];

    const [editId, setEditId] = useState<string | number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    const { data: productById } = useProductById(Number(editId) || 0) ?? "";
    const product = productById ?? null;

    const { mutate: createProduct } = useCreateProduct();
    const { mutate: updateProduct } = useUpdateProduct();

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<ProductForm>({

        PRODUCTNAME: "",
        SHORTNAME: "",
        SUBPRODUCT: "Y",
        UNITCODE: "1",
        ACTIVE: "Y",
        ALLOWDISCOUNT: "N",
        PURUNITCODE: "1",
        PRODUCTTYPE: "T",
        TAGTYPE: "S",
        ORIONBARCODE: "",
        EXPIRYDAYS: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    /* -------------------- USE EFFECTS -------------------- */
    useEffect(() => {
        if (!product) return;

        setForm({
            PRODUCTNAME: product.PRODUCTNAME,
            SHORTNAME: product.SHORTNAME ?? "",
            SUBPRODUCT: product.SUBPRODUCT,
            UNITCODE: product.UNITCODE,
            ACTIVE: product.ACTIVE ?? "Y",
            ALLOWDISCOUNT: product.ALLOWDISCOUNT ?? "Y",
            PURUNITCODE: product.PURUNITCODE,
            PRODUCTTYPE: product.PRODUCTTYPE,
            TAGTYPE: product.TAGTYPE,
            ORIONBARCODE: product.ORIONBARCODE,
            EXPIRYDAYS: product.EXPIRYDAYS,
        });

        setTimeout(() => {
            toastLoaded("Product");
            ScrollToTop();
        }, 0);
    }, [product]);

    useEffect(() => {
        if (!highlightedId) return;
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
const handleChange = (field: any, value: any) => {

    // If product type changes
    if (field === "PRODUCTTYPE") {

        if (value === "NT") {
            setForm(prev => ({
                ...prev,
                PRODUCTTYPE: value,
                TAGTYPE: "S",
                ORIONBARCODE: "Y"
            }));
            return;
        }

        // If user switches back to Tagged
        if (value === "T") {
            setForm(prev => ({
                ...prev,
                PRODUCTTYPE: value,
                TAGTYPE: "S",
                ORIONBARCODE: "N"
            }));
            return;
        }
    }

    setForm(prev => ({
        ...prev,
        [field]: value
    }));
};

    const resetForm = () => {
        setEditId(null);
        setForm({
            PRODUCTNAME: "",
            SHORTNAME: "",
            SUBPRODUCT: "Y",
            UNITCODE: "1",
            ACTIVE: "Y",
            ALLOWDISCOUNT: "Y",
            PURUNITCODE: "1",
            PRODUCTTYPE: "T",
            TAGTYPE: "S",
            ORIONBARCODE: "",
            EXPIRYDAYS: "",
        });
    };

const handleSave = () => {
     console.log('handleSave clicked', { form, editId }); 
    const errors: Record<string, string> = {};

    // Validation
    if (!form.PRODUCTNAME?.trim()) errors.PRODUCTNAME = "Product Name is required";
    if (!form.SUBPRODUCT?.trim()) errors.SUBPRODUCT = "Subproduct is required";
    if (!form.UNITCODE) errors.UNITCODE = "Selling Unit is required";
    if (!form.PURUNITCODE) errors.PURUNITCODE = "Purchase Unit is required";
    if (!form.PRODUCTTYPE?.trim()) errors.PRODUCTTYPE = "Product Type is required";

    // Fix: Don't mutate form directly, just validate
    if (form.PRODUCTTYPE === "NT") {
        if (!form.ORIONBARCODE?.trim()) errors.ORIONBARCODE = "Orion Barcode selection is required for tagged products";
    } else {
        if (!form.TAGTYPE?.trim()) errors.TAGTYPE = "Tag Type is required for tagged products";
    }

    if (!form.ALLOWDISCOUNT?.trim()) errors.ALLOWDISCOUNT = "Allow Discount selection is required";
    if (!form.ACTIVE?.trim()) errors.ACTIVE = "Active selection is required";
    if (!form.EXPIRYDAYS) errors.EXPIRYDAYS = "Expiry Days is required";

    setFormErrors(errors);

    // Stop if there are validation errors
    if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        return;
    }

    // Build final values
    console.log("FORM DATA:", form);
const finalTagType =
    form.PRODUCTTYPE === "N" ? "S" : form.TAGTYPE || "S";

const finalOrionBarcode =
    form.PRODUCTTYPE === "N" ? "Y" : form.ORIONBARCODE || "N";

    const payload: Product = {
        PRODUCTNAME: form.PRODUCTNAME,
        SHORTNAME: form.SHORTNAME,
        SUBPRODUCT: form.SUBPRODUCT,
        UNITCODE: Number(form.UNITCODE),
        PURUNITCODE: Number(form.PURUNITCODE),
        PRODUCTTYPE: form.PRODUCTTYPE,
        TAGTYPE: finalTagType,
        ORIONBARCODE: finalOrionBarcode,
        ALLOWDISCOUNT: form.ALLOWDISCOUNT,
        ACTIVE: form.ACTIVE,
        EXPIRYDAYS: Number(form.EXPIRYDAYS),
    };

    console.log('Saving payload:', payload, 'Edit ID:', editId); // Debug log

    if (editId) {
        // Update existing product
       updateProduct({
    ...payload,
    PRODUCTCODE: Number(editId)
}, {
    onSuccess: (response) => {
        console.log('Update success:', response);
        refetchProducts();
        resetForm();
        setHighlightedId(Number(editId));
        toastUpdated("Product");
    },
    onError: (error) => {
        console.error('Update error:', error);
        toastError("Failed to update product");
    },
});
    } else {
        // Create new product
        createProduct(payload, {
            onSuccess: (response) => {
                console.log('Create success:', response);
                refetchProducts();
                resetForm();
                toastCreated("Product");
            },
            onError: (error) => {
                console.error('Create error:', error);
                toastError("Failed to create product");
            },
        });
    }
};

    const handleEdit = (product: Product) => {
        setEditId(String(product.PRODUCTCODE));
    };

    const ProductColumns = [

        { key: "PRODUCTCODE", label: "Product Code" },
        { key: "PRODUCTNAME", label: "Product Name" },
        { key: "SHORTNAME", label: "Short Name" },
        { key: "SUBPRODUCT", label: "Subproduct" },
        { key: "UNITCODE", label: "Unit Code" },
        { key: "ACTIVE", label: "Active" },
        { key: "ALLOWDISCOUNT", label: "Allow Discount" },
        { key: "PURUNITCODE", label: "Purchase Unit" },
        { key: "PRODUCTTYPE", label: "Product Type" },
        { key: "TAGTYPE", label: "Tag Type" },
        { key: "ORIONBARCODE", label: "Orion Barcode" },
        { key: "EXPIRYDAYS", label: "Expiry Days" },

    ];

    const handleExport = (option: string) => {
        setData(products);
        setColumns(ProductColumns.filter((col) => col.key !== "actions"));
        setShowSno(true);
        title?.("Product Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- FORM CONFIG -------------------- */
    const productFormFields = ProductConfig(form.PRODUCTTYPE ,editId);
    const fieldSequence = productFormFields.map(f => f.name);

    const { register, focusNext, focusFirst } = useEnterNavigation(fieldSequence, () => {
        handleSave();
    });


    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary}>
            <Toaster />
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem >
                    <VStack bg={theme.colors.formColor}  p={3} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            PRODUCT CREATION
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <DynamicForm
                                    fields={productFormFields}
                                    formData={form}
                                    onChange={handleChange}
                                    register={register}
                                    focusNext={focusNext}
                                    disabled={{ COMPANYID: !!editId }}
                                    grid={{ columns: 1 }}
                                    // errors={errors}
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
                                PRODUCT DETAILS
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
                            columns={ProductColumns}
                            data={products}
                            headerBg={theme.colors.accient}
                            headerColor="white"
                            renderRow={(product: Product, index: number) => (
                                <>
                                    <Table.Cell >
                                        <Box display="flex" justifyContent="center" alignItems='center' gap={1}>
                                            {index + 1}

                                            <FaEdit onClick={() => handleEdit(product)} cursor="pointer" />
                                        </Box>
                                    </Table.Cell>

                                    <Table.Cell>{product.PRODUCTNAME}</Table.Cell>
                                    <Table.Cell>{product.SHORTNAME}</Table.Cell>
                                    <Table.Cell>{product.SUBPRODUCT}</Table.Cell>
                                    <Table.Cell>{product.UNITCODE}</Table.Cell>
                                    <Table.Cell>{product.ACTIVE}</Table.Cell>
                                    <Table.Cell>{product.ALLOWDISCOUNT}</Table.Cell>
                                    <Table.Cell>{product.PURUNITCODE}</Table.Cell>
                                    <Table.Cell>{product.PRODUCTTYPE}</Table.Cell>
                                    <Table.Cell>{product.TAGTYPE}</Table.Cell>
                                    <Table.Cell>{product.ORIONBARCODE}</Table.Cell>
                                    <Table.Cell>{product.EXPIRYDAYS}</Table.Cell>



                                </>
                            )}
                            highlightRowId={highlightedId}
                            rowIdKey="PRODUCTCODE"
                            emptyText="No products available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

export default ProductMaster;
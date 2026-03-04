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
import { CapitalizedInput } from "@/component/form/CapitalizedInput";
import { SelectCombobox } from "@/components/ui/selectComboBox";
import ActiveSelect from "@/components/ui/ActiveSelect";
import {
    useAllProducts,
    useProductById,
    useCreateProduct,
    useUpdateProduct,
} from "@/hooks/product/useProducts";
import { Product, ProductForm ,AllProducts } from "@/types/product/Product";

import { toastCreated, toastError, toastLoaded, toastUpdated } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { sellingUnit, TaggedOrNonTagged, TagType } from "@/data/product/ProductData";
import { YesOrNo } from "@/data/YesOrNo/YesOrNoTypes";

function ProductMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: productsData, refetch: refetchProducts } = useAllProducts();
    const products = productsData ?? [];

    const [editId, setEditId] = useState<string| number | null>(null);
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
      const handleChange = (field: keyof ProductForm, value: any) => {
            setForm((prev) => ({
                ...prev,
                [field]: value,
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
        const errors: Record<string, string> = {};

        if (!form.PRODUCTNAME?.trim()) errors.PRODUCTNAME = "Product Name is required";
        if (!form.SUBPRODUCT?.trim()) errors.SUBPRODUCT = "Subproduct is required";
        if (!form.UNITCODE) errors.UNITCODE = "Selling Unit is required";
        if (!form.PURUNITCODE) errors.PURUNITCODE = "Purchase Unit is required";
        if (!form.PRODUCTTYPE?.trim()) errors.PRODUCTTYPE = "Product Type is required";

        if (form.PRODUCTTYPE === "NT") {
            // auto-set for NT
            form.TAGTYPE = "S";
            form.ORIONBARCODE = "Y";
            if (!form.ORIONBARCODE?.trim()) errors.ORIONBARCODE = "Orion Barcode selection is required for tagged products";
        } else {
            if (!form.TAGTYPE?.trim()) errors.TAGTYPE = "Tag Type is required for tagged products";
        
        }

        if (!form.ALLOWDISCOUNT?.trim()) errors.ALLOWDISCOUNT = "Allow Discount selection is required";
        if (!form.ACTIVE?.trim()) errors.ACTIVE = "Active selection is required";
        if (!form.EXPIRYDAYS) errors.EXPIRYDAYS = "Expiry Days is required";

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) return; // stop saving if errors exist
        // ✅ Build final values safely (NO MUTATION)
        const finalTagType =
            form.PRODUCTTYPE === "NT" ? "S" : form.TAGTYPE;

        const finalOrionBarcode =
            form.PRODUCTTYPE === "NT" ? "Y" : form.ORIONBARCODE;

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

        // ✅ EDIT
        if (editId) {
            updateProduct(
                { payload: { ...payload, PRODUCTCODE: Number(editId) } },
                {
                    onSuccess: () => {
                        refetchProducts();
                        resetForm();
                        setHighlightedId(Number(editId));
                        toastUpdated("Product");
                    },
                }
            );
        }
        // ✅ CREATE (NO PRODUCTCODE)
        else {
            createProduct(payload, {
                onSuccess: () => {
                    refetchProducts();
                    resetForm();
                    toastCreated("Product");
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

    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary}>
            <Toaster />
            <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            PRODUCT CREATION
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid css={{ gridTemplateColumns: "repeat(1, 1fr)" }} gap={4}>

                                    {/* PRODUCT NAME */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">PRODUCT NAME :</Box>
                                            <CapitalizedInput
                                                field="PRODUCTNAME"
                                                value={form.PRODUCTNAME}
                                                onChange={handleChange}
                                                size="2xs"
                                            />
                                        </Box>
                                        {formErrors.PRODUCTNAME && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.PRODUCTNAME}</Text>
                                        )}
                                    </Box>

                                    {/* SHORT NAME */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">SHORT NAME :</Box>
                                            <CapitalizedInput
                                                field="SHORTNAME"
                                                value={form.SHORTNAME}
                                                onChange={handleChange}
                                                size="2xs"
                                            />
                                        </Box>
                                    </Box>

                                    {/* SUBPRODUCT */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">SUBPRODUCT :</Box>
                                            <ActiveSelect
                                                items={YesOrNo}
                                                value={form.SUBPRODUCT}
                                                onChange={(val) => handleChange("SUBPRODUCT", val)}
                                                size="xs"
                                            />
                                        </Box>
                                        {formErrors.SUBPRODUCT && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.SUBPRODUCT}</Text>
                                        )}
                                    </Box>

                                    {/* SELLING UNIT */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">SELLING UNIT :</Box>
                                            <ActiveSelect
                                                items={sellingUnit}
                                                value={form.UNITCODE}
                                                onChange={(val) => handleChange("UNITCODE", val)}
                                                size="xs"
                                            />
                                        </Box>
                                        {formErrors.UNITCODE && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.UNITCODE}</Text>
                                        )}
                                    </Box>

                                    {/* PURCHASE UNIT */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">PURCHASE UNIT :</Box>
                                            <ActiveSelect
                                                items={sellingUnit}
                                                value={form.PURUNITCODE}
                                                onChange={(val) => handleChange("PURUNITCODE", val)}
                                                size="xs"
                                            />
                                        </Box>
                                        {formErrors.PURUNITCODE && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.PURUNITCODE}</Text>
                                        )}
                                    </Box>

                                    {/* PRODUCT TYPE */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">PRODUCT TYPE :</Box>
                                            <ActiveSelect
                                                items={TaggedOrNonTagged}
                                                value={form.PRODUCTTYPE}
                                                onChange={(val) => handleChange("PRODUCTTYPE", val)}
                                                size="xs"
                                            />
                                        </Box>
                                        {formErrors.PRODUCTTYPE && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.PRODUCTTYPE}</Text>
                                        )}
                                    </Box>

                                    {/* TAG TYPE */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">TAG TYPE :</Box>
                                            <ActiveSelect
                                                items={TagType}
                                                value={form.TAGTYPE}
                                                onChange={(val) => handleChange("TAGTYPE", val)}
                                                size="xs"
                                                isDisabled={form.PRODUCTTYPE === "NT"}
                                            />
                                        </Box>
                                        {formErrors.TAGTYPE && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.TAGTYPE}</Text>
                                        )}
                                    </Box>

                                    {/* ORION BARCODE */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">ORION BARCODE :</Box>
                                            <ActiveSelect
                                                items={YesOrNo}
                                                value={form.ORIONBARCODE}
                                                onChange={(val) => handleChange("ORIONBARCODE", val)}
                                                size="xs"
                                                isDisabled={form.PRODUCTTYPE !== "NT"}
                                            />
                                        </Box>
                                        {formErrors.ORIONBARCODE && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.ORIONBARCODE}</Text>
                                        )}
                                    </Box>

                                    {/* ALLOW DISCOUNT */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">ALLOW DISCOUNT :</Box>
                                            <ActiveSelect
                                                items={YesOrNo}
                                                value={form.ALLOWDISCOUNT}
                                                onChange={(val) => handleChange("ALLOWDISCOUNT", val)}
                                                size="xs"
                                            />
                                        </Box>
                                        {formErrors.ALLOWDISCOUNT && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.ALLOWDISCOUNT}</Text>
                                        )}
                                    </Box>

                                    {/* EXPIRY DAYS */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">EXPIRY DAYS :</Box>
                                            <CapitalizedInput
                                                field="EXPIRYDAYS"
                                                value={form.EXPIRYDAYS}
                                                onChange={handleChange}
                                                size="2xs"
                                                type="number"
                                            />
                                        </Box>
                                        {formErrors.EXPIRYDAYS && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.EXPIRYDAYS}</Text>
                                        )}
                                    </Box>

                                    {/* ACTIVE */}
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="xs">ACTIVE :</Box>
                                            <ActiveSelect
                                                items={YesOrNo}
                                                value={form.ACTIVE}
                                                onChange={(val) => handleChange("ACTIVE", val)}
                                                size="xs"
                                            />
                                        </Box>
                                        {formErrors.ACTIVE && (
                                            <Text fontSize="xx-small" color="red.500">{formErrors.ACTIVE}</Text>
                                        )}
                                    </Box>

                                </Grid>
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
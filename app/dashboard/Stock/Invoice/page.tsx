"use client";

import { useState, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import { DynamicForm } from "@/component/form/DynamicForm";
import { InvoiceDetailsConfig } from "@/config/Stock/Invoice";
import { useAllProducts } from "@/hooks/product/useProducts";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { useTheme } from "@/context/theme/themeContext";
import { useAllVendors } from "@/hooks/Vendor/useVendor";
import { useAllSubProducts } from "@/hooks/SubProducts/useSubProducts";
import { useCascadeProductFilter } from "@/hooks/casaceProducts/useCasacadeproductFilter";

export default function InvoiceMaster() {
    const [vendors, setVendors] = useState<{ label: string; value: string }[]>([]);
    const [products, setProducts] = useState<{ label: string; value: string }[]>([]);
    const [subProducts, setSubProducts] = useState<{ label: string; value: string }[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [selectedSubProduct, setSelectedSubProduct] = useState<any>(null);

    const today = new Date();
    const [formData, setFormData] = useState<any>({
        VENDORCODE: "",
        ORIONBARCODE: "",
        PRODUCTCODE: "",
        SUBPRODUCTCODE: "",
        PIECES: "",
        WEIGHT: "",
        MRP: "",
        PURRATE: "",
        SELLINGRATE: "",
        MARKUPPER: 0,
        MARKUP: 0,
        INVOICENO: "",
        BILLDATE: today.toISOString().split("T")[0],
        TAGGEN: "",
        BILLTYPE: "",
        UNIQUEKEY: "",
        AMOUNT: 0,
        SGSTAMOUNT: 0,
        IGSTAMOUNT: 0,
        CGSTAMOUNT: 0,
        DISCOUNTAMOUNT: 0,
        HSNCODE: "",
        HSNTAXCODE: "",
        ENTRYORDER: "",
        HSNCALC: "",
        BILLSTATUS: "",
        IPID: "",
    });

    const [filter, setFilter] = useState<any>(null);
    const { theme } = useTheme();

    const { data: allVendors } = useAllVendors();
    const { data: allSubProducts } = useAllSubProducts();
    const { data: productsData } = useAllProducts();

    // Map products for select options
    useEffect(() => {
        setProducts(
            productsData?.map((product: any) => ({
                label: product.PRODUCTNAME,
                value: product.PRODUCTCODE,
            })) || []
        );
    }, [productsData]);

    useEffect(() => {
        setVendors(
            allVendors?.map((vendor: any) => ({
                label: vendor.VENDORNAME,
                value: vendor.VENDORCODE,
            })) || []
        );
    }, [allVendors]);

    useEffect(() => {
        setFilter({
            productCode: formData.PRODUCTCODE,
            subProductCode: formData.SUBPRODUCTCODE,
        });
    }, [formData.PRODUCTCODE, formData.SUBPRODUCTCODE]);

    const { data: filteredProducts } = useCascadeProductFilter(filter);

    useEffect(() => {
        setSubProducts(
            filteredProducts?.map((sub: any) => ({
                label: sub.subProductName,
                value: sub.subProductCode,
            })) || []
        );
    }, [filteredProducts]);

    // Load vendors/subproducts and generate form fields
    useEffect(() => {
        const config = InvoiceDetailsConfig({
            vendors,
            products,
            subProducts,
            todayDate: today,
        });
        setFields(config);
    }, [products, subProducts, vendors]);

    // Handle input changes
    const handleChange = (field: any, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));

        if (field === "SUBPRODUCTCODE") {
            const selected = filteredProducts?.find((f: any) => f.subProductCode == value);
            if (selected) {
                setSelectedSubProduct(selected);

                // Auto-fill basic fields (RATE, MRP, HSNCODE)
                setFormData((prev: any) => ({
                    ...prev,
                    RATE: selected.sellingRate,
                    MRP: selected.mrp,
                    SELLINGRATE: selected.sellingRate,
                    HSNCODE: selected.hsnCode,
                    HSNTAXCODE: selected.hsnTaxCode,

                    // PIECES: prev.PIECES || 1, // default 1
                    // AMOUNT: prev.PIECES ? prev.PIECES * selected.sellingRate : 0,
                    // IGSTAMOUNT: 0,
                    // CGSTAMOUNT: 0,
                    // SGSTAMOUNT: 0,
                }));
            }
        }

        // Only recalc amount/taxes if PIECES changes
        if (field === "PIECES" && selectedSubProduct) {
            const pieces = Number(value) || 0;
            const rate = Number(selectedSubProduct.sellingRate) || 0;

            const amt = pieces * rate;

            // Decide which tax codes to use
            const useBelow = rate < selectedSubProduct.belowSalesAmount;

            const igstRate = useBelow
                ? selectedSubProduct.belowIgstTaxCode
                : selectedSubProduct.aboveIgstTaxCode;

            const cgstRate = useBelow
                ? selectedSubProduct.belowCgstTaxCode
                : selectedSubProduct.aboveCgstTaxCode;

            const sgstRate = useBelow
                ? selectedSubProduct.belowSgstTaxCode
                : selectedSubProduct.aboveSgstTaxCode;

            setFormData((prev: any) => ({
                ...prev,
                AMOUNT: amt,
                IGSTAMOUNT: (igstRate || 0) * amt / 100,
                CGSTAMOUNT: (cgstRate || 0) * amt / 100,
                SGSTAMOUNT: (sgstRate || 0) * amt / 100,
            }));
        }

        // if (field === "DISCPER" && selectedSubProduct) {
        //     const pieces = Number(formData.PIECES) || 0;
        //     const rate = formData.RATE || Number(selectedSubProduct.sellingRate) || 0;
        //     const amt = pieces * rate;

        //     setFormData((prev: any) => ({
        //         ...prev,
        //         DISCOUNTAMOUNT: (amt * value) / 100,
        //     }))
        // }
    };
    const handleSave = () => {
        const payload = JSON.stringify(formData);
        console.log("Submitting payload:", payload);
    };

    const fieldSequence = fields.map((f) => f.name);
    const { register, focusNext } = useEnterNavigation(fieldSequence, handleSave);

    //Create disabled map: disable everything except INVOICENO and BILLDATE until subProduct selected
   
    return (
        <Box bg={theme.colors.formColor} p={2}>
            <Box display="grid">
                <Text
                    display="flex"
                    alignItems="center"
                    fontWeight="semibold"
                    fontSize="sm"
                    justifyContent="center"
                >
                    PURCHASE ENTRY
                </Text>

                <Box mt={4}>
                    {fields.length > 0 && (
                        <DynamicForm
                            fields={fields}
                            formData={formData}
                            onChange={handleChange}
                            register={register}
                            focusNext={focusNext}
                            grid
                          
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
}
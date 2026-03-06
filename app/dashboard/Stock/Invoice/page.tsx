// app/(dashboard)/invoice/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    SimpleGrid,
    Badge,
    Spinner,
    Center,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Grid,
    GridItem,
    IconButton,
    Separator,
    Field
} from "@chakra-ui/react";
import { 
    AiOutlineSave, 
    AiOutlineClear,
    AiOutlineArrowUp 
} from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaPrint, FaFileExcel, FaTrash } from "react-icons/fa";
import { Table } from "@chakra-ui/react/table";
import { useTheme } from "@/context/theme/themeContext";
import { Toaster } from "@/components/ui/toaster";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

import { CustomTable } from "@/component/table/CustomTable";
import {
    useAllInvoiceDetails,
    useInvoiceDetailsById,
    useCreateInvoiceDetails,
    useUpdateInvoiceDetails,
    useDeleteInvoiceDetails,
} from "@/hooks/Invoice/useInvoice";
import { InvoiceDetails, InvoiceDetailsForm } from "@/types/Invoice/Invoice";
import { useAllVendors } from "@/hooks/Vendor/useVendor";
import { useAllProducts } from "@/hooks/product/useProducts";
import { useAllSubProducts } from "@/hooks/SubProducts/useSubProducts";
import { useAllBarcodes } from "@/hooks/OrionBarcode/useOrionBarcode";

import { toastCreated, toastError, toastLoaded, toastUpdated, toastDeleted } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { InvoiceDetailsConfig } from "@/config/Stock/Invoice";
import { DynamicForm } from "@/component/form/DynamicForm";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { DeleteDialog } from "@/components/ui/DeleteDialog";

function InvoicePage() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();
    const tableRef = useRef<HTMLDivElement>(null);

    /* -------------------- API HOOKS -------------------- */
    const { data: invoiceDetailsData, refetch: refetchInvoiceDetails, isLoading, error } = useAllInvoiceDetails();
    
    // Safely handle the data - ensure it's an array
    const invoiceDetails = React.useMemo(() => {
        if (!invoiceDetailsData) return [];
        if (Array.isArray(invoiceDetailsData)) {
            return invoiceDetailsData;
        }
        if (invoiceDetailsData && typeof invoiceDetailsData === 'object' && 'data' in invoiceDetailsData && Array.isArray(invoiceDetailsData.data)) {
            return invoiceDetailsData.data;
        }
        if (invoiceDetailsData && typeof invoiceDetailsData === 'object' && 'results' in invoiceDetailsData && Array.isArray(invoiceDetailsData.results)) {
            return invoiceDetailsData.results;
        }
        if (invoiceDetailsData && typeof invoiceDetailsData === 'object' && 'IPID' in invoiceDetailsData) {
            return [invoiceDetailsData];
        }
        console.warn('Unexpected data format:', invoiceDetailsData);
        return [];
    }, [invoiceDetailsData]);

    const { data: vendorsData } = useAllVendors();
    const vendors = React.useMemo(() => {
        if (!vendorsData) return [];
        if (Array.isArray(vendorsData)) return vendorsData;
        if (vendorsData && typeof vendorsData === 'object' && 'data' in vendorsData && Array.isArray(vendorsData.data)) return vendorsData.data;
        return [];
    }, [vendorsData]);

    const { data: productsData } = useAllProducts();
    const products = React.useMemo(() => {
        if (!productsData) return [];
        if (Array.isArray(productsData)) return productsData;
        if (productsData && typeof productsData === 'object' && 'data' in productsData && Array.isArray(productsData.data)) return productsData.data;
        return [];
    }, [productsData]);

    const { data: subProductsData } = useAllSubProducts();
    const allSubProducts = React.useMemo(() => {
        if (!subProductsData) return [];
        if (Array.isArray(subProductsData)) return subProductsData;
        if (subProductsData && typeof subProductsData === 'object' && 'data' in subProductsData && Array.isArray(subProductsData.data)) return subProductsData.data;
        return [];
    }, [subProductsData]);

    const { data: barcodesData } = useAllBarcodes();
    const barcodes = React.useMemo(() => {
        if (!barcodesData) return [];
        if (Array.isArray(barcodesData)) return barcodesData;
        if (barcodesData && typeof barcodesData === 'object' && 'data' in barcodesData && Array.isArray(barcodesData.data)) return barcodesData.data;
        return [];
    }, [barcodesData]);

    const [editId, setEditId] = useState<string | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const { data: invoiceDetailById } = useInvoiceDetailsById(editId || "");
    const invoiceDetail = invoiceDetailById ?? null;

    const { mutate: createInvoiceDetails } = useCreateInvoiceDetails();
    const { mutate: updateInvoiceDetails } = useUpdateInvoiceDetails();
    const { mutate: deleteInvoiceDetails } = useDeleteInvoiceDetails();

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<InvoiceDetailsForm>({
        ROWSIGN: "I",
        VENDORCODE: "",
        ORIONBARCODE: "",
        PRODUCTCODE: "",
        SUBPRODUCTCODE: "",
        PIECES: "1",
        WEIGHT: "0",
        MRP: "",
        PURRATE: "",
        SELLINGRATE: "",
        MARKUPPER: "0",
        INVOICENO: `INV-${new Date().getTime().toString().slice(-8)}`,
        BILLDATE: new Date().toISOString().split('T')[0],
        BILLNO: new Date().getTime().toString().slice(-8),
        UNITCODE: "1",
        TAXPER: "18",
        DISCPER: "0",
        HSNCODE: "",
        BILLSTATUS: "PENDING",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [filteredSubProducts, setFilteredSubProducts] = useState<any[]>([]);

    // Calculate derived values
    const [calculatedValues, setCalculatedValues] = useState({
        AMOUNT: 0,
        TOTALAMOUNT: 0,
        TAXAMOUNT: 0,
        DISCOUNT: 0,
        MARKUP: 0,
        SGSTAMOUNT: 0,
        CGSTAMOUNT: 0,
        IGSTAMOUNT: 0,
    });

    // Prepare vendors with string values for dropdown
    const vendorsForDropdown = useMemo(() => {
        return vendors.map((v: any) => ({
            ...v,
            VENDORCODE: v.VENDORCODE?.toString()
        }));
    }, [vendors]);

    // Prepare products with string values for dropdown
    const productsForDropdown = useMemo(() => {
        return products.map((p: any) => ({
            ...p,
            PRODUCTCODE: p.PRODUCTCODE?.toString()
        }));
    }, [products]);

    // Filter subproducts based on selected product
    useEffect(() => {
        if (form.PRODUCTCODE && allSubProducts.length > 0) {
            const filtered = allSubProducts.filter(
                (s: any) => s.PRODUCTCODE?.toString() === form.PRODUCTCODE.toString()
            );
            setFilteredSubProducts(filtered);
            
            // Clear subproduct if it doesn't belong to selected product
            if (form.SUBPRODUCTCODE) {
                const stillValid = filtered.some(
                    (s: any) => s.SUBPRODUCTCODE?.toString() === form.SUBPRODUCTCODE.toString()
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

    // Prepare subproducts with string values for dropdown
    const subProductsForDropdown = useMemo(() => {
        return filteredSubProducts.map((s: any) => ({
            ...s,
            SUBPRODUCTCODE: s.SUBPRODUCTCODE?.toString()
        }));
    }, [filteredSubProducts]);

    // Calculate all values when relevant fields change
    useEffect(() => {
        calculateAll();
    }, [
        form.PIECES, 
        form.WEIGHT, 
        form.MRP, 
        form.PURRATE, 
        form.MARKUPPER, 
        form.TAXPER, 
        form.DISCPER
    ]);

    const calculateAll = () => {
        const pieces = parseFloat(form.PIECES) || 1;
        const weight = parseFloat(form.WEIGHT) || 0;
        const mrp = parseFloat(form.MRP) || 0;
        const purRate = parseFloat(form.PURRATE) || 0;
        const markUpper = parseFloat(form.MARKUPPER) || 0;
        const taxPer = parseFloat(form.TAXPER) || 18;
        const discPer = parseFloat(form.DISCPER) || 0;

        // Calculate quantity based on pieces/weight
        const quantity = weight > 0 ? weight : pieces;
        
        // Calculate discount
        const discount = (mrp * quantity * discPer) / 100;
        
        // Calculate markup
        const markup = (purRate * quantity * markUpper) / 100;
        
        // Calculate selling rate with markup
        const sellingRate = purRate + (purRate * markUpper / 100);
        
        // Calculate amount
        const amount = sellingRate * quantity;
        
        // Calculate tax amount
        const taxAmount = (amount * taxPer) / 100;
        
        // Calculate GST splits (assuming 50/50 for intra-state)
        const sgstAmount = taxAmount / 2;
        const cgstAmount = taxAmount / 2;
        const igstAmount = taxAmount; // For inter-state
        
        // Calculate total amount
        const totalAmount = amount + taxAmount - discount;

        setCalculatedValues({
            AMOUNT: amount,
            TOTALAMOUNT: totalAmount,
            TAXAMOUNT: taxAmount,
            DISCOUNT: discount,
            MARKUP: markup,
            SGSTAMOUNT: sgstAmount,
            CGSTAMOUNT: cgstAmount,
            IGSTAMOUNT: igstAmount,
        });

        // Update selling rate in form
        setForm(prev => ({
            ...prev,
            SELLINGRATE: sellingRate.toFixed(2)
        }));
    };

    /* -------------------- BARCODE SCAN HANDLER -------------------- */
    const handleBarcodeScan = (barcode: string) => {
        const foundBarcode = barcodes.find((b: any) => b.ORIONBARCODE === barcode);
        
        if (foundBarcode) {
            const product = products.find((p: any) => p.PRODUCTCODE === foundBarcode.PRODUCTCODE);
            
            setForm(prev => ({
                ...prev,
                ORIONBARCODE: barcode,
                PRODUCTCODE: foundBarcode.PRODUCTCODE?.toString() || "",
                VENDORCODE: foundBarcode.VENDORCODE?.toString() || prev.VENDORCODE,
                SUBPRODUCTCODE: foundBarcode.SUBPRODUCTCODE?.toString() || "",
                MRP: foundBarcode.MRP?.toString() || "",
                PURRATE: foundBarcode.PURRATE?.toString() || "",
                UNITCODE: product?.UNITCODE?.toString() || "1",
            }));

            toastLoaded("Product found from barcode");
        } else {
            toastError("Barcode not found");
        }
    };

    /* -------------------- USE EFFECTS -------------------- */
    useEffect(() => {
        if (!invoiceDetail) return;

        console.log('Loading invoice detail for edit:', invoiceDetail);
        
        setForm({
            ROWSIGN: invoiceDetail.ROWSIGN || "I",
            VENDORCODE: invoiceDetail.vendor?.VENDORCODE?.toString() || invoiceDetail.VENDORCODE?.toString() || "",
            ORIONBARCODE: invoiceDetail.ORIONBARCODE || "",
            PRODUCTCODE: invoiceDetail.product?.PRODUCTCODE?.toString() || invoiceDetail.PRODUCTCODE?.toString() || "",
            SUBPRODUCTCODE: invoiceDetail.subProduct?.SUBPRODUCTCODE?.toString() || invoiceDetail.SUBPRODUCTCODE?.toString() || "",
            PIECES: invoiceDetail.PIECES?.toString() || "1",
            WEIGHT: invoiceDetail.WEIGHT?.toString() || "0",
            MRP: invoiceDetail.MRP?.toString() || "",
            PURRATE: invoiceDetail.PURRATE?.toString() || "",
            SELLINGRATE: invoiceDetail.SELLINGRATE?.toString() || "",
            MARKUPPER: invoiceDetail.MARKUPPER?.toString() || "0",
            INVOICENO: invoiceDetail.INVOICENO || `INV-${new Date().getTime().toString().slice(-8)}`,
            BILLDATE: invoiceDetail.BILLDATE || new Date().toISOString().split('T')[0],
            BILLNO: invoiceDetail.BILLNO?.toString() || new Date().getTime().toString().slice(-8),
            UNITCODE: invoiceDetail.UNITCODE?.toString() || "1",
            TAXPER: invoiceDetail.TAXPER?.toString() || "18",
            DISCPER: invoiceDetail.DISCPER?.toString() || "0",
            HSNCODE: invoiceDetail.HSNCODE || "",
            BILLSTATUS: invoiceDetail.BILLSTATUS || "PENDING",
        });

        setTimeout(() => {
            toastLoaded("Invoice Detail");
            ScrollToTop();
        }, 100);
    }, [invoiceDetail]);

    useEffect(() => {
        if (!highlightedId) return;
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [highlightedId]);

    // Scroll to top after edit/save
    useEffect(() => {
        if (editId) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [editId]);

    // Handle scroll button visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollButton(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTable = () => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: any, value: any) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Handle barcode scan
        if (field === "ORIONBARCODE" && value.length > 5) {
            handleBarcodeScan(value);
        }
    };

    const resetForm = () => {
        setEditId(null);
        setForm({
            ROWSIGN: "I",
            VENDORCODE: "",
            ORIONBARCODE: "",
            PRODUCTCODE: "",
            SUBPRODUCTCODE: "",
            PIECES: "1",
            WEIGHT: "0",
            MRP: "",
            PURRATE: "",
            SELLINGRATE: "",
            MARKUPPER: "0",
            INVOICENO: `INV-${new Date().getTime().toString().slice(-8)}`,
            BILLDATE: new Date().toISOString().split('T')[0],
            BILLNO: new Date().getTime().toString().slice(-8),
            UNITCODE: "1",
            TAXPER: "18",
            DISCPER: "0",
            HSNCODE: "",
            BILLSTATUS: "PENDING",
        });
        setFormErrors({});
        setCalculatedValues({
            AMOUNT: 0,
            TOTALAMOUNT: 0,
            TAXAMOUNT: 0,
            DISCOUNT: 0,
            MARKUP: 0,
            SGSTAMOUNT: 0,
            CGSTAMOUNT: 0,
            IGSTAMOUNT: 0,
        });
    };

    const handleEdit = (invoiceDetail: any) => {
        console.log('Editing invoice detail:', invoiceDetail);
        setEditId(invoiceDetail.IPID?.toString() || "");
    };

    const handleSave = () => {
        const errors: Record<string, string> = {};

        // Validation
        if (!form.VENDORCODE) errors.VENDORCODE = "Vendor is required";
        if (!form.ORIONBARCODE) errors.ORIONBARCODE = "Barcode is required";
        if (!form.PRODUCTCODE) errors.PRODUCTCODE = "Product is required";
        if (!form.MRP) errors.MRP = "MRP is required";
        if (!form.PURRATE) errors.PURRATE = "Purchase Rate is required";
        if (!form.INVOICENO) errors.INVOICENO = "Invoice No is required";
        if (!form.BILLDATE) errors.BILLDATE = "Bill Date is required";

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const payload: InvoiceDetails = {
            ROWSIGN: form.ROWSIGN,
            VENDORCODE: Number(form.VENDORCODE),
            ORIONBARCODE: form.ORIONBARCODE,
            PRODUCTCODE: Number(form.PRODUCTCODE),
            SUBPRODUCTCODE: form.SUBPRODUCTCODE ? Number(form.SUBPRODUCTCODE) : undefined,
            PIECES: Number(form.PIECES),
            WEIGHT: Number(form.WEIGHT),
            MRP: Number(form.MRP),
            PURRATE: Number(form.PURRATE),
            SELLINGRATE: Number(form.SELLINGRATE) || calculatedValues.AMOUNT / (Number(form.PIECES) || 1),
            MARKUPPER: Number(form.MARKUPPER),
            MARKUP: calculatedValues.MARKUP,
            INVOICENO: form.INVOICENO,
            BILLDATE: form.BILLDATE,
            BILLNO: Number(form.BILLNO),
            UNITCODE: Number(form.UNITCODE),
            AMOUNT: calculatedValues.AMOUNT,
            TOTALAMOUNT: calculatedValues.TOTALAMOUNT,
            TAXPER: Number(form.TAXPER),
            TAXAMOUNT: calculatedValues.TAXAMOUNT,
            DISCPER: Number(form.DISCPER),
            DISCOUNT: calculatedValues.DISCOUNT,
            HSNCODE: form.HSNCODE,
            SGSTAMOUNT: calculatedValues.SGSTAMOUNT,
            CGSTAMOUNT: calculatedValues.CGSTAMOUNT,
            IGSTAMOUNT: calculatedValues.IGSTAMOUNT,
            BILLSTATUS: form.BILLSTATUS,
            CREATEDBY: 1,
        };

        console.log('Saving payload:', payload);

        if (editId) {
            updateInvoiceDetails({
                id: editId,
                invoice: payload
            }, {
                onSuccess: () => {
                    refetchInvoiceDetails();
                    resetForm();
                    setHighlightedId(Number(editId));
                    toastUpdated("Invoice Detail");
                },
                onError: (error) => {
                    console.error('Update error:', error);
                    toastError("Failed to update invoice detail");
                },
            });
        } else {
            createInvoiceDetails({
                invoice: payload,
                createdBy: 1
            }, {
                onSuccess: () => {
                    refetchInvoiceDetails();
                    resetForm();
                    toastCreated("Invoice Detail");
                },
                onError: (error) => {
                    console.error('Create error:', error);
                    toastError("Failed to create invoice detail");
                },
            });
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteId) {
            deleteInvoiceDetails(deleteId, {
                onSuccess: () => {
                    refetchInvoiceDetails();
                    toastDeleted("Invoice Detail");
                    setIsDeleteDialogOpen(false);
                    setDeleteId(null);
                },
                onError: (error) => {
                    console.error('Delete error:', error);
                    toastError("Failed to delete invoice detail");
                },
            });
        }
    };

    // Helper functions to get names from codes
    const getVendorName = (detail: any) => {
        if (detail.vendor?.VENDORNAME) return detail.vendor.VENDORNAME;
        const vendor = vendors.find((v: any) => v.VENDORCODE === detail.VENDORCODE);
        return vendor?.VENDORNAME || detail.VENDORCODE?.toString() || '-';
    };

    const getProductName = (detail: any) => {
        if (detail.product?.PRODUCTNAME) return detail.product.PRODUCTNAME;
        const product = products.find((p: any) => p.PRODUCTCODE === detail.PRODUCTCODE);
        return product?.PRODUCTNAME || detail.PRODUCTCODE?.toString() || '-';
    };

    const getSubProductName = (detail: any) => {
        if (detail.subProduct?.SUBPRODUCTNAME) return detail.subProduct.SUBPRODUCTNAME;
        if (!detail.SUBPRODUCTCODE) return '-';
        const subProduct = allSubProducts.find((sp: any) => sp.SUBPRODUCTCODE === detail.SUBPRODUCTCODE);
        return subProduct?.SUBPRODUCTNAME || detail.SUBPRODUCTCODE?.toString() || '-';
    };

    const InvoiceColumns = [
        { key: "actions", label: "Actions" },
        { key: "IPID", label: "ID" },
        { key: "INVOICENO", label: "Invoice No" },
        { key: "BILLDATE", label: "Bill Date" },
        { key: "VENDORNAME", label: "Vendor" },
        { key: "PRODUCTNAME", label: "Product" },
        { key: "SUBPRODUCTNAME", label: "Sub Product" },
        { key: "PIECES", label: "Pcs" },
        { key: "WEIGHT", label: "Wt" },
        { key: "MRP", label: "MRP" },
        { key: "PURRATE", label: "Pur Rate" },
        { key: "SELLINGRATE", label: "Sell Rate" },
        { key: "AMOUNT", label: "Amount" },
        { key: "TAXAMOUNT", label: "Tax" },
        { key: "TOTALAMOUNT", label: "Total" },
        { key: "BILLSTATUS", label: "Status" },
    ];

    const handleExport = (option: string) => {
        const exportData = invoiceDetails.map((detail: any) => ({
            IPID: detail.IPID,
            INVOICENO: detail.INVOICENO,
            BILLDATE: detail.BILLDATE,
            VENDORNAME: getVendorName(detail),
            PRODUCTNAME: getProductName(detail),
            SUBPRODUCTNAME: getSubProductName(detail),
            PIECES: detail.PIECES,
            WEIGHT: detail.WEIGHT,
            MRP: `₹${detail.MRP}`,
            PURRATE: `₹${detail.PURRATE}`,
            SELLINGRATE: `₹${detail.SELLINGRATE}`,
            AMOUNT: `₹${detail.AMOUNT?.toFixed(2)}`,
            TAXAMOUNT: `₹${detail.TAXAMOUNT?.toFixed(2)}`,
            TOTALAMOUNT: `₹${detail.TOTALAMOUNT?.toFixed(2)}`,
            BILLSTATUS: detail.BILLSTATUS,
        }));

        setData(exportData);
        setColumns(InvoiceColumns.filter(col => col.key !== "actions"));
        setShowSno(true);
        title?.("Invoice Details");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- FORM CONFIG -------------------- */
    const invoiceFormFields = InvoiceDetailsConfig(
        vendorsForDropdown, 
        productsForDropdown, 
        subProductsForDropdown
    );

    // Define the sections for 3-column layout
    const formSections = [
        {
            title: "Basic Information",
            fields: ["ROWSIGN", "VENDORCODE", "ORIONBARCODE", "PRODUCTCODE", "SUBPRODUCTCODE"]
        },
        {
            title: "Product Details & Rates",
            fields: ["PIECES", "WEIGHT", "MRP", "PURRATE", "SELLINGRATE", "MARKUPPER"]
        },
        {
            title: "Invoice & Tax Details",
            fields: ["INVOICENO", "BILLDATE", "BILLNO", "UNITCODE", "TAXPER", "DISCPER", "HSNCODE", "BILLSTATUS"]
        }
    ];

    const fieldSequence = invoiceFormFields.map(f => f.name);
    const { register, focusNext } = useEnterNavigation(fieldSequence, handleSave);

    // Show loading state
    if (isLoading) {
        return (
            <Center h="200px">
                <Spinner size="xl" />
            </Center>
        );
    }

    // Show error state
    if (error) {
        return (
            <Center h="200px">
                <Text color="red.500">Error loading data: {error.message}</Text>
            </Center>
        );
    }

    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary} minH="100vh" p={4}>
            <Toaster />
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Invoice Detail"
                message="Are you sure you want to delete this invoice detail? This action cannot be undone."
            />

            <VStack spacing={6} align="stretch">
                {/* ---------------- FORM CARD WITH 3-COLUMN LAYOUT ---------------- */}
                <Card.Root variant="outline" bg={theme.colors.formColor} borderRadius="xl" border="1px solid #eef">
                    <CardHeader>
                        <Text fontSize="md" fontWeight="600">
                            INVOICE {editId ? 'EDIT' : 'DETAILS'}
                        </Text>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={6} align="stretch">
                            {/* 3-Column Layout for Form Fields */}
                            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                                {/* Column 1 - Basic Information */}
                                <GridItem>
                                    <VStack align="stretch" spacing={4}>
                                        <Text fontSize="sm" fontWeight="500" color="gray.600" borderBottom="1px solid" borderColor="gray.200" pb={1}>
                                            Basic Information
                                        </Text>
                                        {formSections[0].fields.map(fieldName => {
                                            const field = invoiceFormFields.find(f => f.name === fieldName);
                                            if (!field) return null;
                                            return (
                                                <Box key={field.name}>
                                                    <DynamicForm
                                                        fields={[field]}
                                                        formData={form}
                                                        onChange={handleChange}
                                                        register={register}
                                                        focusNext={focusNext}
                                                        errors={formErrors}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </GridItem>

                                {/* Column 2 - Product Details & Rates */}
                                <GridItem>
                                    <VStack align="stretch" spacing={4}>
                                        <Text fontSize="sm" fontWeight="500" color="gray.600" borderBottom="1px solid" borderColor="gray.200" pb={1}>
                                            Product Details & Rates
                                        </Text>
                                        {formSections[1].fields.map(fieldName => {
                                            const field = invoiceFormFields.find(f => f.name === fieldName);
                                            if (!field) return null;
                                            return (
                                                <Box key={field.name}>
                                                    <DynamicForm
                                                        fields={[field]}
                                                        formData={form}
                                                        onChange={handleChange}
                                                        register={register}
                                                        focusNext={focusNext}
                                                        errors={formErrors}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </GridItem>

                                {/* Column 3 - Invoice & Tax Details */}
                                <GridItem>
                                    <VStack align="stretch" spacing={4}>
                                        <Text fontSize="sm" fontWeight="500" color="gray.600" borderBottom="1px solid" borderColor="gray.200" pb={1}>
                                            Invoice & Tax Details
                                        </Text>
                                        {formSections[2].fields.map(fieldName => {
                                            const field = invoiceFormFields.find(f => f.name === fieldName);
                                            if (!field) return null;
                                            return (
                                                <Box key={field.name}>
                                                    <DynamicForm
                                                        fields={[field]}
                                                        formData={form}
                                                        onChange={handleChange}
                                                        register={register}
                                                        focusNext={focusNext}
                                                        errors={formErrors}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </GridItem>
                            </Grid>

                            <Separator />

                            {/* Calculated Values Summary - Full Width */}
                            <Box>
                                <Text fontSize="sm" fontWeight="500" mb={3} color="gray.600">Calculated Values</Text>
                                <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                                    <Box p={3} bg="blue.50" borderRadius="lg">
                                        <Text fontSize="xs" color="gray.600">Amount</Text>
                                        <Text fontSize="md" fontWeight="bold" color="blue.700">₹{calculatedValues.AMOUNT.toFixed(2)}</Text>
                                    </Box>
                                    <Box p={3} bg="green.50" borderRadius="lg">
                                        <Text fontSize="xs" color="gray.600">Tax Amount</Text>
                                        <Text fontSize="md" fontWeight="bold" color="green.700">₹{calculatedValues.TAXAMOUNT.toFixed(2)}</Text>
                                    </Box>
                                    <Box p={3} bg="purple.50" borderRadius="lg">
                                        <Text fontSize="xs" color="gray.600">Discount</Text>
                                        <Text fontSize="md" fontWeight="bold" color="purple.700">-₹{calculatedValues.DISCOUNT.toFixed(2)}</Text>
                                    </Box>
                                    <Box p={3} bg="orange.50" borderRadius="lg">
                                        <Text fontSize="xs" color="gray.600">Total Amount</Text>
                                        <Text fontSize="md" fontWeight="bold" color="orange.700">₹{calculatedValues.TOTALAMOUNT.toFixed(2)}</Text>
                                    </Box>
                                </Grid>
                            </Box>

                            {/* GST Breakup - Full Width */}
                            <Box>
                                <Text fontSize="sm" fontWeight="500" mb={3} color="gray.600">GST Breakup</Text>
                                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                    <Box p={2} bg="gray.50" borderRadius="lg" textAlign="center">
                                        <Text fontSize="xs" color="gray.600">SGST</Text>
                                        <Text fontSize="sm" fontWeight="bold">₹{calculatedValues.SGSTAMOUNT.toFixed(2)}</Text>
                                    </Box>
                                    <Box p={2} bg="gray.50" borderRadius="lg" textAlign="center">
                                        <Text fontSize="xs" color="gray.600">CGST</Text>
                                        <Text fontSize="sm" fontWeight="bold">₹{calculatedValues.CGSTAMOUNT.toFixed(2)}</Text>
                                    </Box>
                                    <Box p={2} bg="gray.50" borderRadius="lg" textAlign="center">
                                        <Text fontSize="xs" color="gray.600">IGST</Text>
                                        <Text fontSize="sm" fontWeight="bold">₹{calculatedValues.IGSTAMOUNT.toFixed(2)}</Text>
                                    </Box>
                                </Grid>
                            </Box>
                        </VStack>
                    </CardBody>
                    <CardFooter>
                        <HStack spacing={4} justify="flex-end" width="100%">
                            <Button size="sm" colorPalette="blue" onClick={handleSave}>
                                <AiOutlineSave /> {editId ? "Update" : "Save"}
                            </Button>
                            <Button size="sm" colorPalette="blue" variant="outline" onClick={resetForm}>
                                <AiOutlineClear /> Clear
                            </Button>
                            <Button size="sm" colorPalette="blue" variant="ghost" onClick={resetForm}>
                                <IoIosExit /> Exit
                            </Button>
                            {invoiceDetails.length > 0 && (
                                <Button size="sm" colorPalette="gray" variant="outline" onClick={scrollToTable}>
                                    View List ↓
                                </Button>
                            )}
                        </HStack>
                    </CardFooter>
                </Card.Root>

                {/* ---------------- TABLE CARD ---------------- */}
                <Card.Root 
                    ref={tableRef}
                    variant="outline" 
                    bg={theme.colors.formColor} 
                    borderRadius="xl" 
                    border="1px solid #eef"
                >
                    <CardHeader>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Text fontWeight="semibold" fontSize="md">
                                INVOICE DETAILS LIST ({invoiceDetails.length} items)
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
                    </CardHeader>
                    <CardBody overflowX="auto">
                        <CustomTable
                            columns={InvoiceColumns}
                            data={invoiceDetails}
                            headerBg={theme.colors.accient}
                            headerColor="white"
                            renderRow={(detail: any, index: number) => (
                                <>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" alignItems='center' gap={2}>
                                            <IconButton
                                                aria-label="Edit"
                                                size="xs"
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => handleEdit(detail)}
                                                icon={<FaEdit />}
                                            />
                                            <IconButton
                                                aria-label="Delete"
                                                size="xs"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(detail.IPID?.toString())}
                                                icon={<FaTrash />}
                                            />
                                        </Box>
                                    </Table.Cell>
                                    <Table.Cell>{detail.IPID}</Table.Cell>
                                    <Table.Cell>{detail.INVOICENO}</Table.Cell>
                                    <Table.Cell>{detail.BILLDATE}</Table.Cell>
                                    <Table.Cell>{getVendorName(detail)}</Table.Cell>
                                    <Table.Cell>{getProductName(detail)}</Table.Cell>
                                    <Table.Cell>{getSubProductName(detail)}</Table.Cell>
                                    <Table.Cell>{detail.PIECES}</Table.Cell>
                                    <Table.Cell>{detail.WEIGHT}</Table.Cell>
                                    <Table.Cell>₹{detail.MRP}</Table.Cell>
                                    <Table.Cell>₹{detail.PURRATE}</Table.Cell>
                                    <Table.Cell>₹{detail.SELLINGRATE}</Table.Cell>
                                    <Table.Cell>₹{detail.AMOUNT?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>₹{detail.TAXAMOUNT?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>₹{detail.TOTALAMOUNT?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorScheme={detail.BILLSTATUS === "PAID" ? "green" : "yellow"}>
                                            {detail.BILLSTATUS}
                                        </Badge>
                                    </Table.Cell>
                                </>
                            )}
                            highlightRowId={highlightedId}
                            rowIdKey="IPID"
                            emptyText="No invoice details available"
                        />
                    </CardBody>
                </Card.Root>
            </VStack>

            {/* Scroll to top button */}
            {showScrollButton && (
                <IconButton
                    aria-label="Scroll to top"
                    position="fixed"
                    bottom="20px"
                    right="20px"
                    colorScheme="blue"
                    rounded="full"
                    onClick={scrollToTop}
                    icon={<AiOutlineArrowUp />}
                    size="lg"
                    boxShadow="lg"
                />
            )}
        </Box>
    );
}

export default InvoicePage;
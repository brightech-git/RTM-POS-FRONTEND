// app/(dashboard)/invoice/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
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
    Kbd,
    Alert,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import { 
    AiOutlineSave, 
    AiOutlineClear,
    AiOutlineArrowUp,
    AiOutlineReload 
} from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaPrint, FaFileExcel, FaTrash } from "react-icons/fa";
import { Table } from "@chakra-ui/react/table";
import { useTheme } from "@/context/theme/themeContext";
import { Toaster } from "@/components/ui/toaster";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

// Import the selection modal
import { SelectionModal } from "@/components/Modals/SelectionModal";
import { useGlobalKey } from "@/components/key/useGlobalKey";

import { CustomTable } from "@/component/table/CustomTable";
import {
    useAllInvoiceDetails,
    useInvoiceDetailsById,
    useCreateInvoiceDetails,
    useUpdateInvoiceDetails,
    useDeleteInvoiceDetails,
    usePreviewRowSign,
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

// Extended form interface to match API structure
interface ExtendedInvoiceForm extends InvoiceDetailsForm {
    DISCOUNTAMOUNT?: string;
    MARKUPAMOUNT?: string;
    NETAMOUNT?: string;
    TAXAMOUNT?: string;
    IGSTAMOUNT?: string;
    CGSTAMOUNT?: string;
    SGSTAMOUNT?: string;
    IGSTPER?: string;
    CGSTPER?: string;
    SGSTPER?: string;
    ROWSIGN?: string;
    BILLNO?: string;
    UNITCODE?: string;
    TAXPER?: string;
    ENTRYORDER?: string;
    BILLSTATUS?: string;
    UNIQUEKEY?: string;
    BILLTYPE?: string;
}

function InvoicePage() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();
    const tableRef = useRef<HTMLDivElement>(null);

    /* -------------------- API HOOKS -------------------- */
    const { data: invoiceDetailsData, refetch: refetchInvoiceDetails, isLoading, error, isError } = useAllInvoiceDetails();
    
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

    const { data: vendorsData, isLoading: vendorsLoading, error: vendorsError } = useAllVendors();
    const vendors = React.useMemo(() => {
        if (!vendorsData) return [];
        if (Array.isArray(vendorsData)) return vendorsData;
        if (vendorsData && typeof vendorsData === 'object' && 'data' in vendorsData && Array.isArray(vendorsData.data)) return vendorsData.data;
        return [];
    }, [vendorsData]);

    const { data: productsData, isLoading: productsLoading, error: productsError } = useAllProducts();
    const products = React.useMemo(() => {
        if (!productsData) return [];
        if (Array.isArray(productsData)) return productsData;
        if (productsData && typeof productsData === 'object' && 'data' in productsData && Array.isArray(productsData.data)) return productsData.data;
        return [];
    }, [productsData]);

    const { data: subProductsData, isLoading: subProductsLoading, error: subProductsError } = useAllSubProducts();
    const allSubProducts = React.useMemo(() => {
        if (!subProductsData) return [];
        if (Array.isArray(subProductsData)) return subProductsData;
        if (subProductsData && typeof subProductsData === 'object' && 'data' in subProductsData && Array.isArray(subProductsData.data)) return subProductsData.data;
        return [];
    }, [subProductsData]);

    const { data: barcodesData, isLoading: barcodesLoading, error: barcodesError } = useAllBarcodes();
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

    // Modal state
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSubProductModalOpen, setIsSubProductModalOpen] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const { data: invoiceDetailById } = useInvoiceDetailsById(editId || "");
    const invoiceDetail = invoiceDetailById ?? null;

    const { mutate: createInvoiceDetails } = useCreateInvoiceDetails();
    const { mutate: updateInvoiceDetails } = useUpdateInvoiceDetails();
    const { mutate: deleteInvoiceDetails } = useDeleteInvoiceDetails();

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<ExtendedInvoiceForm>({
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
        TAGGEN: "Y",
        HSNCODE: "",
        HSNTAXCODE: "",
        BILLSTATUS: "PENDING",
        TAXPER: "18",
        DISCPER: "0",
        // Calculated fields
        DISCOUNTAMOUNT: "0",
        MARKUPAMOUNT: "0",
        AMOUNT: "0",
        NETAMOUNT: "0",
        TAXAMOUNT: "0",
        IGSTAMOUNT: "0",
        CGSTAMOUNT: "0",
        SGSTAMOUNT: "0",
        IGSTPER: "9",
        CGSTPER: "9",
        SGSTPER: "9",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [filteredSubProducts, setFilteredSubProducts] = useState<any[]>([]);

    // Calculate all values when relevant fields change
    useEffect(() => {
        calculateAll();
    }, [
        form.PIECES, 
        form.WEIGHT, 
        form.MRP, 
        form.PURRATE, 
        form.MARKUPPER,
        form.DISCPER,
        form.TAXPER
    ]);

    const calculateAll = () => {
        const pieces = parseFloat(form.PIECES || "1");
        const weight = parseFloat(form.WEIGHT || "0");
        const mrp = parseFloat(form.MRP || "0");
        const purRate = parseFloat(form.PURRATE || "0");
        const markUpper = parseFloat(form.MARKUPPER || "0");
        const discPer = parseFloat(form.DISCPER || "0");
        const taxPer = parseFloat(form.TAXPER || "18");

        // Determine quantity (use weight if available, otherwise pieces)
        const quantity = weight > 0 ? weight : pieces;
        
        // Calculate selling rate with markup
        const sellingRate = purRate + (purRate * markUpper / 100);
        
        // Calculate amount (Pieces × Purchase Rate)
        const amount = quantity * purRate;
        
        // Calculate markup amount
        const markupAmount = (purRate * quantity * markUpper) / 100;
        
        // Calculate discount amount
        const discountAmount = (amount * discPer) / 100;
        
        // Calculate taxable amount after discount
        const taxableAmount = amount - discountAmount;
        
        // Calculate tax amount
        const taxAmount = (taxableAmount * taxPer) / 100;
        
        // Calculate GST splits (assuming 50/50 for intra-state)
        const sgstAmount = taxAmount / 2;
        const cgstAmount = taxAmount / 2;
        const igstAmount = taxAmount;
        
        // Calculate net amount
        const netAmount = taxableAmount + taxAmount;

        // Update form with calculated values
        setForm(prev => ({
            ...prev,
            SELLINGRATE: sellingRate.toFixed(2),
            AMOUNT: amount.toFixed(2),
            MARKUPAMOUNT: markupAmount.toFixed(2),
            DISCOUNTAMOUNT: discountAmount.toFixed(2),
            TAXAMOUNT: taxAmount.toFixed(2),
            IGSTAMOUNT: igstAmount.toFixed(2),
            CGSTAMOUNT: cgstAmount.toFixed(2),
            SGSTAMOUNT: sgstAmount.toFixed(2),
            NETAMOUNT: netAmount.toFixed(2),
        }));
    };

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

    /* -------------------- MODAL HANDLERS -------------------- */
const handleProductSelect = (product: any) => {
    setForm(prev => ({
        ...prev,
        PRODUCTCODE: product.PRODUCTCODE?.toString() || "",
        MRP: product.MRP?.toString() || prev.MRP,
        PURRATE: product.PURRATE?.toString() || prev.PURRATE,
        UNITCODE: product.UNITCODE?.toString() || "1",
    }));
    
    // Automatically focus on next field after selection
    setTimeout(() => {
        const nextField = document.querySelector('[name="SUBPRODUCTCODE"]') as HTMLInputElement;
        if (nextField) {
            nextField.focus();
        }
    }, 100);
    
    toastLoaded(`Product selected: ${product.PRODUCTNAME || product.PRODUCTCODE}`);
    setIsProductModalOpen(false);
};

const handleSubProductSelect = (subProduct: any) => {
    setForm(prev => ({
        ...prev,
        SUBPRODUCTCODE: subProduct.SUBPRODUCTCODE?.toString() || "",
        MRP: subProduct.MRP?.toString() || prev.MRP,
        PURRATE: subProduct.PURRATE?.toString() || prev.PURRATE,
    }));
    
    // Automatically focus on next field after selection
    setTimeout(() => {
        const nextField = document.querySelector('[name="PIECES"]') as HTMLInputElement;
        if (nextField) {
            nextField.focus();
        }
    }, 100);
    
    toastLoaded(`Sub Product selected: ${subProduct.SUBPRODUCTNAME || subProduct.SUBPRODUCTCODE}`);
    setIsSubProductModalOpen(false);
};

// Update the F2 key handler to be more precise
useGlobalKey("F2", (e) => {
    e.preventDefault();
    const activeElement = document.activeElement;
    
    if (activeElement instanceof HTMLInputElement) {
        const inputName = activeElement.name;
        
        if (inputName === "PRODUCTCODE") {
            setIsProductModalOpen(true);
        } else if (inputName === "SUBPRODUCTCODE") {
            if (form.PRODUCTCODE) {
                setIsSubProductModalOpen(true);
            } else {
                toastError("Please select a product first");
                // Focus on product field
                const productField = document.querySelector('[name="PRODUCTCODE"]') as HTMLInputElement;
                if (productField) productField.focus();
            }
        }
    }
}, "invoice-page");

    const handleInputFocus = (fieldName: string) => {
        setFocusedField(fieldName);
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
            TAGGEN: invoiceDetail.TAGGEN || "Y",
            HSNCODE: invoiceDetail.HSNCODE || "",
            HSNTAXCODE: invoiceDetail.HSNTAXCODE?.toString() || "",
            BILLSTATUS: invoiceDetail.BILLSTATUS || "PENDING",
            TAXPER: invoiceDetail.TAXPER?.toString() || "18",
            DISCPER: invoiceDetail.DISCPER?.toString() || "0",
            // Calculated fields
            DISCOUNTAMOUNT: invoiceDetail.DISCOUNT?.toString() || "0",
            MARKUPAMOUNT: invoiceDetail.MARKUP?.toString() || "0",
            AMOUNT: invoiceDetail.AMOUNT?.toString() || "0",
            NETAMOUNT: invoiceDetail.TOTALAMOUNT?.toString() || "0",
            TAXAMOUNT: invoiceDetail.TAXAMOUNT?.toString() || "0",
            IGSTAMOUNT: invoiceDetail.IGSTAMOUNT?.toString() || "0",
            CGSTAMOUNT: invoiceDetail.CGSTAMOUNT?.toString() || "0",
            SGSTAMOUNT: invoiceDetail.SGSTAMOUNT?.toString() || "0",
            IGSTPER: invoiceDetail.IGSTPER?.toString() || "9",
            CGSTPER: invoiceDetail.CGSTPER?.toString() || "9",
            SGSTPER: invoiceDetail.SGSTPER?.toString() || "9",
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
            TAGGEN: "Y",
            HSNCODE: "",
            HSNTAXCODE: "",
            BILLSTATUS: "PENDING",
            TAXPER: "18",
            DISCPER: "0",
            DISCOUNTAMOUNT: "0",
            MARKUPAMOUNT: "0",
            AMOUNT: "0",
            NETAMOUNT: "0",
            TAXAMOUNT: "0",
            IGSTAMOUNT: "0",
            CGSTAMOUNT: "0",
            SGSTAMOUNT: "0",
            IGSTPER: "9",
            CGSTPER: "9",
            SGSTPER: "9",
        });
        setFormErrors({});
    };

    const handleEdit = (invoiceDetail: any) => {
        console.log('Editing invoice detail:', invoiceDetail);
        setEditId(invoiceDetail.IPID?.toString() || "");
    };

    const handleSave = () => {
        const errors: Record<string, string> = {};

        // Validation
        if (!form.VENDORCODE) errors.VENDORCODE = "Vendor Code is required";
        if (!form.PRODUCTCODE) errors.PRODUCTCODE = "Product Code is required";
        if (!form.SUBPRODUCTCODE) errors.SUBPRODUCTCODE = "Sub Product Code is required";
        if (!form.MRP) errors.MRP = "MRP is required";
        if (!form.PURRATE) errors.PURRATE = "Purchase Rate is required";
        if (!form.INVOICENO) errors.INVOICENO = "Invoice No is required";
        if (!form.BILLDATE) errors.BILLDATE = "Bill Date is required";

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        // Create payload matching InvoiceDetails interface
        const payload: InvoiceDetails = {
            ROWSIGN: form.ROWSIGN || "I",
            VENDORCODE: Number(form.VENDORCODE),
            ORIONBARCODE: form.ORIONBARCODE || "",
            PRODUCTCODE: Number(form.PRODUCTCODE),
            SUBPRODUCTCODE: form.SUBPRODUCTCODE ? Number(form.SUBPRODUCTCODE) : undefined,
            PIECES: Number(form.PIECES) || 1,
            WEIGHT: Number(form.WEIGHT) || 0,
            MRP: Number(form.MRP) || 0,
            PURRATE: Number(form.PURRATE) || 0,
            SELLINGRATE: Number(form.SELLINGRATE) || 0,
            MARKUPPER: Number(form.MARKUPPER) || 0,
            MARKUP: Number(form.MARKUPAMOUNT) || 0,
            INVOICENO: form.INVOICENO,
            BILLDATE: form.BILLDATE,
            BILLNO: form.BILLNO ? Number(form.BILLNO) : undefined,
            UNITCODE: form.UNITCODE ? Number(form.UNITCODE) : undefined,
            TAGGEN: form.TAGGEN || "Y",
            HSNCODE: form.HSNCODE || "",
            HSNTAXCODE: form.HSNTAXCODE ? Number(form.HSNTAXCODE) : undefined,
            AMOUNT: Number(form.AMOUNT) || 0,
            TOTALAMOUNT: Number(form.NETAMOUNT) || 0,
            DISCPER: Number(form.DISCPER) || 0,
            DISCOUNT: Number(form.DISCOUNTAMOUNT) || 0,
            TAXPER: Number(form.TAXPER) || 18,
            TAXAMOUNT: Number(form.TAXAMOUNT) || 0,
            IGSTAMOUNT: Number(form.IGSTAMOUNT) || 0,
            CGSTAMOUNT: Number(form.CGSTAMOUNT) || 0,
            SGSTAMOUNT: Number(form.SGSTAMOUNT) || 0,
            IGSTPER: Number(form.IGSTPER) || 9,
            CGSTPER: Number(form.CGSTPER) || 9,
            SGSTPER: Number(form.SGSTPER) || 9,
            BILLSTATUS: form.BILLSTATUS || "PENDING",
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
        return vendor?.VENDORNAME || `Vendor ${detail.VENDORCODE}` || '-';
    };

    const getProductName = (detail: any) => {
        if (detail.product?.PRODUCTNAME) return detail.product.PRODUCTNAME;
        const product = products.find((p: any) => p.PRODUCTCODE === detail.PRODUCTCODE);
        return product?.PRODUCTNAME || `Product ${detail.PRODUCTCODE}` || '-';
    };

    const getSubProductName = (detail: any) => {
        if (detail.subProduct?.SUBPRODUCTNAME) return detail.subProduct.SUBPRODUCTNAME;
        if (!detail.SUBPRODUCTCODE) return '-';
        const subProduct = allSubProducts.find((sp: any) => sp.SUBPRODUCTCODE === detail.SUBPRODUCTCODE);
        return subProduct?.SUBPRODUCTNAME || `Sub Product ${detail.SUBPRODUCTCODE}` || '-';
    };

    const InvoiceColumns = [
        { key: "actions", label: "Actions" },
        { key: "INVOICENO", label: "Invoice No" },
        { key: "BILLDATE", label: "Bill Date" },
        { key: "VENDORNAME", label: "Vendor" },
        { key: "PRODUCTNAME", label: "Product" },
        { key: "SUBPRODUCTNAME", label: "Sub Product" },
        { key: "PIECES", label: "Pcs" },
        { key: "WEIGHT", label: "Wt" },
        { key: "PURRATE", label: "Rate" },
        { key: "MRP", label: "MRP" },
        { key: "AMOUNT", label: "Amount" },
        { key: "DISCOUNT", label: "Disc" },
        { key: "MARKUP", label: "Markup" },
        { key: "TAXAMOUNT", label: "Tax" },
        { key: "TOTALAMOUNT", label: "Net" },
        { key: "TAGGEN", label: "Tag" },
        { key: "BILLSTATUS", label: "Status" },
    ];

    const handleExport = (option: string) => {
        const exportData = invoiceDetails.map((detail: any) => ({
            INVOICENO: detail.INVOICENO,
            BILLDATE: detail.BILLDATE,
            VENDORNAME: getVendorName(detail),
            PRODUCTNAME: getProductName(detail),
            SUBPRODUCTNAME: getSubProductName(detail),
            PIECES: detail.PIECES,
            WEIGHT: detail.WEIGHT,
            PURRATE: `₹${detail.PURRATE}`,
            MRP: `₹${detail.MRP}`,
            AMOUNT: `₹${detail.AMOUNT?.toFixed(2)}`,
            DISCOUNT: `₹${detail.DISCOUNT?.toFixed(2) || '0.00'}`,
            MARKUP: `₹${detail.MARKUP?.toFixed(2) || '0.00'}`,
            TAXAMOUNT: `₹${detail.TAXAMOUNT?.toFixed(2) || '0.00'}`,
            TOTALAMOUNT: `₹${detail.TOTALAMOUNT?.toFixed(2)}`,
            TAGGEN: detail.TAGGEN || 'Y',
            BILLSTATUS: detail.BILLSTATUS || 'PENDING',
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

    // Group fields into 3 columns in the exact order
    const column1Fields = [
        "ROWSIGN", "INVOICENO", "BILLDATE", "BILLNO", "VENDORCODE", "ORIONBARCODE", 
        "PRODUCTCODE", "SUBPRODUCTCODE", "UNITCODE", "HSNCODE", "HSNTAXCODE"
    ];

    const column2Fields = [
        "PIECES", "WEIGHT", "PURRATE", "MRP", "SELLINGRATE", "MARKUPPER", 
        "DISCPER", "TAXPER", "TAGGEN", "BILLSTATUS"
    ];

    const column3Fields = [
        "AMOUNT", "MARKUPAMOUNT", "DISCOUNTAMOUNT", "TAXAMOUNT", 
        "IGSTPER", "IGSTAMOUNT", "CGSTPER", "CGSTAMOUNT", "SGSTPER", "SGSTAMOUNT", 
        "NETAMOUNT"
    ];

    const fieldSequence = [...column1Fields, ...column2Fields, ...column3Fields];
    const { register, focusNext } = useEnterNavigation(fieldSequence, handleSave);

    // Show error state with retry option
    if (isError) {
        return (
            <Center h="100vh">
                <Alert
                    status="error"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    height="200px"
                    borderRadius="lg"
                    maxW="500px"
                >
                    <Alert.Icon boxSize="40px" mr={0} />
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                        Error Loading Data
                    </AlertTitle>
                    <AlertDescription maxWidth="sm">
                        {error instanceof Error ? error.message : "Failed to load invoice details"}
                    </AlertDescription>
                    <Button
                        leftIcon={<AiOutlineReload />}
                        colorScheme="red"
                        variant="outline"
                        mt={4}
                        onClick={() => refetchInvoiceDetails()}
                    >
                        Try Again
                    </Button>
                </Alert>
            </Center>
        );
    }

    // Show loading state
    if (isLoading || vendorsLoading || productsLoading || subProductsLoading || barcodesLoading) {
        return (
            <Center h="200px">
                <VStack spacing={4}>
                    <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
                    <Text color="gray.500">Loading invoice details...</Text>
                </VStack>
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

            {/* Product Selection Modal */}
            <SelectionModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                items={products.map(p => ({
                    ...p,
                    id: p.PRODUCTCODE,
                    name: p.PRODUCTNAME,
                    code: p.PRODUCTCODE,
                }))}
                onSelect={handleProductSelect}
                title="Select Product"
                searchPlaceholder="Search by product name or code..."
                searchKeys={["PRODUCTNAME", "PRODUCTCODE"]}
                idKey="PRODUCTCODE"
                nameKey="PRODUCTNAME"
                codeKey="PRODUCTCODE"
                columns={[
                    { key: "PRODUCTCODE", label: "Code", width: "100px" },
                    { key: "PRODUCTNAME", label: "Product Name", width: "1fr" },
                    { key: "MRP", label: "MRP", width: "100px" },
                    { key: "PURRATE", label: "Rate", width: "100px" },
                ]}
            />

            {/* SubProduct Selection Modal */}
            <SelectionModal
                isOpen={isSubProductModalOpen}
                onClose={() => setIsSubProductModalOpen(false)}
                items={filteredSubProducts.map(sp => ({
                    ...sp,
                    id: sp.SUBPRODUCTCODE,
                    name: sp.SUBPRODUCTNAME,
                    code: sp.SUBPRODUCTCODE,
                }))}
                onSelect={handleSubProductSelect}
                title="Select Sub Product"
                searchPlaceholder="Search by sub product name or code..."
                searchKeys={["SUBPRODUCTNAME", "SUBPRODUCTCODE"]}
                idKey="SUBPRODUCTCODE"
                nameKey="SUBPRODUCTNAME"
                codeKey="SUBPRODUCTCODE"
                columns={[
                    { key: "SUBPRODUCTCODE", label: "Code", width: "100px" },
                    { key: "SUBPRODUCTNAME", label: "Sub Product Name", width: "1fr" },
                    { key: "MRP", label: "MRP", width: "100px" },
                    { key: "PURRATE", label: "Rate", width: "100px" },
                ]}
            />

            <VStack spacing={6} align="stretch">
                {/* ---------------- FORM CARD WITH 3-COLUMN LAYOUT ---------------- */}
                <Card.Root variant="outline" bg={theme.colors.formColor} borderRadius="xl" border="1px solid #eef">
                    <CardHeader>
                        <HStack justify="space-between" align="center">
                            <Text fontSize="md" fontWeight="600">
                                INVOICE {editId ? 'EDIT' : 'DETAILS'}
                            </Text>
                            <HStack spacing={2} fontSize="sm" color="gray.500">
                                <Kbd>F2</Kbd>
                                <Text>on product/subproduct field to open selector</Text>
                            </HStack>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={6} align="stretch">
                            {/* 3-Column Layout with fields in exact order */}
                            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                                {/* Column 1 - Basic Info */}
                                <GridItem>
                                    <VStack align="stretch" spacing={4}>
                                        <Text fontSize="sm" fontWeight="500" color="gray.600" borderBottom="1px solid" borderColor="gray.200" pb={1}>
                                            Invoice & Basic Info
                                        </Text>
                                        {column1Fields.map(fieldName => {
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
                                                        onFieldFocus={handleInputFocus}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </GridItem>

                                {/* Column 2 - Product Details */}
                                <GridItem>
                                    <VStack align="stretch" spacing={4}>
                                        <Text fontSize="sm" fontWeight="500" color="gray.600" borderBottom="1px solid" borderColor="gray.200" pb={1}>
                                            Product Details
                                        </Text>
                                        {column2Fields.map(fieldName => {
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
                                                        onFieldFocus={handleInputFocus}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </GridItem>

                                {/* Column 3 - Calculations */}
                                <GridItem>
                                    <VStack align="stretch" spacing={4}>
                                        <Text fontSize="sm" fontWeight="500" color="gray.600" borderBottom="1px solid" borderColor="gray.200" pb={1}>
                                            Calculations
                                        </Text>
                                        {column3Fields.map(fieldName => {
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
                                                        onFieldFocus={handleInputFocus}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </GridItem>
                            </Grid>

                            <Separator />
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
                                    <Table.Cell>{detail.INVOICENO}</Table.Cell>
                                    <Table.Cell>{detail.BILLDATE}</Table.Cell>
                                    <Table.Cell>{getVendorName(detail)}</Table.Cell>
                                    <Table.Cell>{getProductName(detail)}</Table.Cell>
                                    <Table.Cell>{getSubProductName(detail)}</Table.Cell>
                                    <Table.Cell>{detail.PIECES}</Table.Cell>
                                    <Table.Cell>{detail.WEIGHT}</Table.Cell>
                                    <Table.Cell>₹{detail.PURRATE}</Table.Cell>
                                    <Table.Cell>₹{detail.MRP}</Table.Cell>
                                    <Table.Cell>₹{detail.AMOUNT?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>₹{detail.DISCOUNT?.toFixed(2) || '0.00'}</Table.Cell>
                                    <Table.Cell>₹{detail.MARKUP?.toFixed(2) || '0.00'}</Table.Cell>
                                    <Table.Cell>₹{detail.TAXAMOUNT?.toFixed(2) || '0.00'}</Table.Cell>
                                    <Table.Cell>₹{detail.TOTALAMOUNT?.toFixed(2)}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorScheme={detail.TAGGEN === 'Y' ? 'green' : 'gray'}>
                                            {detail.TAGGEN || 'Y'}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge colorScheme={detail.BILLSTATUS === 'PAID' ? 'green' : 'yellow'}>
                                            {detail.BILLSTATUS || 'PENDING'}
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
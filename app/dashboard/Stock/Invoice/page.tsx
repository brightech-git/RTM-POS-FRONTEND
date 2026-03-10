"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Box, Text, HStack, Button, Grid, GridItem, VStack, Fieldset, Flex } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { DynamicForm } from "@/component/form/DynamicForm";
import { InvoiceDetailsConfig } from "@/config/Stock/Invoice";
import { useAllProducts } from "@/hooks/product/useProducts";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { useTheme } from "@/context/theme/themeContext";
import { useAllVendors } from "@/hooks/Vendor/useVendor";
import { useAllSubProducts } from "@/hooks/SubProducts/useSubProducts";
import { useCascadeProductFilter } from "@/hooks/casaceProducts/useCasacadeproductFilter";
import { useCreateInvoiceDetails } from "@/hooks/Invoice/useInvoice";
import { AiOutlineSave, AiOutlinePlus } from "react-icons/ai";
import { MdClear, MdDelete, MdEdit } from "react-icons/md";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useSidebar } from "@/context/layout/SideBarContext";

// Constants
const DEBOUNCE_DELAY = 150;
const MIN_BARCODE_LENGTH = 4;

// Types
interface Vendor {
  VENDORCODE: string;
  VENDORNAME: string;
}

interface Product {
  PRODUCTCODE: string;
  PRODUCTNAME: string;
}

interface SubProduct {
  subProductCode: number;
  subProductName: string;
  productCode?: number;
  purRate: number | null;
  mrp: number | null;
  sellingRate: number | null;
  hsnCode: string;
  hsnTaxCode: number;
  weight: number;
  orionBarcode: string | null;
  belowSalesAmount: number;
  belowIgstTaxCode: number;
  aboveIgstTaxCode: number;
  belowCgstTaxCode: number;
  aboveCgstTaxCode: number;
  belowSgstTaxCode: number;
  aboveSgstTaxCode: number;
  uom?: string;
  productName?: string;
}

interface InvoiceItem {
  sno: number;
  productName: string;
  vendorName: string;
  qty: number;
  uom: string;
  rate: number;
  discPer: number;
  discount: number;
  sellingRate: number;
  amount: number;
  grossAmount: number;
  igst: number;
  cgst: number;
  sgst: number;
  netAmount: number;
  // Original fields for payload
  VENDORCODE: string;
  INVOICENO: string;
  BILLDATE: string;
  ORIONBARCODE: string;
  PRODUCTCODE: string;
  SUBPRODUCTCODE: string;
  RATE: number;
  WEIGHT: number;
  MRP: number;
  SELLINGRATE: number;
  AMOUNT: number;
  IGSTAMOUNT: number;
  CGSTAMOUNT: number;
  SGSTAMOUNT: number;
  HSNCODE: string;
  HSNTAXCODE: string;
  DISCOUNTAMOUNT: number;
  DISCPER: number;
}

interface FormData {
  INVOICENO: string;
  BILLDATE: string;
  VENDORCODE: string;
  ORIONBARCODE: string;
  PRODUCTCODE: string;
  SUBPRODUCTCODE: string;
  RATE: number | string;
  WEIGHT: number | string;
  PIECES: number | string;
  MRP: number | string;
  SELLINGRATE: number | string;
  AMOUNT: number;
  IGSTAMOUNT: number;
  CGSTAMOUNT: number;
  SGSTAMOUNT: number;
  NETAMOUNT: number;
  HSNCODE: string;
  HSNTAXCODE: string;
  DISCPER: number;
  DISCOUNTAMOUNT: number;
}

const initialFormData: FormData = {
  INVOICENO: "",
  BILLDATE: new Date().toISOString().split("T")[0],
  VENDORCODE: "",
  ORIONBARCODE: "",
  PRODUCTCODE: "",
  SUBPRODUCTCODE: "",
  RATE: "",
  WEIGHT: "",
  PIECES: "",
  MRP: "",
  SELLINGRATE: "",
  AMOUNT: 0,
  IGSTAMOUNT: 0,
  CGSTAMOUNT: 0,
  SGSTAMOUNT: 0,
  NETAMOUNT: 0,
  HSNCODE: "",
  HSNTAXCODE: "",
  DISCPER: 0,
  DISCOUNTAMOUNT: 0,
};

export default function InvoiceMaster() {
  const { theme } = useTheme();
  const { setSidebarCollapsed } = useSidebar();
  const createInvoice = useCreateInvoiceDetails();

  // State
  const [vendors, setVendors] = useState<Array<{ label: string; value: string }>>([]);
  const [products, setProducts] = useState<Array<{ label: string; value: string }>>([]);
  const [subProducts, setSubProducts] = useState<Array<{ label: string; value: string }>>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedSubProduct, setSelectedSubProduct] = useState<SubProduct | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [filter, setFilter] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isProductDisabled, setIsProductDisabled] = useState(false);
  const [isSubProductDisabled, setIsSubProductDisabled] = useState(false);
  const [searchType, setSearchType] = useState<'barcode' | 'product' | null>(null);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const barcodeSearchTriggerRef = useRef(false);
  const productSearchTriggerRef = useRef(false);

  // Hooks
  const { data: allVendors } = useAllVendors();
  const { data: allSubProducts } = useAllSubProducts();
  const { data: productsData } = useAllProducts();
  const { data: filteredProducts, refetch: refetchCascade } = useCascadeProductFilter(filter);

  // Memoized values
  const today = useMemo(() => new Date(), []);
  const todayDateString = useMemo(() => today.toISOString().split("T")[0], [today]);

  // Tax calculation
  const calculateTaxes = useCallback((
    pieces: number,
    rate: number,
    discPer: number,
    selectedSubProduct: SubProduct | null
  ) => {
    if (!selectedSubProduct || !pieces || !rate) {
      return {
        AMOUNT: 0,
        DISCOUNTAMOUNT: 0,
        IGSTAMOUNT: 0,
        CGSTAMOUNT: 0,
        SGSTAMOUNT: 0,
        NETAMOUNT: 0,
      };
    }

    const amount = pieces * rate;
    const discountAmount = (amount * discPer) / 100;
    const grossAmount = amount - discountAmount;

    // Determine which tax slab to use based on amount
    const useBelow = grossAmount < (selectedSubProduct.belowSalesAmount || 0);

    const igstRate = useBelow
      ? selectedSubProduct.belowIgstTaxCode
      : selectedSubProduct.aboveIgstTaxCode;

    const cgstRate = useBelow
      ? selectedSubProduct.belowCgstTaxCode
      : selectedSubProduct.aboveCgstTaxCode;

    const sgstRate = useBelow
      ? selectedSubProduct.belowSgstTaxCode
      : selectedSubProduct.aboveSgstTaxCode;

    const igstAmount = grossAmount * (igstRate || 0) / 100;
    const cgstAmount = grossAmount * (cgstRate || 0) / 100;
    const sgstAmount = grossAmount * (sgstRate || 0) / 100;

    const netAmount = igstAmount > 0 
      ? grossAmount + igstAmount 
      : grossAmount + cgstAmount + sgstAmount;

    return {
      AMOUNT: amount,
      DISCOUNTAMOUNT: discountAmount,
      IGSTAMOUNT: igstAmount,
      CGSTAMOUNT: cgstAmount,
      SGSTAMOUNT: sgstAmount,
      NETAMOUNT: netAmount,
    };
  }, []);

  // Sidebar effect
  useEffect(() => {
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  // Map vendors
  useEffect(() => {
    if (allVendors?.length) {
      setVendors(
        allVendors.map((vendor: Vendor) => ({
          label: vendor.VENDORNAME,
          value: vendor.VENDORCODE,
        }))
      );
    }
  }, [allVendors]);

  // Map products
  useEffect(() => {
    if (productsData?.length) {
      setProducts(
        productsData.map((product: Product) => ({
          label: product.PRODUCTNAME,
          value: product.PRODUCTCODE,
        }))
      );
    }
  }, [productsData]);

  // Map subproducts from cascade filter - FIXED with null checks
  useEffect(() => {
    if (filteredProducts?.length) {
      const validSubProducts = filteredProducts
        .filter((sub: SubProduct) => sub && sub.subProductCode != null) // Filter out null/undefined subProductCode
        .map((sub: SubProduct) => ({
          label: sub.subProductName || "",
          value: sub.subProductCode?.toString() || "", // Safe navigation with fallback
        }));
      setSubProducts(validSubProducts);
    } else {
      setSubProducts([]);
    }
  }, [filteredProducts]);

  // Update filter for cascade
  useEffect(() => {
    if (formData.ORIONBARCODE?.length >= MIN_BARCODE_LENGTH || 
        formData.PRODUCTCODE || 
        formData.SUBPRODUCTCODE) {
      setFilter({
        productCode: formData.PRODUCTCODE || undefined,
        subProductCode: formData.SUBPRODUCTCODE || undefined,
        orionBarcode: formData.ORIONBARCODE || undefined,
      });
    }
  }, [formData.PRODUCTCODE, formData.SUBPRODUCTCODE, formData.ORIONBARCODE]);

  // Handle search results (barcode and product)
  useEffect(() => {
    const handleSearchResults = async () => {
      if (!filteredProducts?.length) {
        if (barcodeSearchTriggerRef.current) {
          toaster.create({
            title: "Not Found",
            description: "No product found with this barcode",
            type: "warning",
            duration: 3000,
          });
        }
        barcodeSearchTriggerRef.current = false;
        productSearchTriggerRef.current = false;
        setIsSearching(false);
        setSearchType(null);
        return;
      }

      // Handle barcode search results
    if (searchType === "barcode" && filteredProducts.length > 0) {
  const barcodeResult = filteredProducts[0];

  setFormData((prev) => {
    const updatedForm = {
      ...prev,
      ORIONBARCODE: barcodeResult.orionBarcode?.toString() || "",
      PRODUCTCODE: barcodeResult.productCode?.toString() || "",
      SUBPRODUCTCODE: barcodeResult.subProductCode?.toString() || "",
      RATE: barcodeResult.purRate || 0,
      WEIGHT: barcodeResult.weight || 0,
      MRP: barcodeResult.mrp || 0,
      SELLINGRATE: barcodeResult.sellingRate || 0,
      HSNCODE: barcodeResult.hsnCode || "",
      HSNTAXCODE: barcodeResult.hsnTaxCode?.toString() || "0",
      PIECES: prev.PIECES || 1,
    };

    const pieces = Number(updatedForm.PIECES) || 0;
    const rate = Number(updatedForm.RATE) || 0;
    const discPer = Number(updatedForm.DISCPER) || 0;

    const taxes = calculateTaxes(pieces, rate, discPer, barcodeResult);

    return {
      ...updatedForm,
      ...taxes,
    };
  });

  setSelectedSubProduct(barcodeResult);
  setIsProductDisabled(true);
  setIsSubProductDisabled(true);

  setIsSearching(false);
  setSearchType(null);
}
      
      // Handle product/subproduct selection results
      else if (productSearchTriggerRef.current && filteredProducts.length > 0) {
        // Filter out any invalid subproducts before setting
        const validSubProducts = filteredProducts
          .filter((sub: SubProduct) => sub && sub.subProductCode != null)
          .map((sub: SubProduct) => ({
            label: sub.subProductName || "",
            value: sub.subProductCode?.toString() || "",
          }));
        setSubProducts(validSubProducts);
      }

      barcodeSearchTriggerRef.current = false;
      productSearchTriggerRef.current = false;
      setIsSearching(false);
      setSearchType(null);
    };

    handleSearchResults();
  }, [filteredProducts, calculateTaxes]);

  // Generate form fields with disabled states
  useEffect(() => {
    const config = InvoiceDetailsConfig({
      vendors,
      products,
      subProducts,
      todayDate: today,
      isProductDisabled,
      isSubProductDisabled,
    });
    setFields(config);
  }, [vendors, products, subProducts, today, isProductDisabled, isSubProductDisabled]);

  // Handle input changes
  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev: FormData) => {
      const updated = { ...prev, [field]: value };

      // Handle barcode search
     if (field === "ORIONBARCODE") {
  if (value?.length >= MIN_BARCODE_LENGTH) {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      barcodeSearchTriggerRef.current = true;
      setSearchType('barcode');
      setIsSearching(true);

      // Update filter immediately to trigger API call
      setFilter({
        productCode: undefined,
        subProductCode: undefined,
        orionBarcode: value,
      });
    }, DEBOUNCE_DELAY);
  } else {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    barcodeSearchTriggerRef.current = false;
    setIsSearching(false);
    setSearchType(null);
  }
}

      // Handle product selection - enable subproduct dropdown and fetch subproducts
      if (field === "PRODUCTCODE" && value) {
        setIsSubProductDisabled(false);
        updated.SUBPRODUCTCODE = "";
        setSelectedSubProduct(null);
        
        // Trigger cascade filter to get subproducts for this product
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
          productSearchTriggerRef.current = true;
          setSearchType('product');
          setIsSearching(true);
          setFilter({
            productCode: value,
            subProductCode: undefined,
            orionBarcode: undefined,
          });
        }, 300);
      }

      // Clear product selection
      if (field === "PRODUCTCODE" && !value) {
        setIsSubProductDisabled(true);
        updated.SUBPRODUCTCODE = "";
        setSubProducts([]);
        setSelectedSubProduct(null);
      }

      // Handle subproduct selection
      if (field === "SUBPRODUCTCODE" && value && filteredProducts?.length) {
        const selected = filteredProducts.find(
          (f: SubProduct) => f && f.subProductCode?.toString() === value
        );
        
        if (selected) {
          setSelectedSubProduct(selected);
          
          // Auto-fill ALL fields with subproduct data
          const updatedWithSubProduct = {
            ...updated,
            PRODUCTCODE: selected.productCode?.toString() || updated.PRODUCTCODE,
            ORIONBARCODE: selected.orionBarcode || updated.ORIONBARCODE,
            RATE: selected.purRate || 0,
            WEIGHT: selected.weight || 0,
            MRP: selected.mrp || 0,
            SELLINGRATE: selected.sellingRate || 0,
            HSNCODE: selected.hsnCode || "",
            HSNTAXCODE: selected.hsnTaxCode?.toString() || "0",
          };

          // Calculate taxes if we have pieces
          const pieces = Number(updated.PIECES) || 0;
          const rate = Number(selected.purRate) || 0;
          const discPer = Number(updated.DISCPER) || 0;

          if (pieces && rate) {
            const taxes = calculateTaxes(pieces, rate, discPer, selected);
            return {
              ...updatedWithSubProduct,
              ...taxes,
            };
          }

          return updatedWithSubProduct;
        }
      }

      // Calculate taxes when relevant fields change
      if (["PIECES", "RATE", "DISCPER"].includes(field) && selectedSubProduct) {
        const pieces = Number(updated.PIECES) || 0;
        const rate = Number(updated.RATE) || Number(selectedSubProduct.purRate) || 0;
        const discPer = Number(updated.DISCPER) || 0;

        const taxes = calculateTaxes(pieces, rate, discPer, selectedSubProduct);
        
        return {
          ...updated,
          ...taxes,
        };
      }

      return updated;
    });
  }, [filteredProducts, selectedSubProduct, calculateTaxes]);

  // Clear search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get invoice payload
  const getInvoicePayload = useCallback((data: any) => ({
    VENDORCODE: Number(data.VENDORCODE) || 0,
    ORIONBARCODE: data.ORIONBARCODE || "",
    PRODUCTCODE: Number(data.PRODUCTCODE) || 0,
    SUBPRODUCTCODE: Number(data.SUBPRODUCTCODE) || 0,
    PIECES: Number(data.PIECES) || 0,
    WEIGHT: Number(data.WEIGHT) || 0,
    MRP: Number(data.MRP) || 0,
    PURRATE: Number(data.RATE) || 0,
    SELLINGRATE: Number(data.SELLINGRATE) || 0,
    MARKUPPER: "",
    MARKUP: "",
    INVOICENO: data.INVOICENO || "",
    BILLDATE: data.BILLDATE || "",
    TAGGEN: "",
    BILLTYPE: "PU",
    UNIQUEKEY: "TRN002",
    AMOUNT: Number(data.AMOUNT) || 0,
    SGSTAMOUNT: data.SGSTAMOUNT ?? null,
    IGSTAMOUNT: data.IGSTAMOUNT ?? null,
    CGSTAMOUNT: data.CGSTAMOUNT ?? null,
    HSNCODE: data.HSNCODE || "",
    HSNTAXCODE: Number(data.HSNTAXCODE) || 0,
    ENTRYORDER: Number(data.ENTRYORDER) || 1,
    HSNCALC: "",
    BILLSTATUS: "",
    IPID: 8,
    DISCOUNTAMOUNT: Number(data.DISCOUNTAMOUNT) || 0,
  }), []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    if (!formData.VENDORCODE) {
      toaster.create({
        title: "Validation Error",
        description: "Please select a vendor",
        type: "warning",
        duration: 3000,
      });
      return false;
    }

    if (!formData.SUBPRODUCTCODE) {
      toaster.create({
        title: "Validation Error",
        description: "Please select a subproduct",
        type: "warning",
        duration: 3000,
      });
      return false;
    }

    if (!formData.PIECES || Number(formData.PIECES) <= 0) {
      toaster.create({
        title: "Validation Error",
        description: "Please enter valid quantity",
        type: "warning",
        duration: 3000,
      });
      return false;
    }

    return true;
  }, [formData.VENDORCODE, formData.SUBPRODUCTCODE, formData.PIECES]);

  // Add/Update item
  const handleAddItem = useCallback(() => {
    if (!validateForm()) return;

    const selected = filteredProducts?.find(
      (f: SubProduct) => f && f.subProductCode?.toString() === formData.SUBPRODUCTCODE
    );

    const newItem: InvoiceItem = {
      sno: editingIndex !== null ? editingIndex + 1 : invoiceItems.length + 1,
      productName: selected?.subProductName || "",
      vendorName: vendors.find(v => v.value === formData.VENDORCODE)?.label || "",
      qty: Number(formData.PIECES),
      uom: selected?.uom || "",
      rate: Number(formData.RATE) || 0,
      discPer: formData.DISCPER || 0,
      discount: formData.DISCOUNTAMOUNT || 0,
      sellingRate: Number(formData.SELLINGRATE) || 0,
      amount: formData.AMOUNT || 0,
      grossAmount: (formData.AMOUNT || 0) - (formData.DISCOUNTAMOUNT || 0),
      igst: formData.IGSTAMOUNT || 0,
      cgst: formData.CGSTAMOUNT || 0,
      sgst: formData.SGSTAMOUNT || 0,
      netAmount: formData.NETAMOUNT || 0,
      VENDORCODE: formData.VENDORCODE,
      INVOICENO: formData.INVOICENO,
      BILLDATE: formData.BILLDATE,
      ORIONBARCODE: formData.ORIONBARCODE,
      PRODUCTCODE: formData.PRODUCTCODE,
      SUBPRODUCTCODE: formData.SUBPRODUCTCODE,
      RATE: Number(formData.RATE),
      WEIGHT: Number(formData.WEIGHT),
      MRP: Number(formData.MRP),
      SELLINGRATE: Number(formData.SELLINGRATE),
      AMOUNT: formData.AMOUNT,
      IGSTAMOUNT: formData.IGSTAMOUNT,
      CGSTAMOUNT: formData.CGSTAMOUNT,
      SGSTAMOUNT: formData.SGSTAMOUNT,
      HSNCODE: formData.HSNCODE,
      HSNTAXCODE: formData.HSNTAXCODE,
      DISCOUNTAMOUNT: formData.DISCOUNTAMOUNT,
      DISCPER: formData.DISCPER,
    };

    setInvoiceItems(prev => {
      let updated: InvoiceItem[];
      if (editingIndex !== null) {
        updated = [...prev];
        updated[editingIndex] = { ...newItem, sno: editingIndex + 1 };
        updated = updated.map((item, idx) => ({ ...item, sno: idx + 1 }));
      } else {
        updated = [...prev, newItem];
      }
      return updated;
    });

    toaster.create({
      title: "Success",
      description: editingIndex !== null ? "Item updated successfully" : "Item added successfully",
      type: "success",
      duration: 2000,
    });

    // Clear form but preserve vendor, invoice no, and date
    setFormData(prev => ({
      ...initialFormData,
      INVOICENO: prev.INVOICENO,
      BILLDATE: prev.BILLDATE,
      VENDORCODE: prev.VENDORCODE,
    }));
    
    // Reset disabled states
    setIsProductDisabled(false);
    setIsSubProductDisabled(false);
    setSelectedSubProduct(null);
    setEditingIndex(null);
    setSubProducts([]);
  }, [formData, filteredProducts, vendors, editingIndex, invoiceItems.length, validateForm]);

  // Edit item
  const handleEditItem = useCallback((index: number) => {
    const item = invoiceItems[index];
    setFormData({
      INVOICENO: item.INVOICENO || "",
      BILLDATE: item.BILLDATE || todayDateString,
      VENDORCODE: item.VENDORCODE || "",
      ORIONBARCODE: item.ORIONBARCODE || "",
      PRODUCTCODE: item.PRODUCTCODE || "",
      SUBPRODUCTCODE: item.SUBPRODUCTCODE || "",
      RATE: item.RATE || 0,
      WEIGHT: item.WEIGHT || 0,
      PIECES: item.qty,
      MRP: item.MRP || 0,
      SELLINGRATE: item.SELLINGRATE || 0,
      AMOUNT: item.AMOUNT || 0,
      IGSTAMOUNT: item.IGSTAMOUNT || 0,
      CGSTAMOUNT: item.CGSTAMOUNT || 0,
      SGSTAMOUNT: item.SGSTAMOUNT || 0,
      NETAMOUNT: item.NETAMOUNT || 0,
      HSNCODE: item.HSNCODE || "",
      HSNTAXCODE: item.HSNTAXCODE || "",
      DISCPER: item.DISCPER || 0,
      DISCOUNTAMOUNT: item.DISCOUNTAMOUNT || 0,
    });
    
    // Enable dropdowns for editing
    setIsProductDisabled(false);
    setIsSubProductDisabled(false);
    setEditingIndex(index);
  }, [invoiceItems, todayDateString]);

  // Delete item
  const handleDeleteItem = useCallback((index: number) => {
    setInvoiceItems(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((item, idx) => ({ ...item, sno: idx + 1 }));
    });

    toaster.create({
      title: "Success",
      description: "Item deleted successfully",
      type: "info",
      duration: 2000,
    });
  }, []);

  // Clear form
  const handleClearForm = useCallback(() => {
    setFormData(prev => ({
      ...initialFormData,
      INVOICENO: prev.INVOICENO,
      BILLDATE: prev.BILLDATE,
      VENDORCODE: prev.VENDORCODE,
    }));
    setIsProductDisabled(false);
    setIsSubProductDisabled(false);
    setSelectedSubProduct(null);
    setEditingIndex(null);
    setSubProducts([]);
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    setInvoiceItems([]);
    handleClearForm();
  }, [handleClearForm]);

  // Save all
const handleSaveAll = useCallback(() => {
  if (invoiceItems.length === 0) return;

  const payloadArray: InvoiceDetails[] = invoiceItems.map((item, index) => ({
    AMOUNT: Number(item.AMOUNT || 0),
    BILLDATE: item.BILLDATE || formData.BILLDATE,
    BILLSTATUS: "",
    BILLTYPE: "PU",
    CGSTAMOUNT: Number(item.CGSTAMOUNT ?? 0),
    DISCOUNTAMOUNT: Number(item.DISCOUNTAMOUNT ?? 0),
    ENTRYORDER: index + 1,
    HSNCALC: "",
    HSNCODE: item.HSNCODE || "",
    HSNTAXCODE: Number(item.HSNTAXCODE ?? 0),
    IGSTAMOUNT: Number(item.IGSTAMOUNT ?? 0),
    INVOICENO: item.INVOICENO || formData.INVOICENO,
    IPID: 1,
    MARKUP: "",
    MARKUPPER: "",
    MRP: Number(item.MRP ?? 0),
    ORIONBARCODE: item.ORIONBARCODE || "",
    PIECES: Number(item.PIECES ?? 0),
    PRODUCTCODE: Number(item.PRODUCTCODE ?? 0),
    PURRATE: Number(item.RATE ?? 0),
    SELLINGRATE: Number(item.SELLINGRATE ?? 0),
    SGSTAMOUNT: Number(item.SGSTAMOUNT ?? 0),
    SUBPRODUCTCODE: Number(item.SUBPRODUCTCODE ?? 0),
    TAGGEN: "",
    UNIQUEKEY: "TRN002",
    VENDORCODE: Number(item.VENDORCODE || formData.VENDORCODE),
    WEIGHT: Number(item.WEIGHT ?? 0),
  }));

  console.log("Payload array to send:", payloadArray);

  createInvoice.mutate(payloadArray, {
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: `${invoiceItems.length} items saved successfully`,
        type: "success",
        duration: 3000,
      });
      handleClearAll();
    },
    onError: (error: any) => {
      toaster.create({
        title: "Error",
        description: `Failed to save items: ${error.message}`,
        type: "error",
        duration: 5000,
      });
    },
  });
}, [invoiceItems, formData, createInvoice, handleClearAll]);

  // Navigation
  const fieldSequence = useMemo(() => fields.map(f => f.name), [fields]);
  const { register, focusNext } = useEnterNavigation(fieldSequence, handleAddItem);

  // Totals
  const totalNetAmount = useMemo(() => 
    invoiceItems.reduce((sum, item) => sum + (item.netAmount || 0), 0),
    [invoiceItems]
  );

  return (
    <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary} p={3}>
      <Toaster />
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1.5fr" }} gap={2}>
        {/* Form Section */}
        <GridItem>
          <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
            <Text fontSize="small" fontWeight="600">
              PURCHASE ENTRY {isSearching && searchType === 'barcode' && "(Searching by barcode...)"}
              {isSearching && searchType === 'product' && "(Loading products...)"}
            </Text>

            <Fieldset.Root size="sm" width="100%">
              <Fieldset.Content>
                {fields.length > 0 && (
                  <DynamicForm
                    fields={fields}
                    formData={formData}
                    onChange={handleChange}
                    register={register}
                    focusNext={focusNext}
                    grid={{ columns: 2 }}
                  />
                )}
              </Fieldset.Content>
            </Fieldset.Root>

            {/* Form Actions */}
            <HStack mt={2} gap={4} width="100%" justify="center">
              <Button
                size="xs"
                colorPalette="blue"
                onClick={handleAddItem}
                minW="100px"
                display="flex"
                alignItems="center"
                gap="1"
                loading={isSearching}
              >
                <AiOutlinePlus />
                {editingIndex !== null ? "Update" : "Add"}
              </Button>

              <Button
                size="xs"
                colorPalette="orange"
                onClick={handleClearForm}
                minW="100px"
                display="flex"
                alignItems="center"
                gap="1"
              >
                <MdClear />
                Clear
              </Button>
            </HStack>
          </VStack>
        </GridItem>

        {/* Table Section */}
        <GridItem minW={0}>
          <Box bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
            <Box display='flex' mb={2} gap={2} justifyContent='space-between' alignItems='center'>
              <Text fontWeight="semibold" fontSize="small">
                INVOICE ITEMS {invoiceItems.length > 0 ? `(${invoiceItems.length})` : ''}
              </Text>

              <Flex>
                <Button
                  size="xs"
                  colorPalette="green"
                  onClick={handleSaveAll}
                  mr={2}
                  isLoading={createInvoice.isPending}
                >
                  <AiOutlineSave />
                  Save All
                </Button>
                <Button
                  size="xs"
                  colorPalette="red"
                  onClick={handleClearAll}
                >
                  <MdClear />
                  Clear All
                </Button>
              </Flex>
            </Box>

            {invoiceItems.length > 0 ? (
              <Box overflowX="auto">
                <Table.Root size="sm" variant="outline">
                  <Table.Header bg="blue.800">
                    <Table.Row>
                      <Table.ColumnHeader color="white">SNo</Table.ColumnHeader>
                      <Table.ColumnHeader color="white">Product</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">Qty</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">Rate</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">Disc%</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">Amount</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">IGST</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">CGST</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">SGST</Table.ColumnHeader>
                      <Table.ColumnHeader color="white" textAlign="right">Net Amt</Table.ColumnHeader>
                      <Table.ColumnHeader color="white">Actions</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {invoiceItems.map((item, index) => (
                      <Table.Row key={item.sno} bg={theme.colors.primary}>
                        <Table.Cell>{item.sno}</Table.Cell>
                        <Table.Cell>{item.productName}</Table.Cell>
                        <Table.Cell textAlign="right">{item.qty}</Table.Cell>
                        <Table.Cell textAlign="right">{item.rate?.toFixed(2)}</Table.Cell>
                        <Table.Cell textAlign="right">{item.discPer?.toFixed(2)}%</Table.Cell>
                        <Table.Cell textAlign="right">{item.amount?.toFixed(2)}</Table.Cell>
                        <Table.Cell textAlign="right">{item.igst?.toFixed(2)}</Table.Cell>
                        <Table.Cell textAlign="right">{item.cgst?.toFixed(2)}</Table.Cell>
                        <Table.Cell textAlign="right">{item.sgst?.toFixed(2)}</Table.Cell>
                        <Table.Cell textAlign="right" fontWeight="bold">{item.netAmount?.toFixed(2)}</Table.Cell>
                        <Table.Cell>
                          <HStack gap={1}>
                            <Button
                              size="2xs"
                              colorPalette="yellow"
                              onClick={() => handleEditItem(index)}
                            >
                              <MdEdit />
                            </Button>
                            <Button
                              size="2xs"
                              colorPalette="red"
                              onClick={() => handleDeleteItem(index)}
                            >
                              <MdDelete />
                            </Button>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {/* Total Row */}
                    <Table.Row bg="blue.50" fontWeight="bold">
                      <Table.Cell colSpan={9} textAlign="right">Total:</Table.Cell>
                      <Table.Cell textAlign="right">{totalNetAmount.toFixed(2)}</Table.Cell>
                      <Table.Cell></Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Box>
            ) : (
              <Box textAlign="center" py={8} bg={theme.colors.primary} borderRadius="md">
                <Text color="gray.500">No items added yet. Add items using the form on the left.</Text>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
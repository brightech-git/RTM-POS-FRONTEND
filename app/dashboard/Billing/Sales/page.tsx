"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    Box, Text, HStack, Button, Grid, GridItem,
    VStack, Fieldset, Flex,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { DynamicForm } from "@/component/form/DynamicForm";
import { SalesConfig } from "@/config/Billing/SalesBill";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { useTheme } from "@/context/theme/themeContext";
import { useFetchSaleDetails, useSaveSalesBatch } from "@/hooks/SalesBill/useSalesBill";
import { AiOutlineSave, AiOutlinePlus, AiOutlineBarcode } from "react-icons/ai";
import { MdClear, MdDelete, MdEdit } from "react-icons/md";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useSidebar } from "@/context/layout/SideBarContext";
import PaymentModeModal from "@/component/PaymentMode/PaymentMode";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesItem {
    sno: number;
    tagNo: string;
    productName: string;
    subProductName: string;
    qty: number;
    uom: string;
    rate: number;
    weight: number;
    discPer: number;
    discount: number;
    amount: number;
    gst: number;
    total: number;
    PRODUCTCODE: number;
    SUBPRODUCTCODE: number;
    ORIONBARCODE: string;
    WEIGHT: number;
    MRP: number;
    TAXPER: number;
    TAXAMOUNT: number;
    SGSTPER: number;
    SGSTAMOUNT: number;
    CGSTPER: number;
    CGSTAMOUNT: number;
    IGSTPER: number;
    IGSTAMOUNT: number;
    HSNCODE: string;
    HSNTAXCODE: number;
    SALEMANCODE: string;
    UNIQUEKEY: string;
}

interface FormData {
    BILLDATE: string;
    BILLTYPE: string;
    TAGNO: string;
    PRODUCTNAME: string;
    SUBPRODUCTNAME: string;
    RATE: number | string;
    QTY: number | string;
    UOM: string;
    WEIGHT: number | string;
    DISCPER: number | string;
    DISCOUNTAMOUNT: number;
    AMOUNT: number;
    GSTPER: number;
    TOTAL: number;
    IGSTAMOUNT: number;
    CGSTAMOUNT: number;
    SGSTAMOUNT: number;
    SALEMANCODE: string;
    BILLNO?: number;
    ENTRYORDER?: number;
    PRODUCTCODE?: number;
    SUBPRODUCTCODE?: number;
    ORIONBARCODE?: string;
    MRP?: number;
    TAXPER?: number;
    TAXAMOUNT?: number;
    HSNCODE?: string;
    HSNTAXCODE?: number;
    UNIQUEKEY?: string;
    CGSTPER?: number;
    SGSTPER?: number;
    IGSTPER?: number;
    purchaseRate?: number;
    belowSrvTaxPer?: number;
    aboveCgstTaxPer?: number;
    aboveSgstTaxPer?: number;
    aboveIgstTaxPer?: number;
    belowSgstTaxPer?: number;
    belowIgstTaxPer?: number;
    belowCgstTaxPer?: number;
    belowSalesAmount?: number;
    sourceTable?: string;
    pieces?: number;
}

const initialFormData: FormData = {
    BILLDATE: new Date().toISOString().split("T")[0],
    BILLTYPE: "SL",
    TAGNO: "",
    PRODUCTNAME: "",
    SUBPRODUCTNAME: "",
    RATE: "",
    QTY: "1",
    UOM: "",
    WEIGHT: "",
    DISCPER: 0,
    DISCOUNTAMOUNT: 0,
    AMOUNT: 0,
    GSTPER: 0,
    TOTAL: 0,
    IGSTAMOUNT: 0,
    CGSTAMOUNT: 0,
    SGSTAMOUNT: 0,
    SALEMANCODE: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toFixed(2);

function focusTagInput(ref: React.RefObject<HTMLInputElement | null>) {
    setTimeout(() => {
        if (ref.current) {
            ref.current.focus();
            ref.current.select();
        }
    }, 150); // Slightly longer timeout to ensure DOM updates
}

function focusField(name: string) {
    setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
        if (el) {
            el.focus();
            el.select();
        }
    }, 150);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesPage() {
    const { theme } = useTheme();
    const { setSidebarCollapsed } = useSidebar();
    const saveSales = useSaveSalesBatch();

    const [fields, setFields] = useState<any[]>([]);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [salesItems, setSalesItems] = useState<SalesItem[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [searchTag, setSearchTag] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [cashGiven, setCashGiven] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const tagNoRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isAddingRef = useRef(false);

    const { data: searchResult, isLoading } = useFetchSaleDetails(searchTag || undefined);

    // ── Side effects ────────────────────────────────────────────────────────────

    // Collapse sidebar on mount and focus tag input
    useEffect(() => {
        setSidebarCollapsed(true);
        focusTagInput(tagNoRef);
        return () => setSidebarCollapsed(false);
    }, [setSidebarCollapsed]);

    // Focus TagNo when salesItems changes (after add/delete) and not editing
    useEffect(() => {
        if (editingIndex === null) {
            focusTagInput(tagNoRef);
        }
    }, [salesItems.length, editingIndex]);

    // Populate form from API result
    useEffect(() => {
        if (!searchResult || isLoading) return;

        const d = searchResult.data || searchResult;
        if (!d || Object.keys(d).length === 0) {
            setIsSearching(false);
            return;
        }

        const rate = d.sellingRate || d.mrp || 0;
        const uom = d.weight > 0 ? "KGS" : "PCS";
        const amount = rate; // qty always starts at 1
        const cgstPer = d.aboveCgstTaxPer || 0;
        const sgstPer = d.aboveSgstTaxPer || 0;
        const gstPer = cgstPer + sgstPer;
        const cgstAmount = (amount * cgstPer) / 100;
        const sgstAmount = (amount * sgstPer) / 100;
        const taxAmount = cgstAmount + sgstAmount;

        setFormData(prev => ({
            ...prev,
            TAGNO: d.tagNo || d.orionBarcode || prev.TAGNO,
            PRODUCTNAME: d.productName || "",
            SUBPRODUCTNAME: d.subProductName || "",
            RATE: rate,
            QTY: "1",
            WEIGHT: d.weight || 0,
            UOM: uom,
            GSTPER: gstPer,
            CGSTPER: cgstPer,
            SGSTPER: sgstPer,
            IGSTPER: 0,
            AMOUNT: amount,
            DISCOUNTAMOUNT: 0,
            TAXAMOUNT: taxAmount,
            CGSTAMOUNT: cgstAmount,
            SGSTAMOUNT: sgstAmount,
            IGSTAMOUNT: 0,
            TOTAL: amount + taxAmount,
            PRODUCTCODE: d.productCode || 0,
            SUBPRODUCTCODE: d.subProductCode || 0,
            ORIONBARCODE: d.orionBarcode || "",
            MRP: d.mrp || rate,
            TAXPER: gstPer,
            HSNCODE: d.hsnCode || "",
            HSNTAXCODE: d.hsnTaxCode || 0,
            UNIQUEKEY: d.sourceTable || "TRN001",
            purchaseRate: d.purchaseRate,
            aboveCgstTaxPer: cgstPer,
            aboveSgstTaxPer: sgstPer,
            aboveIgstTaxPer: 0,
            belowSgstTaxPer: d.belowSgstTaxPer,
            belowIgstTaxPer: d.belowIgstTaxPer,
            belowCgstTaxPer: d.belowCgstTaxPer,
            belowSalesAmount: d.belowSalesAmount,
            sourceTable: d.sourceTable,
            pieces: d.pieces,
        }));

        toaster.create({
            title: "Product Found",
            description: `${d.productName}${d.subProductName ? " - " + d.subProductName : ""}`,
            type: "success",
            duration: 3000,
        });

        setIsSearching(false);
        setSearchTag("");
        focusField("QTY");
    }, [searchResult, isLoading]);

    // Rebuild form config when formData changes
    useEffect(() => {
        setFields(SalesConfig({ todayDate: new Date(), productDetails: formData, tagNoRef: tagNoRef as React.RefObject<HTMLInputElement>, }));
    }, [formData]);

    // ── Calculations ────────────────────────────────────────────────────────────

    const calcAmounts = useCallback((
        qty: number, rate: number, discPer: number,
        cgstPer: number, sgstPer: number, igstPer: number
    ) => {
        const amount = qty * rate;
        const discount = (amount * discPer) / 100;
        const taxBase = amount - discount;
        const igst = igstPer > 0 ? (taxBase * igstPer) / 100 : 0;
        const cgst = igstPer > 0 ? 0 : (taxBase * cgstPer) / 100;
        const sgst = igstPer > 0 ? 0 : (taxBase * sgstPer) / 100;
        const tax = igst + cgst + sgst;
        return {
            AMOUNT: amount,
            DISCOUNTAMOUNT: discount,
            TAXAMOUNT: tax,
            CGSTAMOUNT: cgst,
            SGSTAMOUNT: sgst,
            IGSTAMOUNT: igst,
            TOTAL: taxBase + tax,
        };
    }, []);

    // ── Handlers ────────────────────────────────────────────────────────────────

    const handleChange = useCallback((field: string | number, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === "TAGNO") {
                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = setTimeout(() => {
                    if (value?.length >= 4) {
                        setSearchTag(value);
                        setIsSearching(true);
                    }
                }, 500);
            }

            if (["QTY", "RATE", "DISCPER"].includes(field as string)) {
                const qty = Number(updated.QTY) || 0;
                const rate = Number(updated.RATE) || 0;
                if (qty > 0 && rate > 0) {
                    return {
                        ...updated,
                        ...calcAmounts(
                            qty, rate,
                            Number(updated.DISCPER) || 0,
                            prev.CGSTPER || 0,
                            prev.SGSTPER || 0,
                            prev.IGSTPER || 0,
                        ),
                    };
                }
            }

            return updated;
        });
    }, [calcAmounts]);

    const resetForm = useCallback((keepBase = true) => {
        setFormData(prev => ({
            ...initialFormData,
            ...(keepBase ? {
                BILLDATE: prev.BILLDATE,
                BILLTYPE: prev.BILLTYPE,
                SALEMANCODE: prev.SALEMANCODE
            } : {}),
        }));
        setEditingIndex(null);
    }, []);

    const validate = useCallback((): boolean => {
        const warn = (msg: string, focusFieldName?: string) => {
            toaster.create({ title: "Validation Error", description: msg, type: "warning", duration: 3000 });
            if (focusFieldName) focusField(focusFieldName);
        };

        if (!formData.TAGNO) {
            warn("Please scan or enter TagNo/Barcode", "TAGNO");
            return false;
        }
        if (!formData.PRODUCTNAME && !formData.SUBPRODUCTNAME) {
            warn("Product not found for this TagNo/Barcode", "TAGNO");
            return false;
        }
        if (!formData.QTY || Number(formData.QTY) <= 0) {
            warn("Please enter valid quantity", "QTY");
            return false;
        }
        if (!formData.SALEMANCODE || String(formData.SALEMANCODE).trim() === "") {
            warn("Please enter Salesman Code", "SALEMANCODE");
            return false;
        }

        return true;
    }, [formData]);

    const handleAddItem = useCallback((): boolean => {
        if (isAddingRef.current || !validate()) return false; // ← return false on failure
        isAddingRef.current = true;

        const productName = formData.SUBPRODUCTNAME
            ? `${formData.PRODUCTNAME} - ${formData.SUBPRODUCTNAME}`
            : formData.PRODUCTNAME;

        const newItem: SalesItem = {
            sno: editingIndex !== null ? editingIndex + 1 : salesItems.length + 1,
            tagNo: formData.TAGNO,
            productName,
            subProductName: formData.SUBPRODUCTNAME || "",
            qty: Number(formData.QTY),
            uom: formData.UOM,
            rate: Number(formData.RATE),
            weight: Number(formData.WEIGHT),
            discPer: Number(formData.DISCPER),
            discount: Number(formData.DISCOUNTAMOUNT),
            amount: Number(formData.AMOUNT),
            gst: Number(formData.TAXAMOUNT) || 0,
            total: Number(formData.TOTAL),
            PRODUCTCODE: formData.PRODUCTCODE || 0,
            SUBPRODUCTCODE: formData.SUBPRODUCTCODE || 0,
            ORIONBARCODE: formData.ORIONBARCODE || formData.TAGNO,
            WEIGHT: Number(formData.WEIGHT) || 0,
            MRP: formData.MRP || Number(formData.RATE),
            TAXPER: formData.TAXPER || formData.GSTPER,
            TAXAMOUNT: formData.TAXAMOUNT || 0,
            SGSTPER: formData.SGSTPER || 0,
            SGSTAMOUNT: formData.SGSTAMOUNT || 0,
            CGSTPER: formData.CGSTPER || 0,
            CGSTAMOUNT: formData.CGSTAMOUNT || 0,
            IGSTPER: formData.IGSTPER || 0,
            IGSTAMOUNT: formData.IGSTAMOUNT || 0,
            HSNCODE: formData.HSNCODE || "",
            HSNTAXCODE: formData.HSNTAXCODE || 0,
            SALEMANCODE: formData.SALEMANCODE || "001",
            UNIQUEKEY: formData.UNIQUEKEY || "TRN001",
        };

        setSalesItems(prev => {
            const list = editingIndex !== null
                ? prev.map((it, i) => i === editingIndex ? newItem : it)
                : [...prev, newItem];
            return list.map((it, i) => ({ ...it, sno: i + 1 }));
        });

        toaster.create({
            title: "Success",
            description: editingIndex !== null ? "Item updated" : "Item added",
            type: "success",
            duration: 2000,
        });

        resetForm();

        // Focus back to TagNo after state updates
        setTimeout(() => {
            focusTagInput(tagNoRef);
            isAddingRef.current = false;
        }, 200);

        return true; // ← return true on success
    }, [formData, salesItems.length, editingIndex, validate, resetForm]);
    const handleEditItem = useCallback((index: number) => {
        const item = salesItems[index];
        setFormData({
            ...initialFormData,
            BILLDATE: formData.BILLDATE,
            BILLTYPE: formData.BILLTYPE,
            TAGNO: item.tagNo,
            PRODUCTNAME: item.productName.split(" - ")[0] || item.productName,
            SUBPRODUCTNAME: item.subProductName,
            RATE: item.rate,
            QTY: item.qty,
            UOM: item.uom,
            WEIGHT: item.weight,
            DISCPER: item.discPer,
            DISCOUNTAMOUNT: item.discount,
            AMOUNT: item.amount,
            GSTPER: item.gst / Math.max(item.amount - item.discount, 1) * 100,
            TOTAL: item.total,
            IGSTAMOUNT: item.IGSTAMOUNT,
            CGSTAMOUNT: item.CGSTAMOUNT,
            SGSTAMOUNT: item.SGSTAMOUNT,
            SALEMANCODE: item.SALEMANCODE,
            PRODUCTCODE: item.PRODUCTCODE,
            SUBPRODUCTCODE: item.SUBPRODUCTCODE,
            ORIONBARCODE: item.ORIONBARCODE,
            MRP: item.MRP,
            TAXPER: item.TAXPER,
            TAXAMOUNT: item.TAXAMOUNT,
            HSNCODE: item.HSNCODE,
            HSNTAXCODE: item.HSNTAXCODE,
            UNIQUEKEY: item.UNIQUEKEY,
            CGSTPER: item.CGSTPER,
            SGSTPER: item.SGSTPER,
            IGSTPER: item.IGSTPER,
        });
        setEditingIndex(index);
        focusField("QTY");
    }, [salesItems, formData.BILLDATE, formData.BILLTYPE]);

    const handleDeleteItem = useCallback((index: number) => {
        setSalesItems(prev => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, sno: i + 1 })));
        toaster.create({ title: "Deleted", description: "Item removed", type: "info", duration: 2000 });

        // Focus back to TagNo after delete
        setTimeout(() => {
            focusTagInput(tagNoRef);
        }, 100);
    }, []);

    const handleSaveAll = () => setShowPaymentModal(true);

    // ── Navigation (Enter key) ──────────────────────────────────────────────────

    const fieldSequence = useMemo(() => fields.map(f => f.name), [fields]);

    const { register, focusNext } = useEnterNavigation(fieldSequence, () => {
        return handleAddItem(); // ← return the boolean
    });

    // ── Totals ──────────────────────────────────────────────────────────────────

    const totals = useMemo(() => ({
        amount: salesItems.reduce((s, i) => s + i.amount, 0),
        gst: salesItems.reduce((s, i) => s + i.gst, 0),
        discount: salesItems.reduce((s, i) => s + i.discount, 0),
        net: salesItems.reduce((s, i) => s + i.total, 0),
    }), [salesItems]);

    const balance = cashGiven - totals.net;

    // ── Render ──────────────────────────────────────────────────────────────────

    return (
        <Box
            fontWeight="semibold"
            bg={theme.colors.primary}
            color={theme.colors.secondary}
            p={3}
            height="100vh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            <Toaster />

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModeModal
                    totalAmount={totals.net}
                    onSave={handleSaveAll}
                    onBack={() => setShowPaymentModal(false)}
                />
            )}


            <Box flex="1" overflow="hidden">
                <Grid
                    templateColumns={{ base: "1fr", lg: "1fr 1.8fr" }}
                    gap={4}
                    height="100%"
                >

                    {/* Left: Form */}
                    <GridItem overflow="auto">
                        <VStack
                            bg={theme.colors.formColor}
                            p={4}
                            borderRadius="xl"
                            border="1px solid #eef"
                            gap={4}
                        >
                            <Text fontSize="md" fontWeight="600" color="blue.600">
                                SALES ENTRY {isSearching && <Text as="span" color="orange.400">(Searching...)</Text>}
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

                            <HStack mt={2} gap={4} width="100%" justify="center">
                                <Button
                                    type="button"
                                    size="sm"
                                    colorPalette="blue"
                                    onClick={handleAddItem}
                                    minW="120px"
                                    loading={isSearching || isLoading || saveSales.isPending}
                                >
                                    <AiOutlinePlus />
                                    {editingIndex !== null ? "Update Item" : "Add Item"}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    colorPalette="orange"
                                    onClick={() => {
                                        resetForm();
                                        focusTagInput(tagNoRef);
                                    }}
                                    minW="100px"
                                >
                                    <MdClear /> Clear
                                </Button>
                            </HStack>
                        </VStack>
                    </GridItem>

                    {/* Right: Table + Summary */}
                    <GridItem
                        minW={0}
                        display="flex"
                        flexDirection="column"
                        overflow="hidden"
                    >
                        <VStack gap={0} height="100%" align="stretch">

                            {/* Table header row */}
                            <Box
                                bg={theme.colors.formColor}
                                px={3}
                                pt={3}
                                pb={2}
                                borderRadius="xl xl 0 0"
                                border="1px solid #eef"
                                borderBottom="none"
                            >
                                <Flex justifyContent="space-between" alignItems="center">
                                    <Text fontWeight="bold" fontSize="md" color="blue.600">
                                        SALE ITEMS {salesItems.length > 0 && `(${salesItems.length})`}
                                    </Text>
                                    <Flex gap={2}>
                                        <Button size="sm" colorPalette="green" onClick={handleSaveAll} loading={saveSales.isPending}>
                                            <AiOutlineSave /> Save Bill
                                        </Button>
                                        <Button size="sm" colorPalette="red" onClick={() => {
                                            setSalesItems([]);
                                            setCashGiven(0);
                                            resetForm();
                                            focusTagInput(tagNoRef);
                                        }}>
                                            <MdClear /> Clear All
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Box>


                            {/* Scrollable items table */}
                            <Box
                                flex="1"
                                maxH="410px" // ← limit table height
                                overflowY="auto"
                                bg={theme.colors.formColor}
                                border="1px solid #eef"
                                borderTop="1px solid #dde"
                                borderBottom="none"
                            >
                                {salesItems.length > 0 ? (
                                    <Table.Root size="sm" variant="outline" style={{ tableLayout: "fixed", width: "100%" }}>
                                        <Table.Header bg="blue.800" position="sticky" top={0} zIndex={1}>
                                            <Table.Row>
                                                <Table.ColumnHeader color="white" w="45px">SNo</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white">Product</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" textAlign="right" w="70px">Rate</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" textAlign="right" w="50px">Qty</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" w="50px">UOM</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" textAlign="right" w="70px">Wt</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" textAlign="right" w="60px">Disc%</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" textAlign="right" w="80px">Amt</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" textAlign="right" w="70px">GST</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" textAlign="right" w="80px">Total</Table.ColumnHeader>
                                                <Table.ColumnHeader color="white" w="60px">Act</Table.ColumnHeader>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {salesItems.map((item, index) => (
                                                <Table.Row key={item.sno} bg={theme.colors.primary}>
                                                    <Table.Cell>{item.sno}</Table.Cell>
                                                    <Table.Cell style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.productName}</Table.Cell>
                                                    <Table.Cell textAlign="right">{fmt(item.rate)}</Table.Cell>
                                                    <Table.Cell textAlign="right">{item.qty}</Table.Cell>
                                                    <Table.Cell>{item.uom}</Table.Cell>
                                                    <Table.Cell textAlign="right">{item.weight?.toFixed(3)}</Table.Cell>
                                                    <Table.Cell textAlign="right">{fmt(item.discPer)}%</Table.Cell>
                                                    <Table.Cell textAlign="right">{fmt(item.amount)}</Table.Cell>
                                                    <Table.Cell textAlign="right">{fmt(item.gst)}</Table.Cell>
                                                    <Table.Cell textAlign="right" fontWeight="bold">{fmt(item.total)}</Table.Cell>
                                                    <Table.Cell>
                                                        <HStack gap={1}>
                                                            {/* <Button size="2xs" colorPalette="blue" onClick={() => handleEditItem(index)}><MdEdit /></Button> */}
                                                            <Button size="2xs" colorPalette="red" onClick={() => handleDeleteItem(index)}><MdDelete /></Button>
                                                        </HStack>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                ) : (
                                    <Box textAlign="center" py={10}>
                                        <AiOutlineBarcode size={40} style={{ margin: "0 auto", opacity: 0.4 }} />
                                        <Text color="gray.500" mt={2} fontSize="sm">Scan barcode or enter TagNo to add items</Text>
                                    </Box>
                                )}
                            </Box>

                            {/* Fixed summary at bottom */}
                            <Box
                                bg={theme.colors.formColor}
                                border="1px solid #eef"
                                borderTop="2px solid #ccd"
                                borderRadius="0 0 xl xl"
                                p={3}
                            >
                                <Grid templateColumns="repeat(4, 1fr)" gap={3} mb={salesItems.length > 0 ? 3 : 0}>
                                    <Box textAlign="center" bg={theme.colors.primary} borderRadius="md" p={2}>
                                        <Text fontSize="xs" color="gray.500">Amount</Text>
                                        <Text fontWeight="bold" fontSize="sm">₹{fmt(totals.amount)}</Text>
                                    </Box>
                                    <Box textAlign="center" bg={theme.colors.primary} borderRadius="md" p={2}>
                                        <Text fontSize="xs" color="gray.500">Discount</Text>
                                        <Text fontWeight="bold" fontSize="sm" color="orange.500">₹{fmt(totals.discount)}</Text>
                                    </Box>
                                    <Box textAlign="center" bg={theme.colors.primary} borderRadius="md" p={2}>
                                        <Text fontSize="xs" color="gray.500">GST</Text>
                                        <Text fontWeight="bold" fontSize="sm">₹{fmt(totals.gst)}</Text>
                                    </Box>
                                    <Box textAlign="center" bg="green.50" borderRadius="md" p={2}>
                                        <Text fontSize="xs" color="green.600">Net Payable</Text>
                                        <Text fontWeight="bold" fontSize="sm" color="green.600">₹{fmt(totals.net)}</Text>
                                    </Box>
                                </Grid>
                            </Box>

                        </VStack>
                    </GridItem>
                </Grid>
            </Box>

        </Box>
    );
}
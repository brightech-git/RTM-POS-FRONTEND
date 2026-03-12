"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    Box,
    Button,
    VStack,
    Text,
    Grid,
    GridItem,
    HStack,
    Fieldset,
    NativeSelect,
    Flex,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { toastError, toastLoaded } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import {
    useAllHSNLinks,
    useCreateHSNLink,
    useUpdateHSNLink,
    useDeleteHSNLink,
} from "@/hooks/HSNLink/useHSNLink";
import { useAllProducts } from "@/hooks/product/useProducts";
import { useAllHSN } from "@/hooks/HSN/useHSN";
import { MultiSelectCombobox, SelectItem } from "@/components/ui/MultiSelectComboBox";
import { SelectCombobox } from "@/components/ui/selectComboBox";

// Types
interface HSNLink {
    PRODUCTCODE?: number;
    HSNCODE: string;
    ACTIVE: "Y" | "N";
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
    PRODUCTNAME?: string;
    HSNDESCRIPTION?: string;
}

interface CreateHSNLinkPayload {
    PRODUCTCODE: number[];
    HSNCODE: number;
    ACTIVE: "Y" | "N";
}

interface UpdateHSNLinkPayload {
    PRODUCTCODE: number;
    HSNCODE: number;
    ACTIVE: "Y" | "N";
}

interface Product {
    PRODUCTCODE: number;
    PRODUCTNAME: string;
    SHORTNAME: string;
    ACTIVE: string;
}

interface HSN {
    HSNCODE: string;
    HSNDESCRIPTION?: string;
    ACTIVE: string;
}

export default function HSNLinkMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    // Refs for focus management
    const productRef = useRef<HTMLInputElement>(null);
    const hsnRef = useRef<HTMLInputElement>(null);
    const saveRef = useRef<HTMLButtonElement>(null);

    /* -------------------- API HOOKS -------------------- */
    const { data: hsnLinks = [], isLoading: isApiLoading, refetch: hsnLinkRefetch } = useAllHSNLinks();
    const { data: products = [], isLoading: productsLoading } = useAllProducts();
    const { data: hsnList = [] as HSN[], isLoading: hsnLoading } = useAllHSN();
    const createMutation = useCreateHSNLink();
    const updateMutation = useUpdateHSNLink();
    const deleteMutation = useDeleteHSNLink();

    const [isLoading, setIsLoading] = useState(false);

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: CreateHSNLinkPayload = {
        PRODUCTCODE: [],
        HSNCODE: 0,
        ACTIVE: "Y",
    };

    const [form, setForm] = useState<CreateHSNLinkPayload>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    /* -------------------- SELECT OPTIONS -------------------- */
    const activeStatus = [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
    ];

    // Transform products to SelectItem format for multi-select
    const productItems: SelectItem[] = useMemo(() => {
        return products
            .filter((p: Product) => p.ACTIVE === "Y")
            .map((product: Product) => ({
                label: `${product.PRODUCTNAME} (${product.PRODUCTCODE})`,
                value: product.PRODUCTCODE.toString(),
            }));
    }, [products]);

    // Transform HSN to SelectItem format
    const hsnItems: SelectItem[] = useMemo(() => {
        return (hsnList as HSN[])
            .filter((h: HSN) => h.ACTIVE === "Y")
            .map((hsn: HSN): SelectItem => ({
                label: `${hsn.HSNCODE} - ${hsn.HSNDESCRIPTION}`,
                value: hsn.HSNCODE,
            }));
    }, [hsnList]);

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editId) {
            // Find the specific link by PRODUCTCODE (since each record is unique)
            const linkToEdit = hsnLinks.find(
                (link: any) => link.PRODUCTCODE === editId
            );
            
            if (linkToEdit) {
                setForm({
                    PRODUCTCODE: [linkToEdit.PRODUCTCODE!],
                    HSNCODE: Number(linkToEdit.HSNCODE),
                    ACTIVE: linkToEdit.ACTIVE,
                });
                toastLoaded("HSN Link");
                ScrollToTop();
            }
        }
    }, [editId, hsnLinks]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof CreateHSNLinkPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleProductChange = (values: string[]) => {
        const productCodes = values.map(v => parseInt(v)).filter(v => !isNaN(v));
        handleChange("PRODUCTCODE", productCodes);
    };

    const resetForm = () => {
        setEditId(null);
        setForm(emptyForm);
    };

    const validateForm = () => {
        if (!form.PRODUCTCODE || form.PRODUCTCODE.length === 0) {
            toastError("Please select at least one product");
            productRef.current?.focus();
            return false;
        }
        if (!form.HSNCODE) {
            toastError("Please select an HSN code");
            hsnRef.current?.focus();
            return false;
        }
        return true;
    };

 const handleSave = async () => {
    if (!validateForm()) return;

    try {
        setIsLoading(true);

        if (editId !== null) {
            // 🔁 UPDATE (single record)
            const updatePayload: UpdateHSNLinkPayload = {
                PRODUCTCODE: editId,
                HSNCODE: Number(form.HSNCODE),
                ACTIVE: form.ACTIVE,
            };

            await updateMutation.mutateAsync({
                id: editId,
                payload: updatePayload,
            });

            toaster.success({
                title: "Success",
                description: "HSN Link updated successfully",
            });

            setHighlightedId(editId);

        } else {
            // 🆕 CREATE (single API call with array payload)
            const createPayload: CreateHSNLinkPayload = {
                PRODUCTCODE: form.PRODUCTCODE,
                HSNCODE: Number(form.HSNCODE),
                ACTIVE: form.ACTIVE,
            };

            await createMutation.mutateAsync(createPayload);

            toaster.success({
                title: "Success",
                description: `${form.PRODUCTCODE.length} HSN Links created successfully`,
            });
        }

        await hsnLinkRefetch();
        resetForm();

    } catch (error: any) {
        console.error("Save error:", error);
        toaster.error({
            title: "Error",
            description: error?.message || "Operation failed",
        });
    } finally {
        setIsLoading(false);
    }
};

    const handleEdit = (link: HSNLink) => {
        if (link.PRODUCTCODE === undefined || link.PRODUCTCODE === null) return;
        setEditId(link.PRODUCTCODE);
        // The useEffect will handle populating the form
    };

    const handleDelete = async (productCode: number) => {
        if (window.confirm("Are you sure you want to delete this HSN Link?")) {
            try {
                setIsLoading(true);
                
                await deleteMutation.mutateAsync(productCode);

                toaster.success({ 
                    title: "Success", 
                    description: "HSN Link deleted successfully" 
                });
                await hsnLinkRefetch();
                
                if (editId === productCode) {
                    resetForm();
                }
            } catch (error: any) {
                console.error("Delete error:", error);
                toaster.error({ 
                    title: "Error", 
                    description: error?.message || "Delete failed" 
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Enrich HSN links with product and HSN details for display
  const enrichedData = useMemo(() => {
    return hsnLinks.map((link: any) => {
        const product = products.find(
            (p: Product) => p.PRODUCTCODE === link.PRODUCTCODE
        );

        // Cast to HSN so TS knows it has HSNDESCRIPTION
        const hsn = hsnList.find(
            (h: any): h is any => h.HSNCODE === String(link.HSNCODE)
        );

        return {
            ...link,
            PRODUCTNAME: product?.PRODUCTNAME || "N/A",
            HSNDESCRIPTION: hsn?.HSNDESCRIPTION ?? "N/A", // ✅ now TS is happy
        };
    });
}, [hsnLinks, products, hsnList]);

    /* -------------------- TABLE COLUMNS -------------------- */
    const hsnLinkColumns = [
        { key: 'SNO', label: 'S.No' },
        { key: 'PRODUCTCODE', label: 'Product Code' },
        { key: 'PRODUCTNAME', label: 'Product Name' },
        { key: 'HSNCODE', label: 'HSN Code' },
        { key: 'HSNDESCRIPTION', label: 'HSN Description' },
        { key: 'ACTIVE', label: 'Status' },
        { key: 'CREATEDDATE', label: 'Created Date' },
        { key: 'actions', label: 'Actions' },
    ];

    /* -------------------- FORMAT HELPERS -------------------- */
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(enrichedData);
        setColumns([
            { key: "PRODUCTCODE", label: "Product Code" },
            { key: "PRODUCTNAME", label: "Product Name" },
            { key: "HSNCODE", label: "HSN Code" },
            { key: "HSNDESCRIPTION", label: "HSN Description" },
            { key: "ACTIVE", label: "Status" },
        ]);
        setShowSno(true);
        title?.("HSN Link Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- UI -------------------- */
    return (
        <Box
            fontWeight="semibold"
            bg={theme.colors.primary}
            color={theme.colors.secondary}
        >
            <Toaster />
            <Grid templateColumns={{ base: "1fr", lg: "600px 1fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            HSN LINK MASTER
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={3} width="100%">
                                    {/* PRODUCT MULTI-SELECTION */}
                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                        <Box minW="110px" fontSize="2xs">PRODUCTS :</Box>
                                        <Box flex={1}>
                                            <MultiSelectCombobox
                                                ref={productRef}
                                                value={form.PRODUCTCODE.map(code => code.toString())}
                                                onChange={handleProductChange}
                                                items={productItems}
                                                placeholder="Select products"
                                                disable={!!editId}
                                            />
                                        </Box>
                                    </Box>

                                    {/* HSN SELECTION */}
                                    <Box display="flex" alignItems="center" gap={2} mt={2}>
                                        <Box minW="110px" fontSize="2xs">HSN CODE :</Box>
                                        <Box flex={1}>
                                            <SelectCombobox
                                                ref={hsnRef}
                                                value={form.HSNCODE.toString()}
                                                onChange={(value) => {
                                                    handleChange("HSNCODE", parseInt(value));
                                                    // Focus on save after HSN selection
                                                    setTimeout(() => saveRef.current?.focus(), 100);
                                                }}
                                                editId={editId}
                                                items={hsnItems}
                                                placeholder="Select HSN code"
                                                onEnter={() => saveRef.current?.focus()}
                                            />
                                        </Box>
                                    </Box>

                                    {/* ACTIVE STATUS */}
                                    <Box display="flex" alignItems="center" gap={2} mt={2}>
                                        <Box minW="110px" fontSize="2xs">STATUS :</Box>
                                        <NativeSelect.Root size="xs" maxW="100px" fontSize="2xs">
                                            <NativeSelect.Field
                                                value={form.ACTIVE}
                                                onChange={(e) => handleChange("ACTIVE", e.target.value as "Y" | "N")}
                                                css={{
                                                    backgroundColor: "#eee",
                                                    color: "#111827",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "20px",
                                                    height: "30px",
                                                    fontSize: "10px",
                                                }}
                                            >
                                                {activeStatus.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                    </Box>
                                </Grid>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack width="100%" pt={2}>
                            <Button
                                ref={saveRef}
                                size="xs"
                                colorPalette="blue"
                                loading={isLoading || createMutation.isPending || updateMutation.isPending}
                                onClick={handleSave}
                                flex={1}
                            >
                                <AiOutlineSave /> {editId ? "Update" : "Save"}
                            </Button>
                            <Button size="xs" colorPalette="blue" onClick={resetForm} flex={1}>
                                <IoIosExit /> CLEAR
                            </Button>
                        </HStack>
                    </VStack>
                </GridItem>

                {/* ---------------- TABLE ---------------- */}
                <GridItem minW={0}>
                    <Box bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Box display='flex' mb={2} gap={2} justifyContent='space-between' alignItems='center'>
                            <Text fontWeight="semibold" fontSize="small">
                                HSN LINK LIST
                            </Text>

                            <Flex>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    color={theme.colors.green}
                                    _hover={{ color: "black" }}
                                    onClick={() => handleExport("excel")}
                                    aria-label="Export Excel"
                                >
                                    <FaFileExcel />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="xs"
                                    color={theme.colors.primaryText}
                                    _hover={{ color: "black" }}
                                    onClick={() => handleExport("pdf")}
                                    aria-label="Export PDF"
                                >
                                    <FaPrint />
                                </Button>
                            </Flex>
                        </Box>

                        <CustomTable
                            columns={hsnLinkColumns}
                            data={enrichedData}
                            isLoading={isApiLoading || productsLoading || hsnLoading || isLoading}
                            renderRow={(item: any, index: number) => (
                                <>
                                    <Table.Cell>{index + 1}</Table.Cell>
                                    <Table.Cell>
                                        <Text fontWeight="medium">{item.PRODUCTCODE}</Text>
                                    </Table.Cell>
                                    <Table.Cell>{item.PRODUCTNAME}</Table.Cell>
                                    <Table.Cell>{item.HSNCODE}</Table.Cell>
                                    <Table.Cell>{item.HSNDESCRIPTION}</Table.Cell>
                                    <Table.Cell>
                                        <Badge 
                                            colorPalette={item.ACTIVE === "Y" ? "green" : "red"}
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {item.ACTIVE === "Y" ? "Active" : "Inactive"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatDate(item.CREATEDDATE)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" gap={2}>
                                            <FaEdit 
                                                onClick={() => handleEdit(item)} 
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                            />
                                            <FaTrash 
                                                onClick={() => handleDelete(item.PRODUCTCODE!)} 
                                                cursor="pointer"
                                                color="red.500"
                                                size={14}
                                            />
                                        </Box>
                                    </Table.Cell>
                                </>
                            )}
                            headerBg="blue.800"
                            headerColor="white"
                            borderColor="white"
                            bodyBg={theme.colors.primary}
                            highlightRowId={highlightedId ? Number(highlightedId) : null}
                            rowIdKey="PRODUCTCODE"
                            emptyText="No HSN Links available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

// Badge component helper
const Badge = ({ children, colorPalette, fontSize, px, py, borderRadius }: any) => {
    const bgColor = 
        colorPalette === "green" ? "green.100" : 
        colorPalette === "red" ? "red.100" :
        colorPalette === "blue" ? "blue.100" : "gray.100";
    
    const textColor = 
        colorPalette === "green" ? "green.800" : 
        colorPalette === "red" ? "red.800" :
        colorPalette === "blue" ? "blue.800" : "gray.800";
    
    return (
        <Box
            as="span"
            bg={bgColor}
            color={textColor}
            fontSize={fontSize}
            px={px}
            py={py}
            borderRadius={borderRadius}
            display="inline-block"
            fontWeight="medium"
        >
            {children}
        </Box>
    );
};
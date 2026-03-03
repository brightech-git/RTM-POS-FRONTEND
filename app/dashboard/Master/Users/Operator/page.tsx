"use client";

import React, { useState, useEffect } from "react";
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
    IconButton,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/component/form/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import  ActiveSelect  from "@/components/ui/ActiveSelect";

/* ================= TYPES ================= */
interface Operator {
    id: string;
    operatorName: string;
    employeeName: string;
    password: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CreateOperatorPayload {
    operatorName: string;
    employeeName: string;
    password: string;
    isActive: boolean;
}

/* ================= MOCK DATA ================= */
const MOCK_OPERATORS: Operator[] = [
    {
        id: "1",
        operatorName: "OP001",
        employeeName: "John Doe",
        password: "Password123",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        operatorName: "OP002",
        employeeName: "Jane Smith",
        password: "Password456",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        operatorName: "OP003",
        employeeName: "Mike Johnson",
        password: "Password789",
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

export default function OperatorMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- STATE -------------------- */
    const [operators, setOperators] = useState<Operator[]>(MOCK_OPERATORS);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: CreateOperatorPayload = {
        operatorName: "",
        employeeName: "",
        password: "",
        isActive: true,
    };

    const [form, setForm] = useState<CreateOperatorPayload>(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    /* -------------------- ACTIVE STATUS OPTIONS -------------------- */
    const activeStatus = [
        { label: "YES", value: "true" },
        { label: "NO", value: "false" },
    ];

    /* -------------------- FILTER AND PAGINATION -------------------- */
    const filteredOperators = operators.filter(
        (op) =>
            op.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(filteredOperators.length / ITEMS_PER_PAGE);

    const paginatedOperators = filteredOperators.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (editId) {
            const operatorToEdit = operators.find((op) => op.id === editId);
            if (operatorToEdit) {
                setForm({
                    operatorName: operatorToEdit.operatorName,
                    employeeName: operatorToEdit.employeeName,
                    password: operatorToEdit.password,
                    isActive: operatorToEdit.isActive,
                });
                ScrollToTop();
            }
        }
    }, [editId, operators]);

    useEffect(() => {
        if (!highlightedId) return;

        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof CreateOperatorPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm(emptyForm);
        setShowPassword(false);
    };

    const validateForm = () => {
        if (!form.operatorName?.trim()) {
            toaster.error({ title: "Error", description: "Operator name is required" });
            return false;
        }
        if (form.operatorName.length > 50) {
            toaster.error({ title: "Error", description: "Operator name must be at most 50 characters" });
            return false;
        }
        if (!/^[A-Za-z0-9]+$/.test(form.operatorName)) {
            toaster.error({ title: "Error", description: "Only alphanumeric characters allowed" });
            return false;
        }
        if (!form.employeeName?.trim()) {
            toaster.error({ title: "Error", description: "Employee name is required" });
            return false;
        }
        if (!form.password?.trim()) {
            toaster.error({ title: "Error", description: "Password is required" });
            return false;
        }
        if (form.password.length < 6) {
            toaster.error({ title: "Error", description: "Password must be at least 6 characters" });
            return false;
        }
        if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
            toaster.error({ title: "Error", description: "Password must contain uppercase and number" });
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (editId) {
            // Update
            setOperators((prev) =>
                prev.map((op) =>
                    op.id === editId
                        ? {
                              ...op,
                              ...form,
                              updatedAt: new Date().toISOString(),
                          }
                        : op
                )
            );
            toaster.success({
                title: "Success",
                description: "Operator updated successfully",
            });
            setHighlightedId(editId);
        } else {
            // Create
            const newOperator: Operator = {
                id: Date.now().toString(),
                ...form,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setOperators((prev) => [newOperator, ...prev]);
            toaster.success({
                title: "Success",
                description: "Operator created successfully",
            });
        }

        setIsSubmitting(false);
        resetForm();
    };

    const handleEdit = (operator: Operator) => {
        setEditId(operator.id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this operator?")) {
            setOperators((prev) => prev.filter((op) => op.id !== id));
            toaster.success({
                title: "Success",
                description: "Operator deleted successfully",
            });
        }
    };

    /* -------------------- FORMAT HELPERS -------------------- */
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /* -------------------- TABLE COLUMNS -------------------- */
    const operatorColumns = [
        { key: "SNO", label: "S.No" },
        { key: "operatorName", label: "Operator Name" },
        { key: "employeeName", label: "Employee Name" },
        { key: "isActive", label: "Status" },
        { key: "createdAt", label: "Created Date" },
        { key: "createdTime", label: "Created Time" },
        { key: "actions", label: "Actions" },
    ];

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(operators);
        setColumns([
            { key: "operatorName", label: "Operator Name" },
            { key: "employeeName", label: "Employee Name" },
            { key: "isActive", label: "Status" },
            { key: "createdAt", label: "Created Date" },
            { key: "updatedAt", label: "Updated Date" },
        ]);
        setShowSno(true);
        title?.("Operator Master");
        router.push(`/print?export=${option}`);
    };

    /* ------------------ PASSWORD TOGGLE ------------------ */
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    /* -------------------- UI -------------------- */
    return (
        <Box
            fontWeight="semibold"
            bg={theme.colors.primary}
            color={theme.colors.secondary}
            minH="100vh"
            p={4}
        >
            <Toaster />
            <Grid templateColumns={{ base: "1fr", lg: "450px 1fr" }} gap={4}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack
                        bg={theme.colors.formColor}
                        p={4}
                        borderRadius="xl"
                        border="1px solid #eef"
                        align="stretch"
                    >
                        <Text fontSize="small" fontWeight="600" textAlign="center" mb={2}>
                            OPERATOR MASTER
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={3} width="100%">
                                    {/* OPERATOR NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="120px" fontSize="2xs">
                                            OPERATOR NAME :
                                        </Box>
                                        <CapitalizedInput
                                            field="operatorName"
                                            value={form.operatorName}
                                            onChange={handleChange}
                                            size="2xs"
                                            placeholder="Enter operator name"
                                            max={50}
                                        />
                                    </Box>

                                    {/* EMPLOYEE NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="120px" fontSize="2xs">
                                            EMPLOYEE NAME :
                                        </Box>
                                        <CapitalizedInput
                                            field="employeeName"
                                            value={form.employeeName}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                            placeholder="Enter employee name"
                                            max={50}
                                        />
                                    </Box>

                                    {/* PASSWORD */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="120px" fontSize="2xs">
                                            PASSWORD :
                                        </Box>
                                        <Flex flex={1} align="center" gap={1}>
                                            <CapitalizedInput
                                                field="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                type={showPassword ? "text" : "password"}
                                                size="2xs"
                                                placeholder="Enter password"
                                            />
                                            <IconButton
                                                aria-label="Toggle password"
                                                size="2xs"
                                                variant="ghost"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                                            </IconButton>
                                        </Flex>
                                    </Box>

                                    {/* ACTIVE STATUS */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="120px" fontSize="2xs">
                                            STATUS :
                                        </Box>
                                        <Box flex={1}>
                                            <ActiveSelect
                                                value={String(form.isActive)}
                                                onChange={(val) => handleChange("isActive", val === "true")}
                                                items={activeStatus}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack width="100%" pt={3} gap={2}>
                            <Button
                                size="xs"
                                colorPalette="blue"
                                loading={isSubmitting}
                                onClick={handleSave}
                                flex={1}
                            >
                                <AiOutlineSave /> {editId ? "Update" : "Save"}
                            </Button>
                            <Button size="xs" colorPalette="blue" onClick={resetForm} flex={1}>
                                <IoIosExit /> Exit
                            </Button>
                        </HStack>
                    </VStack>
                </GridItem>

                {/* ---------------- TABLE ---------------- */}
                <GridItem minW={0}>
                    <Box
                        bg={theme.colors.formColor}
                        p={3}
                        borderRadius="xl"
                        border="1px solid #eef"
                    >
                        <Flex
                            direction={{ base: "column", sm: "row" }}
                            justify="space-between"
                            align={{ base: "start", sm: "center" }}
                            mb={3}
                            gap={2}
                        >
                            <Text fontWeight="semibold" fontSize="small">
                                OPERATOR LIST
                            </Text>

                            <Flex gap={2} align="center">
                                {/* Search Input */}
                                <CapitalizedInput
                                    field="search"
                                    value={searchTerm}
                                    onChange={(_, val) => setSearchTerm(val as string)}
                                    placeholder="Search..."
                                    size="2xs"
                                    width="200px"
                                />

                                {/* Export Buttons */}
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
                        </Flex>

                        <CustomTable
                            columns={operatorColumns}
                            data={paginatedOperators}
                            isLoading={isLoading}
                            renderRow={(operator: Operator, index: number) => (
                                <>
                                    <Table.Cell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Table.Cell>
                                    <Table.Cell>{operator.operatorName}</Table.Cell>
                                    <Table.Cell>{operator.employeeName}</Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            colorPalette={operator.isActive ? "green" : "red"}
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {operator.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>{formatDate(operator.createdAt)}</Table.Cell>
                                    <Table.Cell>{formatTime(operator.createdAt)}</Table.Cell>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" gap={2}>
                                            <FaEdit
                                                onClick={() => handleEdit(operator)}
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                            />
                                            <FaTrash
                                                onClick={() => handleDelete(operator.id)}
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
                            highlightRowId={highlightedId}
                            rowIdKey="id"
                            emptyText="No operators available"
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Flex justify="space-between" align="center" mt={3} pt={2} borderTopWidth="1px">
                                <Text fontSize="2xs">
                                    Page {currentPage} of {totalPages}
                                </Text>
                                <HStack gap={1}>
                                    <Button
                                        size="2xs"
                                        variant="outline"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Prev
                                    </Button>
                                    <Button size="2xs" variant="solid" colorPalette="blue">
                                        {currentPage}
                                    </Button>
                                    <Button
                                        size="2xs"
                                        variant="outline"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </HStack>
                            </Flex>
                        )}
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

// Badge component helper
const Badge = ({ children, colorPalette, fontSize, px, py, borderRadius }: any) => {
    const bgColor = colorPalette === "green" ? "green.100" : "red.100";
    const textColor = colorPalette === "green" ? "green.800" : "red.800";

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
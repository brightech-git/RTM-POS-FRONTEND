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
    Flex,
    IconButton,
    Spinner,
    Badge,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/components/ui/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { NativeSelectWrapper } from "@/components/ui/NativeSelectWrapper";
import { SelectCombobox } from "@/components/ui/selectComboBox";
import { useAllEmployees } from "@/hooks/Employee/useEmployee";
import { 
    useAllOperators,
    useRegisterOperator, 
    useDeleteOperator,
    useUpdateOperatorPassword 
} from "@/hooks/useOperator/useOperator";

/* ================= TYPES ================= */
interface Operator {
    ACTIVE: "Y" | "N";
    CREATED_BY: number;
    CREATED_DATE: string;
    CREATED_TIME: string;
    EMP_CODE: string;
    OPER_CODE: number;
    OPER_NAME: string;
    PASSWORD?: string | null;
    employeeName?: string; // For display purposes
}

interface OperatorFormData {
    OPER_NAME: string;
    EMP_CODE: string;
    PASSWORD: string;
    ACTIVE: "Y" | "N";
}

// Employee interface matching the EmployeeMaster structure
interface Employee {
    EMPNAME?: string;
    EMPSURNAME?: string;
    EMPFATHERNAME?: string;
    SALUTATION?: string;
    DOORNO?: string;
    STREET?: string;
    ADDRESS?: string;
    AREA?: string;
    CITY?: string;
    STATE?: string;
    PINCODE?: string;
    PHONENO?: string;
    MOBILENO?: string;
    ACTIVE?: string;
    CREATEDBY?: number;
    EMPUID?: number; // This might be the employee code/id
    EMP_CODE?: string; // Some APIs use this
    EMPCODE?: string; // Some APIs use this
}

export default function OperatorMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: operators = [], isLoading, refetch: refetchOperators } = useAllOperators();
    console.log("Fetched operators:", operators); // Debug log for operators data
    const { data: employees = [], isLoading: isLoadingEmployees } = useAllEmployees();
    
    const registerOperator = useRegisterOperator();
    const deleteOperator = useDeleteOperator();
    const updatePassword = useUpdateOperatorPassword();

    /* -------------------- EMPLOYEE OPTIONS FOR DROPDOWN -------------------- */
    const employeeOptions = employees.map((emp: Employee) => {
        // Try different possible employee code fields
        // From your EmployeeMaster, the employee might have EMPUID as the unique identifier
        const empCode = emp.EMP_CODE || emp.EMPCODE || emp.EMPUID?.toString() || '';
        
        // Combine first name and surname for full name
        const firstName = emp.EMPNAME || '';
        const lastName = emp.EMPSURNAME || '';
        const employeeName = `${firstName} ${lastName}`.trim();
        
        return {
            label: employeeName ? `${employeeName} (${empCode})` : empCode,
            value: empCode,
            employeeName: employeeName,
            empCode: empCode
        };
    }).filter(opt => opt.value); // Filter out options without code

    /* -------------------- STATE -------------------- */
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: OperatorFormData = {
        OPER_NAME: "",
        EMP_CODE: "",
        PASSWORD: "",
        ACTIVE: "Y",
    };

    const [form, setForm] = useState<OperatorFormData>(emptyForm);
    const [editCode, setEditCode] = useState<number | null>(null);
    const [highlightedCode, setHighlightedCode] = useState<number | null>(null);

    /* -------------------- ACTIVE STATUS OPTIONS -------------------- */
    const activeStatus = [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
    ];

    /* -------------------- ENRICH OPERATORS WITH EMPLOYEE NAMES -------------------- */
    const enrichedOperators = (Array.isArray(operators) ? operators : []).map((op: Operator) => {
        // Find matching employee
        const employee = employees.find((emp: Employee) => {
            // Try to match using various possible code fields
            const empCode = emp.EMP_CODE || emp.EMPCODE || emp.EMPUID?.toString() || '';
            return empCode === op.EMP_CODE;
        });
        
        // Construct employee name from first name and surname
        const employeeName = employee ? 
            `${employee.EMPNAME || ''} ${employee.EMPSURNAME || ''}`.trim() : '';
        
        return {
            ...op,
            employeeName: employeeName || 'N/A'
        };
    });

    /* -------------------- FILTER AND PAGINATION -------------------- */
    const filteredOperators = enrichedOperators.filter(
        (op: Operator) =>
            op.OPER_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.EMP_CODE?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ITEMS_PER_PAGE = 10;
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
        if (editCode) {
            const operatorList = Array.isArray(operators) ? operators : operators?.data || [];
            const operatorToEdit = operatorList.find((op: Operator) => op.OPER_CODE === editCode);
            if (operatorToEdit) {
                setForm({
                    OPER_NAME: operatorToEdit.OPER_NAME,
                    EMP_CODE: operatorToEdit.EMP_CODE,
                    PASSWORD: "", // Don't populate password for security
                    ACTIVE: operatorToEdit.ACTIVE,
                });
                ScrollToTop();
            }
        }
    }, [editCode, operators]);

    useEffect(() => {
        if (!highlightedCode) return;

        const timer = setTimeout(() => {
            setHighlightedCode(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedCode]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof OperatorFormData, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEmployeeSelect = (empCode: string) => {
        const selectedOption = employeeOptions.find(opt => opt.value === empCode);
        
        if (selectedOption) {
            setForm((prev) => ({
                ...prev,
                EMP_CODE: selectedOption.empCode,
            }));
            
            // Optionally set operator name from employee name
            // Uncomment if you want to auto-populate operator name
            // if (!form.OPER_NAME) {
            //     setForm((prev) => ({
            //         ...prev,
            //         OPER_NAME: selectedOption.employeeName,
            //     }));
            // }
        }
    };

    const resetForm = () => {
        setEditCode(null);
        setForm(emptyForm);
        setShowPassword(false);
    };

    const validateForm = () => {
        if (!form.OPER_NAME?.trim()) {
            toaster.error({ title: "Error", description: "Operator name is required" });
            return false;
        }
        if (form.OPER_NAME.length > 50) {
            toaster.error({ title: "Error", description: "Operator name must be at most 50 characters" });
            return false;
        }
        if (!/^[A-Za-z0-9\s]+$/.test(form.OPER_NAME)) {
            toaster.error({ title: "Error", description: "Only alphanumeric characters and spaces allowed" });
            return false;
        }
        if (!form.EMP_CODE) {
            toaster.error({ title: "Error", description: "Please select an employee" });
            return false;
        }
        if (!editCode && !form.PASSWORD?.trim()) {
            toaster.error({ title: "Error", description: "Password is required for new operator" });
            return false;
        }
        if (!editCode && form.PASSWORD.length < 6) {
            toaster.error({ title: "Error", description: "Password must be at least 6 characters" });
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            if (editCode) {
                // For update, you'll need to implement an update endpoint
                toaster.info({ 
                    title: "Info", 
                    description: "Update functionality - please implement update endpoint" 
                });
            } else {
                // Create new operator
                const payload = {
                    OPER_NAME: form.OPER_NAME,
                    EMP_CODE: form.EMP_CODE,
                    PASSWORD: form.PASSWORD,
                    ACTIVE: form.ACTIVE,
                    // Note: Your register API might need EMP_CODE as well
                    // If needed, add: empCode: form.EMP_CODE
                };
                
                await registerOperator.mutateAsync(payload);
                
                toaster.success({
                    title: "Success",
                    description: "Operator created successfully",
                });
            }
            
            resetForm();
            await refetchOperators();
            
        } catch (error: any) {
            console.error("Save error:", error);
            toaster.error({ 
                title: "Error", 
                description: error.message || "Failed to save operator" 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (operator: Operator) => {
        setEditCode(operator.OPER_CODE);
    };

    const handleDelete = async (operCode: number) => {
        if (window.confirm("Are you sure you want to delete this operator?")) {
            try {
                await deleteOperator.mutateAsync(operCode);
                await refetchOperators();
                toaster.success({
                    title: "Success",
                    description: "Operator deleted successfully",
                });
            } catch (error: any) {
                toaster.error({
                    title: "Error",
                    description: error.message || "Failed to delete operator",
                });
            }
        }
    };

    const handleUpdatePassword = async (operator: Operator) => {
        const oldPassword = prompt("Enter old password:");
        if (!oldPassword) return;
        
        const newPassword = prompt("Enter new password (min 6 characters):");
        if (!newPassword) return;
        
        if (newPassword.length < 6) {
            toaster.error({ title: "Error", description: "Password must be at least 6 characters" });
            return;
        }
        
        try {
            await updatePassword.mutateAsync({
                operCode: operator.OPER_CODE,
                oldPassword,
                newPassword,
            });
            toaster.success({
                title: "Success",
                description: "Password updated successfully",
            });
        } catch (error: any) {
            toaster.error({
                title: "Error",
                description: error.message || "Failed to update password",
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
            second: "2-digit",
        });
    };

    /* -------------------- TABLE COLUMNS -------------------- */
    const operatorColumns = [
        { key: "SNO", label: "S.No" },
        { key: "OPER_NAME", label: "Operator Name" },
        { key: "EMP_CODE", label: "Employee Code" },
        { key: "employeeName", label: "Employee Name" },
        { key: "ACTIVE", label: "Status" },
        { key: "CREATED_DATE", label: "Created Date" },
        { key: "CREATED_TIME", label: "Created Time" },
        { key: "actions", label: "Actions" },
    ];

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(enrichedOperators);
        setColumns([
            { key: "OPER_NAME", label: "Operator Name" },
            { key: "EMP_CODE", label: "Employee Code" },
            { key: "employeeName", label: "Employee Name" },
            { key: "ACTIVE", label: "Status" },
            { key: "CREATED_DATE", label: "Created Date" },
            { key: "CREATED_TIME", label: "Created Time" },
        ]);
        setShowSno(true);
      title?.("Employee Master");
        router.push(`/print?export=${option}`);
    };

    /* ------------------ PASSWORD TOGGLE ------------------ */
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    /* -------------------- LOADING STATE -------------------- */
    if (isLoading || isLoadingEmployees) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minH="100vh"
                bg={theme.colors.primary}
            >
                <Spinner size="xl" color={theme.colors.primaryText} />
            </Box>
        );
    }

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
                            OPERATOR MASTER {editCode ? "(Edit Mode)" : ""}
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
                                            field="OPER_NAME"
                                            value={form.OPER_NAME}
                                            onChange={handleChange}
                                            size="2xs"
                                            placeholder="Enter operator name"
                                            
                                        />
                                    </Box>

                                    {/* EMPLOYEE SELECTION */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="120px" fontSize="2xs">
                                            EMPLOYEE :
                                        </Box>
                                        <Box flex={1}>
                                            <SelectCombobox
                                                items={employeeOptions}
                                                value={form.EMP_CODE}
                                                onChange={handleEmployeeSelect}
                                                placeholder="Select Employee"
                                            />
                                        </Box>
                                    </Box>

                                    {/* EMPLOYEE CODE DISPLAY (Read-only) */}
                                    {form.EMP_CODE && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="2xs">
                                                EMP CODE :
                                            </Box>
                                            <Box fontSize="2xs" fontWeight="bold" color="blue.600">
                                                {form.EMP_CODE}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* PASSWORD - Only show for new operators */}
                                    {!editCode && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box minW="120px" fontSize="2xs">
                                                PASSWORD :
                                            </Box>
                                            <Flex flex={1} align="center" gap={1}>
                                                <CapitalizedInput
                                                    field="PASSWORD"
                                                    value={form.PASSWORD}
                                                    onChange={handleChange}
                                                    type={showPassword ? "text" : "password"}
                                                    size="2xs"
                                                    placeholder="Enter password (min 6 chars)"
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
                                    )}

                                    {/* ACTIVE STATUS */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="120px" fontSize="2xs">
                                            STATUS :
                                        </Box>
                                        <Box flex={1}>
                                            <NativeSelectWrapper
                                                value={form.ACTIVE}
                                                onChange={(val) => handleChange("ACTIVE", val )}
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
                                loading={isSubmitting || registerOperator.isPending}
                                onClick={handleSave}
                                flex={1}
                            >
                                <AiOutlineSave /> {editCode ? "Update" : "Save"}
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
                                OPERATOR LIST ({filteredOperators.length})
                            </Text>

                            <Flex gap={2} align="center">
                                {/* Search Input */}
                                <CapitalizedInput
                                    field="search"
                                    value={searchTerm}
                                    onChange={(_, val) => setSearchTerm(val as string)}
                                    placeholder="Search..."
                                    size="2xs"
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
                                    <Table.Cell>{operator.OPER_NAME}</Table.Cell>
                                    <Table.Cell>{operator.EMP_CODE}</Table.Cell>
                                    <Table.Cell>{operator.employeeName || '-'}</Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            colorScheme={operator.ACTIVE === "Y" ? "green" : "red"}
                                            fontSize="xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {operator.ACTIVE === "Y" ? "Active" : "Inactive"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>{formatDate(operator.CREATED_DATE)}</Table.Cell>
                                    <Table.Cell>{formatTime(operator.CREATED_TIME)}</Table.Cell>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" gap={2}>
                                            {/* <FaEdit
                                                onClick={() => handleEdit(operator)}
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                                title="Edit"
                                            /> */}
                                            <FaTrash
                                                onClick={() => handleDelete(operator.OPER_CODE)}
                                                cursor="pointer"
                                                color="red.500"
                                                size={14}
                                                title="Delete"
                                            />
                                            <IconButton
                                                aria-label="Update Password"
                                                size="2xs"
                                                variant="ghost"
                                                onClick={() => handleUpdatePassword(operator)}
                                                title="Update Password"
                                               
                                            > {<FaEye size={12} />}</IconButton>
                                        </Box>
                                    </Table.Cell>
                                </>
                            )}
                            headerBg="blue.800"
                            headerColor="white"
                            borderColor="white"
                            bodyBg={theme.colors.primary}
                            highlightRowId={highlightedCode?.toString()}
                            rowIdKey="OPER_CODE"
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
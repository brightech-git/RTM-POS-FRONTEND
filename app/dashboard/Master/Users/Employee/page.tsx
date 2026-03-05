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
    For,
    Flex,
    Spinner,
    Input,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import {
    useAllEmployees,
    useCreateEmployee,
    useUpdateEmployee,
} from "@/hooks/Employee/useEmployee";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { Employee } from "@/service/EmployeeService";
import { toastError, toastLoaded } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/components/ui/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { SelectCombobox } from "@/components/ui/selectComboBox";
import axios from "axios";

// API response interface for state
interface StateResponse {
    ACTIVE: string;
    CREATEDBY: number;
    CREATEDDATE: string;
    CREATEDTIME: string;
    SNO: number;
    STATECODE: string;
    STATENAME: string;
}

// Interface for employee form
interface EmployeeFormData {
    EMPNAME: string;
    EMPSURNAME: string;
    EMPFATHERNAME: string;
    SALUTATION: string;
    DOORNO: string;
    STREET: string;
    ADDRESS: string;
    AREA: string;
    CITY: string;
    STATE: string;
    PINCODE: string;
    PHONENO: string;
    MOBILENO: string;
    ACTIVE: string;
    CREATEDBY: number;
}

function EmployeeMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: employees, isLoading, refetch: employeeRefetch } = useAllEmployees();
    const createEmployee = useCreateEmployee();
    const updateEmployee = useUpdateEmployee();

    const employeeList = employees ?? [];

    /* -------------------- STATES FROM API -------------------- */
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);

    // Fetch states from API
    useEffect(() => {
        const fetchStates = async () => {
            setIsLoadingStates(true);
            try {
                const response = await axios.get<StateResponse[]>(
                    "https://rtmdepart.brightechsoftware.com/api/v1/state"
                );
                const states = response.data.map((state) => ({
                    label: state.STATENAME,
                    value: state.STATENAME,
                }));
                setStateOptions(states);
            } catch (error) {
                console.error("Error fetching states:", error);
                toastError("Failed to load states");
                // Fallback to hardcoded states if API fails
                setStateOptions([
                    { label: "Tamil Nadu", value: "Tamil Nadu" },
                    { label: "Kerala", value: "Kerala" },
                    { label: "Karnataka", value: "Karnataka" },
                    { label: "Andhra Pradesh", value: "Andhra Pradesh" },
                    { label: "Telangana", value: "Telangana" },
                ]);
            } finally {
                setIsLoadingStates(false);
            }
        };

        fetchStates();
    }, []);

    const activeStatus = [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
    ];

    const salutationOptions = [
        { label: "Mr", value: "Mr" },
        { label: "Ms", value: "Ms" },
        { label: "Mrs", value: "Mrs" },
        { label: "Dr", value: "Dr" },
    ];

    /* -------------------- FORM STATE -------------------- */
    const emptyForm: EmployeeFormData = {
        EMPNAME: "",
        EMPSURNAME: "",
        EMPFATHERNAME: "",
        SALUTATION: "",
        DOORNO: "",
        STREET: "",
        ADDRESS: "",
        AREA: "",
        CITY: "",
        STATE: "",
        PINCODE: "",
        PHONENO: "",
        MOBILENO: "",
        ACTIVE: "Y",
        CREATEDBY: 1,
    };

    const [form, setForm] = useState<EmployeeFormData>(emptyForm);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (editIndex !== null && employeeList[editIndex]) {
            const employeeToEdit = employeeList[editIndex];
            setForm({
                EMPNAME: employeeToEdit.EMPNAME || "",
                EMPSURNAME: employeeToEdit.EMPSURNAME || "",
                EMPFATHERNAME: employeeToEdit.EMPFATHERNAME || "",
                SALUTATION: employeeToEdit.SALUTATION || "",
                DOORNO: employeeToEdit.DOORNO || "",
                STREET: employeeToEdit.STREET || "",
                ADDRESS: employeeToEdit.ADDRESS || "",
                AREA: employeeToEdit.AREA || "",
                CITY: employeeToEdit.CITY || "",
                STATE: employeeToEdit.STATE || "",
                PINCODE: employeeToEdit.PINCODE || "",
                PHONENO: employeeToEdit.PHONENO || "",
                MOBILENO: employeeToEdit.MOBILENO || "",
                ACTIVE: employeeToEdit.ACTIVE || "Y",
                CREATEDBY: 1,
            });
            toastLoaded("Employee");
            ScrollToTop();
        }
    }, [editIndex, employeeList]);

    useEffect(() => {
        if (highlightedIndex === null) return;

        const timer = setTimeout(() => {
            setHighlightedIndex(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightedIndex]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof EmployeeFormData, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditIndex(null);
        setForm(emptyForm);
    };

    const validateForm = () => {
        if (!form.EMPNAME?.trim()) {
            toastError("Employee Name is required");
            return false;
        }
        if (!form.EMPSURNAME?.trim()) {
            toastError("Surname is required");
            return false;
        }
        if (!form.EMPFATHERNAME?.trim()) {
            toastError("Father Name is required");
            return false;
        }
        if (!form.MOBILENO?.trim()) {
            toastError("Mobile Number is required");
            return false;
        }
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(form.MOBILENO)) {
            toastError("Mobile Number must be 10 digits");
            return false;
        }
        if (form.PHONENO && !/^[0-9]{8}$/.test(form.PHONENO)) {
            toastError("Phone Number must be 8 digits");
            return false;
        }
        if (!form.CITY?.trim()) {
            toastError("City/District is required");
            return false;
        }
        if (!form.STATE?.trim()) {
            toastError("State is required");
            return false;
        }
        if (!form.PINCODE?.trim()) {
            toastError("Pincode is required");
            return false;
        }
        const pinRegex = /^[0-9]{6}$/;
        if (!pinRegex.test(form.PINCODE)) {
            toastError("Pincode must be 6 digits");
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const payload: EmployeeFormData = {
            EMPNAME: String(form.EMPNAME).trim(),
            EMPSURNAME: String(form.EMPSURNAME).trim(),
            EMPFATHERNAME: String(form.EMPFATHERNAME).trim(),
            SALUTATION: String(form.SALUTATION || ""),
            DOORNO: String(form.DOORNO || ""),
            STREET: String(form.STREET || ""),
            ADDRESS: String(form.ADDRESS || ""),
            AREA: String(form.AREA || ""),
            CITY: String(form.CITY).trim(),
            STATE: String(form.STATE).trim(),
            PINCODE: String(form.PINCODE).trim(),
            PHONENO: String(form.PHONENO || ""),
            MOBILENO: String(form.MOBILENO).trim(),
            ACTIVE: String(form.ACTIVE || "Y"),
            CREATEDBY: 1,
        };

        if (editIndex !== null) {
            // For update, we need to send the full employee object
            // The API will identify which employee to update based on some identifier
            // You may need to include EMPUID or other identifier here if your API requires it
            const updatePayload = {
                ...payload,
                // If your API requires an ID for update, you'll need to include it here
                // EMPUID: employeeList[editIndex].EMPUID // Uncomment if your API has EMPUID
            };
            updateEmployee.mutate(updatePayload as Employee, {
                onSuccess: () => {
                    employeeRefetch();
                    setHighlightedIndex(editIndex);
                    resetForm();
                },
                onError: (error: any) => {
                    console.error("Update error:", error);
                    toastError("Failed to update employee");
                }
            });
        } else {
            // For create
            createEmployee.mutate(payload as any, {
                onSuccess: () => {
                    employeeRefetch();
                    resetForm();
                },
                onError: (error: any) => {
                    console.error("Create error:", error);
                    toastError("Failed to create employee");
                }
            });
        }
    };

    const handleEdit = (index: number) => {
        setEditIndex(index);
    };

    /* -------------------- TABLE COLUMNS -------------------- */
    const employeeColumns = [
        { key: 'SNO', label: 'S.No' },
        { key: 'EMPNAME', label: 'First Name' },
        { key: 'EMPSURNAME', label: 'Surname' },
        { key: 'EMPFATHERNAME', label: 'Father Name' },
        { key: 'SALUTATION', label: 'Salutation' },
        { key: 'DOORNO', label: 'Door No' },
        { key: 'STREET', label: 'Street' },
        { key: 'ADDRESS', label: 'Address' },
        { key: 'AREA', label: 'Area' },
        { key: 'CITY', label: 'District' },
        { key: 'STATE', label: 'State' },
        { key: 'PINCODE', label: 'Pincode' },
        { key: 'PHONENO', label: 'Phone' },
        { key: 'MOBILENO', label: 'Mobile' },
        { key: 'ACTIVE', label: 'Active' },
    ];

    /* -------------------- EXPORT -------------------- */
    const handleExport = (option: string) => {
        setData(employeeList);
        setColumns([
            { key: "EMPNAME", label: "First Name" },
            { key: "EMPSURNAME", label: "Surname" },
            { key: "EMPFATHERNAME", label: "Father Name" },
            { key: "SALUTATION", label: "Salutation" },
            { key: "DOORNO", label: "Door No" },
            { key: "STREET", label: "Street" },
            { key: "ADDRESS", label: "Address" },
            { key: "AREA", label: "Area" },
            { key: "CITY", label: "District" },
            { key: "STATE", label: "State" },
            { key: "PINCODE", label: "Pincode" },
            { key: "PHONENO", label: "Phone" },
            { key: "MOBILENO", label: "Mobile" },
            { key: "ACTIVE", label: "Active" },
        ]);
        setShowSno(true);
        title?.("Employee Master");
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
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1.5fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            EMPLOYEE CREATION
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={2}>
                                    {/* SALUTATION */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">SALUTATION :</Box>
                                        <NativeSelect.Root size="xs" maxW="100px" fontSize="2xs">
                                            <NativeSelect.Field
                                                value={form.SALUTATION}
                                                onChange={(e) => handleChange("SALUTATION", e.target.value)}
                                                css={{
                                                    backgroundColor: "#eee",
                                                    color: "#111827",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "20px",
                                                    height: "30px",
                                                    fontSize: "10px",
                                                }}
                                            >
                                                <option value="">Select</option>
                                                <For each={salutationOptions}>
                                                    {(item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {item.label}
                                                        </option>
                                                    )}
                                                </For>
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                    </Box>

                                    {/* FIRST NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">FIRST NAME :</Box>
                                        <CapitalizedInput
                                            field="EMPNAME"
                                            value={form.EMPNAME}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* SURNAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">SURNAME :</Box>
                                        <CapitalizedInput
                                            field="EMPSURNAME"
                                            value={form.EMPSURNAME}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* FATHER NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">FATHER NAME :</Box>
                                        <CapitalizedInput
                                            field="EMPFATHERNAME"
                                            value={form.EMPFATHERNAME}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* DOOR NO */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">DOOR NO :</Box>
                                        <CapitalizedInput
                                            field="DOORNO"
                                            value={form.DOORNO}
                                            onChange={handleChange}
                                            size="2xs"
                                            maxWidth="100px"
                                        />
                                    </Box>

                                    {/* STREET */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">STREET :</Box>
                                        <CapitalizedInput
                                            field="STREET"
                                            value={form.STREET}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* ADDRESS */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">ADDRESS :</Box>
                                        <CapitalizedInput
                                            field="ADDRESS"
                                            value={form.ADDRESS}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                            allowSpecial
                                        />
                                    </Box>

                                    {/* AREA */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">AREA :</Box>
                                        <CapitalizedInput
                                            field="AREA"
                                            value={form.AREA}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* DISTRICT */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">DISTRICT :</Box>
                                        <Input
                                            value={form.CITY}
                                            onChange={(e) => handleChange("CITY", e.target.value)}
                                            size="xs"
                                            width="200px"
                                            rounded="full"
                                            bg="#eee"
                                            border="1px solid #e5e7eb"
                                            _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                                            placeholder="Enter district"
                                        />
                                    </Box>

                                    {/* STATE */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">STATE :</Box>
                                        {isLoadingStates ? (
                                            <Spinner size="xs" />
                                        ) : (
                                            <SelectCombobox
                                                items={stateOptions}
                                                value={form.STATE}
                                                onChange={(val) => handleChange("STATE", val)}
                                                placeholder="Select State"
                                            />
                                        )}
                                    </Box>

                                    {/* PINCODE */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">PINCODE :</Box>
                                        <CapitalizedInput
                                            field="PINCODE"
                                            value={form.PINCODE}
                                            onChange={handleChange}
                                            max={999999}
                                            type="number"
                                            size="2xs"
                                            maxWidth="100px"
                                        />
                                    </Box>

                                    {/* PHONE NO */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">PHONE NO :</Box>
                                        <CapitalizedInput
                                            field="PHONENO"
                                            value={form.PHONENO}
                                            onChange={handleChange}
                                            max={99999999}
                                            type="number"
                                            size="2xs"
                                            maxWidth="120px"
                                        />
                                    </Box>

                                    {/* MOBILE NO */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">MOBILE NO :</Box>
                                        <CapitalizedInput
                                            field="MOBILENO"
                                            value={form.MOBILENO}
                                            onChange={handleChange}
                                            max={9999999999}
                                            type="number"
                                            size="2xs"
                                            maxWidth="120px"
                                        />
                                    </Box>

                                    {/* ACTIVE */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">ACTIVE :</Box>
                                        <NativeSelect.Root size="xs" maxW="90px" fontSize="2xs">
                                            <NativeSelect.Field
                                                value={form.ACTIVE || "Y"}
                                                onChange={(e) => handleChange("ACTIVE", e.target.value)}
                                                css={{
                                                    backgroundColor: "#eee",
                                                    color: "#111827",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "20px",
                                                    height: "30px",
                                                    fontSize: "10px",
                                                }}
                                            >
                                                <For each={activeStatus}>
                                                    {(item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {item.label}
                                                        </option>
                                                    )}
                                                </For>
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                    </Box>
                                </Grid>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack>
                            <Button
                                size="xs"
                                colorPalette="blue"
                                loading={createEmployee.isPending || updateEmployee.isPending}
                                onClick={handleSave}
                            >
                                <AiOutlineSave /> {editIndex !== null ? "Update" : "Save"}
                            </Button>
                            <Button size="xs" colorPalette="blue" onClick={resetForm}>
                                <IoIosExit /> Exit
                            </Button>
                        </HStack>
                    </VStack>
                </GridItem>

                {/* ---------------- TABLE ---------------- */}
                <GridItem minW={0} overflowX="auto">
                    <Box bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Box display='flex' mb={2} gap={2} justifyContent='space-between' alignItems='center'>
                            <Text fontWeight="semibold" fontSize="small">
                                EMPLOYEE DETAILS
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
                            columns={employeeColumns}
                            data={employeeList}
                            isLoading={isLoading}
                            renderRow={(employee, index) => (
                                <>
                                    <Table.Cell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <FaEdit
                                                onClick={() => handleEdit(index)}
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
                                                size={14}
                                                title="Edit"
                                            />
                                            <Text>{index + 1}</Text>
                                        </Box>
                                    </Table.Cell>
                                    <Table.Cell>{employee.EMPNAME}</Table.Cell>
                                    <Table.Cell>{employee.EMPSURNAME}</Table.Cell>
                                    <Table.Cell>{employee.EMPFATHERNAME}</Table.Cell>
                                    <Table.Cell>{employee.SALUTATION}</Table.Cell>
                                    <Table.Cell>{employee.DOORNO}</Table.Cell>
                                    <Table.Cell>{employee.STREET}</Table.Cell>
                                    <Table.Cell>{employee.ADDRESS}</Table.Cell>
                                    <Table.Cell>{employee.AREA}</Table.Cell>
                                    <Table.Cell>{employee.CITY}</Table.Cell>
                                    <Table.Cell>{employee.STATE}</Table.Cell>
                                    <Table.Cell>{employee.PINCODE}</Table.Cell>
                                    <Table.Cell>{employee.PHONENO}</Table.Cell>
                                    <Table.Cell>{employee.MOBILENO}</Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            colorPalette={employee.ACTIVE === "Y" ? "green" : "red"}
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {employee.ACTIVE === "Y" ? "Active" : "Inactive"}
                                        </Badge>
                                    </Table.Cell>
                                </>
                            )}
                            headerBg="blue.800"
                            headerColor="white"
                            borderColor="white"
                            bodyBg={theme.colors.primary}
                            highlightRowId={highlightedIndex !== null ? highlightedIndex : null}
                            emptyText="No employees available"
                        />
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

export default EmployeeMaster;
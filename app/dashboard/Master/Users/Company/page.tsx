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
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "@/context/theme/themeContext";
import {
    useAllCompanies,
    useCompanyById,
    useCreateCompany,
    useUpdateCompany,
} from "@/hooks/company/useCompany";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { Company } from "@/service/CompanyService";
import { toastError, toastLoaded } from "@/component/toast/toast";
import { CustomTable } from "@/component/table/CustomTable";
import { CapitalizedInput } from "@/components/ui/CapitalizedInput";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

function CompanyMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();
    
    /* -------------------- API HOOKS -------------------- */
    const { data, isLoading, refetch: companyRefetch } = useAllCompanies();
    
    const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
    const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();

    const [editId, setEditId] = useState<string | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    
    // Get USERID from localStorage
    const [userId, setUserId] = useState<string>("");
    
    useEffect(() => {
        // Get user from localStorage on component mount
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUserId(parsedUser.USERID || parsedUser.userId || parsedUser.id || "admin");
                } catch {
                    setUserId("admin");
                }
            } else {
                setUserId("admin");
            }
        }
    }, []);
    
    /* -------------------- FORM STATE - Only Payload Fields -------------------- */
    const [form, setForm] = useState<Partial<Company>>({
        COMPANYCODE: "",
        COMPANYNAME: "",
        COMPANYSHORTNAME: "",
        ADDRESS1: "",
        ADDRESS2: "",
        AREA: "",
        CITY: "",
        PINCODE: "",
        MOBILENO: "",
        GSTTINNO: "",
        PASSWORD: "",
        SERVERNAME: "",
        PORTNO: "",
        USERID: String(userId),
    });

    // Update USERID in form when userId changes
    useEffect(() => {
        setForm(prev => ({
            ...prev,
            USERID: userId
        }));
    }, [userId]);

    /* -------------------- GET COMPANY BY ID - FIXED -------------------- */
    // Only call the hook when editId exists
    const { data: companyData, refetch: fetchCompanyById } = useCompanyById(editId || '', {
        enabled: !!editId,
    });
    
    const company = companyData?.data;

    // Use useEffect to load company data when company changes
    useEffect(() => {
        if (company) {
            console.log("Loading company data for edit:", company);
            
            setForm({
                COMPANYCODE: company.COMPANYCODE || "",
                COMPANYNAME: company.COMPANYNAME || "",
                COMPANYSHORTNAME: company.COMPANYSHORTNAME || "",
                ADDRESS1: company.ADDRESS1 || "",
                ADDRESS2: company.ADDRESS2 || "",
                AREA: company.AREA || "",
                CITY: company.CITY || "",
                PINCODE: company.PINCODE || company.PINCODE || "",
                MOBILENO: company.MOBILENO || company.MOBILENO || "",
                GSTTINNO: company.GSTTINNO || company.GSTTINNO || "",
                PASSWORD: "",
                SERVERNAME: company.SERVERNAME || "",
                PORTNO: company.PORTNO || "",
                USERID: String(userId)
            });
            
            // Show toast after company data is loaded
            setTimeout(() => {
                toastLoaded("Company");
                ScrollToTop();
            }, 0);
        }
    }, [company, userId]);

    // Alternative: If the above doesn't work, use this approach to manually fetch
    const handleEditClick = (company: Company) => {
        setEditId(company.COMPANYCODE);
        
        // Manually set form data from the company object in the list
        // This ensures data loads immediately without waiting for API
        setForm({
            COMPANYCODE: company.COMPANYCODE || "",
            COMPANYNAME: company.COMPANYNAME || "",
            COMPANYSHORTNAME: company.COMPANYSHORTNAME || "",
            ADDRESS1: company.ADDRESS1 || "",
            ADDRESS2: company.ADDRESS2 || "",
            AREA: company.AREA || "",
            CITY: company.CITY || "",
            PINCODE: company.PINCODE || "",
            MOBILENO: company.MOBILENO || "",
            GSTTINNO: company.GSTTINNO || "",
            PASSWORD: "",
            SERVERNAME: company.SERVERNAME || "",
            PORTNO: company.PORTNO || "",
            USERID: String(userId)
        });
        
        // Optional: Still fetch from API to get latest data
        if (company.COMPANYCODE) {
            fetchCompanyById();
        }
    };

    useEffect(() => {
        if (highlightedId) {
            const timer = setTimeout(() => {
                setHighlightedId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: keyof Company, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm({
            COMPANYCODE: "",
            COMPANYNAME: "",
            COMPANYSHORTNAME: "",
            ADDRESS1: "",
            ADDRESS2: "",
            AREA: "",
            CITY: "",
            PINCODE: "",
            MOBILENO: "",
            GSTTINNO: "",
            PASSWORD: "",
            SERVERNAME: "",
            PORTNO: "",
            USERID: String(userId)
        });
    };

    const validateForm = () => {
        if (!form.COMPANYCODE) {
            toastError("Company ID is required");
            return false;
        }
        if (form.COMPANYCODE.length > 4) {
            toastError("Company ID must be at most 4 characters");
            return false;
        }
        if (!form.COMPANYNAME?.trim()) {
            toastError("Company Name is required");
            return false;
        }
        
        // Optional validations
        if (form.PINCODE) {
            const pinRegex = /^[0-9]{6}$/;
            if (!pinRegex.test(form.PINCODE)) {
                toastError("Pincode must be exactly 6 digits");
                return false;
            }
        }
        
        if (form.MOBILENO) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(form.MOBILENO)) {
                toastError("Mobile Number must be exactly 10 digits");
                return false;
            }
        }
        
        return true;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const payload = {
            COMPANYCODE: form.COMPANYCODE,
            COMPANYNAME: form.COMPANYNAME,
            COMPANYSHORTNAME: form.COMPANYSHORTNAME || "",
            ADDRESS1: form.ADDRESS1 || "",
            ADDRESS2: form.ADDRESS2 || "",
            AREA: form.AREA || "",
            CITY: form.CITY || "",
            PINCODE: form.PINCODE || "",
            MOBILENO: form.MOBILENO || "",
            GSTTINNO: form.GSTTINNO || "",
            PASSWORD: "",
            SERVERNAME: "DEFAULT SERVER",
            PORTNO: "3000",
            USERID: String(userId) || "admin",
        };

        console.log("Final Payload", payload);

        if (editId) {
            updateCompany(
                { id: editId, ...payload },
                {
                    onSuccess: () => {
                        companyRefetch();
                        resetForm();
                        setHighlightedId(editId);
                    },
                }
            );
        } else {
            createCompany(payload, {
                onSuccess: () => {
                    companyRefetch();
                    resetForm();
                },
            });
        }
    };

    /* -------------------- TABLE COLUMNS -------------------- */
    const CompanyColumn = [
        { key: 'sno', label: 'S.No' },
        { key: 'COMPANYCODE', label: 'Company Id' },
        { key: 'COMPANYNAME', label: 'Company Name' },
        { key: 'COMPANYSHORTNAME', label: 'Short Name' },
        { key: 'actions', label: 'Actions' },
    ];

    // Map companies for display
    const companies = (data || []).map((c: any) => ({
        COMPANYCODE: c.COMPANYCODE,
        COMPANYNAME: c.COMPANYNAME,
        COMPANYSHORTNAME: c.COMPANYSHORTNAME || "",
        ADDRESS1: c.ADDRESS1 || "",
        ADDRESS2: c.ADDRESS2 || "",
        AREA: c.AREA || "",
        CITY: c.CITY || "",
        PINCODE: c.PINCODE || "",
        MOBILENO: c.MOBILENO || "",
        GSTTINNO: c.GSTTINNO || "",
        PASSWORD: "",
        SERVERNAME: c.SERVERNAME || "",
        PORTNO: c.PORTNO || "",
        USERID: c.USERID || "",
    }));

    /* -------------------- EXPORT HANDLER -------------------- */
    const handleExport = (option: string) => {
        setData(companies);
        setColumns([
            { key: "COMPANYCODE", label: "Company Code" },
            { key: "COMPANYNAME", label: "Company Name" },
            { key: "COMPANYSHORTNAME", label: "Short Name" },
            { key: "ADDRESS1", label: "Address 1" },
            { key: "ADDRESS2", label: "Address 2" },
            { key: "AREA", label: "Area" },
            { key: "CITY", label: "City" },
            { key: "PINCODE", label: "Pincode" },
            { key: "MOBILENO", label: "Mobile No" },
            { key: "GSTTINNO", label: "GSTIN" },
        ]);
        setShowSno(true);
        title?.("Company Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary}>
            <Toaster />
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1.5fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            COMPANY CREATION
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <Grid gap={2}>
                                    {/* COMPANY ID */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">COMPANY ID :</Box>
                                        <CapitalizedInput
                                            field="COMPANYCODE"
                                            value={form.COMPANYCODE || ""}
                                            disabled={!!editId}
                                            onChange={handleChange}
                                            size="2xs"
                                            maxWidth="90px"
                                            rounded="full"
                                        />
                                    </Box>

                                    {/* COMPANY NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW='100px' fontSize="2xs">COMPANY NAME :</Box>
                                        <CapitalizedInput
                                            field="COMPANYNAME"
                                            value={form.COMPANYNAME || ""}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* COMPANY SHORT NAME */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW='100px' fontSize="2xs">SHORT NAME :</Box>
                                        <CapitalizedInput
                                            field="COMPANYSHORTNAME"
                                            value={form.COMPANYSHORTNAME || ""}
                                            onChange={handleChange}
                                            isCapitalized
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* ADDRESS1 */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW='100px' fontSize="2xs">ADDRESS 1 :</Box>
                                        <CapitalizedInput
                                            field="ADDRESS1"
                                            value={form.ADDRESS1 || ""}
                                            onChange={handleChange}
                                            size="2xs"
                                            allowSpecial
                                        />
                                    </Box>

                                    {/* ADDRESS2 */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">ADDRESS 2 :</Box>
                                        <CapitalizedInput
                                            field="ADDRESS2"
                                            value={form.ADDRESS2 || ""}
                                            onChange={handleChange}
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* AREA */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">AREA :</Box>
                                        <CapitalizedInput
                                            field="AREA"
                                            value={form.AREA || ""}
                                            onChange={handleChange}
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* CITY */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">CITY :</Box>
                                        <CapitalizedInput
                                            field="CITY"
                                            value={form.CITY || ""}
                                            onChange={handleChange}
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* PINCODE */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">PINCODE :</Box>
                                        <CapitalizedInput
                                            field="PINCODE"
                                            value={form.PINCODE || ""}
                                            onChange={handleChange}
                                            type="number"
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* MOBILE NO */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">MOBILE NO :</Box>
                                        <CapitalizedInput
                                            field="MOBILENO"
                                            value={form.MOBILENO || ""}
                                            onChange={handleChange}
                                            type="number"
                                            size="2xs"
                                        />
                                    </Box>

                                    {/* GST TIN NO */}
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box minW="100px" fontSize="2xs">GST TIN NO :</Box>
                                        <CapitalizedInput
                                            field="GSTTINNO"
                                            value={form.GSTTINNO || ""}
                                            onChange={handleChange}
                                            size="2xs"
                                            type="text"
                                        />
                                    </Box>
                                    
                                    {/* Hidden fields for PASSWORD, SERVERNAME, PORTNO, USERID */}
                                    <input type="hidden" name="PASSWORD" value="" />
                                    <input type="hidden" name="SERVERNAME" value="" />
                                    <input type="hidden" name="PORTNO" value="" />
                                    <input type="hidden" name="USERID" value={userId} />
                                </Grid>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack>
                            <Button
                                size="xs"
                                colorPalette="blue"
                                loading={isCreating || isUpdating}
                                onClick={handleSave}
                            >
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
                        <Box display='flex' mb={2} gap={2} justifyContent='space-between' alignItems='center'>
                            <Text fontWeight="semibold" fontSize="small">
                                COMPANY DETAILS
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
                            columns={CompanyColumn}
                            data={companies}
                            renderRow={(company: Company, index: number) => (
                                <>
                                    <Table.Cell>{index + 1}</Table.Cell>
                                    <Table.Cell>{company.COMPANYCODE}</Table.Cell>
                                    <Table.Cell>{company.COMPANYNAME}</Table.Cell>
                                    <Table.Cell>{company.COMPANYSHORTNAME}</Table.Cell>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center">
                                            <FaEdit 
                                                onClick={() => handleEditClick(company)} 
                                                cursor="pointer"
                                                color={theme.colors.primaryText}
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
                            rowIdKey="COMPANYCODE"
                            emptyText="No companies available"
                            isLoading={isLoading}
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

export default CompanyMaster;
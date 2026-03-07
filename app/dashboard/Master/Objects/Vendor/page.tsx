"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Grid,
    GridItem,
    VStack,
    HStack,
    Text,
    Fieldset,
    SimpleGrid,
    Badge,
    Spinner,
    Center
} from "@chakra-ui/react";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaPrint, FaFileExcel, FaTrash, FaEye } from "react-icons/fa";
import { Table } from "@chakra-ui/react/table";
import { useTheme } from "@/context/theme/themeContext";
import { Toaster } from "@/components/ui/toaster";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

import { CustomTable } from "@/component/table/CustomTable";
import {
    useAllVendors,
    useVendorById,
    useCreateVendor,
    useUpdateVendor,
    useDeleteVendor
} from "@/hooks/Vendor/useVendor";
import { Vendor, VendorForm } from "@/types/vendor/vendor";

import { toastCreated, toastError, toastLoaded, toastUpdated, toastDeleted } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { VendorConfig } from "@/config/Master/Object/Vendor";
import { DynamicForm } from "@/component/form/DynamicForm";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { VendorDetailsDialog } from "@/components/ui/VendorDetailsDialog";

function VendorMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
    const { data: vendorsData, refetch: refetchVendors, isLoading: isLoadingVendors } = useAllVendors();
    const vendors = vendorsData ?? [];

    const [editId, setEditId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    // Only fetch vendor by ID when editId is valid
    const { data: vendorById, isLoading: isLoadingVendor } = useVendorById(editId || 0);
    const vendor = vendorById ?? null;

    const { mutate: createVendor, isPending: isCreating } = useCreateVendor();
    const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();
    const { mutate: deleteVendor, isPending: isDeleting } = useDeleteVendor();

    const isSaving = isCreating || isUpdating;

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<VendorForm>({
        VENDORNAME: "",
        MIDDLENAME: "",
        LASTNAME: "",
        PANNO: "",
        TINNO: "",
        CSTNO: "",
        GSTNUMBER: "",
        HSNSTATECODE: "",
        ADDRESS1: "",
        ADDRESS2: "",
        ADDRESS3: "",
        AREA: "",
        CITY: "",
        DISTRICT: "",
        STATE: "",
        COUNTRY: "",
        PINCODE: "",
        PHONENO: "",
        MOBILENO: "",
        EMAILID: "",
        PHONENO2: "",
        MOBILENO2: "",
        EMAILID2: "",
        CONTACTPERSON: "",
        REMARKS: "",
        ACTIVE: "Y",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

    // Load vendor data when editing
    useEffect(() => {
        if (!vendor || editId === null) return;

        setForm({
            VENDORNAME: vendor.VENDORNAME || "",
            MIDDLENAME: vendor.MIDDLENAME || "",
            LASTNAME: vendor.LASTNAME || "",
            PANNO: vendor.PANNO || "",
            TINNO: vendor.TINNO || "",
            CSTNO: vendor.CSTNO || "",
            GSTNUMBER: vendor.GSTNUMBER || "",
            HSNSTATECODE: vendor.HSNSTATECODE || "",
            ADDRESS1: vendor.ADDRESS1 || "",
            ADDRESS2: vendor.ADDRESS2 || "",
            ADDRESS3: vendor.ADDRESS3 || "",
            AREA: vendor.AREA || "",
            CITY: vendor.CITY || "",
            DISTRICT: vendor.DISTRICT || "",
            STATE: vendor.STATE || "",
            COUNTRY: vendor.COUNTRY || "",
            PINCODE: vendor.PINCODE || "",
            PHONENO: vendor.PHONENO || "",
            MOBILENO: vendor.MOBILENO || "",
            EMAILID: vendor.EMAILID || "",
            PHONENO2: vendor.PHONENO2 || "",
            MOBILENO2: vendor.MOBILENO2 || "",
            EMAILID2: vendor.EMAILID2 || "",
            CONTACTPERSON: vendor.CONTACTPERSON || "",
            REMARKS: vendor.REMARKS || "",
            ACTIVE: vendor.ACTIVE || "Y",
        });

        setTouchedFields(new Set());
        toastLoaded("Vendor");
        ScrollToTop();
    }, [vendor, editId]);

    // Highlight timeout
    useEffect(() => {
        if (!highlightedId) return;
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- VALIDATION -------------------- */
    const validateForm = (): Record<string, string> => {
        const errors: Record<string, string> = {};

        // Required fields validation
        if (!form.VENDORNAME?.trim()) errors.VENDORNAME = "Vendor Name is required";
        if (!form.ADDRESS1?.trim()) errors.ADDRESS1 = "Address 1 is required";
        if (!form.AREA?.trim()) errors.AREA = "Area is required";
        if (!form.CITY?.trim()) errors.CITY = "City is required";
        if (!form.DISTRICT?.trim()) errors.DISTRICT = "District is required";
        if (!form.STATE?.trim()) errors.STATE = "State is required";
        if (!form.COUNTRY?.trim()) errors.COUNTRY = "Country is required";
        if (!form.PINCODE?.trim()) errors.PINCODE = "Pincode is required";
        if (!form.MOBILENO?.trim()) errors.MOBILENO = "Mobile No is required";
        if (!form.CONTACTPERSON?.trim()) errors.CONTACTPERSON = "Contact Person is required";
        if (!form.ACTIVE) errors.ACTIVE = "Active selection is required";

        // Format validations
        if (form.MOBILENO?.trim() && !/^\d{10}$/.test(form.MOBILENO.trim())) {
            errors.MOBILENO = "Mobile No must be 10 digits";
        }

        if (form.PHONENO?.trim() && !/^\d+$/.test(form.PHONENO.trim())) {
            errors.PHONENO = "Phone No must contain only numbers";
        }

        if (form.EMAILID?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.EMAILID.trim())) {
            errors.EMAILID = "Please enter a valid email address";
        }

        if (form.PINCODE?.trim() && !/^\d{6}$/.test(form.PINCODE.trim())) {
            errors.PINCODE = "Pincode must be 6 digits";
        }

        if (form.PANNO?.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.PANNO.trim())) {
            errors.PANNO = "PAN must be in format: ABCDE1234F";
        }

        if (form.GSTNUMBER?.trim()) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
            if (!gstRegex.test(form.GSTNUMBER.trim())) {
                errors.GSTNUMBER = "Please enter a valid GST number";
            }
        }

        return errors;
    };

    const validateField = (field: string, value: any): string => {
        const fieldErrors: Record<string, string> = {};

        switch (field) {
            case "VENDORNAME":
                if (!value?.trim()) return "Vendor Name is required";
                break;
            case "ADDRESS1":
                if (!value?.trim()) return "Address 1 is required";
                break;
            case "AREA":
                if (!value?.trim()) return "Area is required";
                break;
            case "CITY":
                if (!value?.trim()) return "City is required";
                break;
            case "DISTRICT":
                if (!value?.trim()) return "District is required";
                break;
            case "STATE":
                if (!value?.trim()) return "State is required";
                break;
            case "COUNTRY":
                if (!value?.trim()) return "Country is required";
                break;
            case "PINCODE":
                if (!value?.trim()) return "Pincode is required";
                if (value?.trim() && !/^\d{6}$/.test(value.trim())) return "Pincode must be 6 digits";
                break;
            case "MOBILENO":
                if (!value?.trim()) return "Mobile No is required";
                if (value?.trim() && !/^\d{10}$/.test(value.trim())) return "Mobile No must be 10 digits";
                break;
            case "CONTACTPERSON":
                if (!value?.trim()) return "Contact Person is required";
                break;
            case "EMAILID":
                if (value?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Please enter a valid email address";
                break;
            case "PANNO":
                if (value?.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.trim())) return "PAN must be in format: ABCDE1234F";
                break;
            case "GSTNUMBER":
                if (value?.trim()) {
                    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
                    if (!gstRegex.test(value.trim())) return "Please enter a valid GST number";
                }
                break;
            case "PHONENO":
                if (value?.trim() && !/^\d+$/.test(value.trim())) return "Phone No must contain only numbers";
                break;
        }
        return "";
    };

    /* -------------------- HANDLERS -------------------- */
const handleChange = (field: string | number, value: any) => {
    setForm(prev => ({
        ...prev,
        [field]: value
    }));

    const fieldKey = String(field); // convert to string for Sets and objects

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(fieldKey));

    // Validate field on change if it's been touched
    if (touchedFields.has(fieldKey)) {
        const error = validateField(fieldKey, value);
        setFormErrors(prev => ({
            ...prev,
            [fieldKey]: error
        }));
    }
};

    const handleBlur = (field: string) => {
        setTouchedFields(prev => new Set(prev).add(field));
        const error = validateField(field, form[field as keyof VendorForm]);
        setFormErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm({
            VENDORNAME: "",
            MIDDLENAME: "",
            LASTNAME: "",
            PANNO: "",
            TINNO: "",
            CSTNO: "",
            GSTNUMBER: "",
            HSNSTATECODE: "",
            ADDRESS1: "",
            ADDRESS2: "",
            ADDRESS3: "",
            AREA: "",
            CITY: "",
            DISTRICT: "",
            STATE: "",
            COUNTRY: "",
            PINCODE: "",
            PHONENO: "",
            MOBILENO: "",
            EMAILID: "",
            PHONENO2: "",
            MOBILENO2: "",
            EMAILID2: "",
            CONTACTPERSON: "",
            REMARKS: "",
            ACTIVE: "Y",
        });
        setFormErrors({});
        setTouchedFields(new Set());
    };

    const handleEdit = (vendor: Vendor) => {
        if (!vendor.VENDORCODE) return;

        setEditId(vendor.VENDORCODE);
        // Form will be populated by the useEffect when vendor data loads
    };

    const handleViewDetails = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsDetailsDialogOpen(true);
    };

    const handleSave = () => {
        console.log("Saving vendor with data:", form);
        // Validate all fields
        const errors = validateForm();
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            // Show first error in toast
            const firstError = Object.values(errors)[0];
            toastError(`Validation failed: ${firstError}`);

            // Mark all fields as touched to show errors
            const allFields = new Set(Object.keys(form));
            setTouchedFields(allFields);

            ScrollToTop();
            return;
        }

        // Prepare payload
        const payload: Vendor = {
            VENDORNAME: form.VENDORNAME.trim(),
            MIDDLENAME: form.MIDDLENAME?.trim() || undefined,
            LASTNAME: form.LASTNAME?.trim() || undefined,
            PANNO: form.PANNO?.trim() || undefined,
            TINNO: form.TINNO?.trim() || undefined,
            CSTNO: form.CSTNO?.trim() || undefined,
            GSTNUMBER: form.GSTNUMBER?.trim() || undefined,
            HSNSTATECODE: form.HSNSTATECODE?.trim() || undefined,
            ADDRESS1: form.ADDRESS1.trim(),
            ADDRESS2: form.ADDRESS2?.trim() || undefined,
            ADDRESS3: form.ADDRESS3?.trim() || undefined,
            AREA: form.AREA.trim(),
            CITY: form.CITY.trim(),
            DISTRICT: form.DISTRICT.trim(),
            STATE: form.STATE.trim(),
            COUNTRY: form.COUNTRY.trim(),
            PINCODE: form.PINCODE.trim(),
            PHONENO: form.PHONENO?.trim() || undefined,
            MOBILENO: form.MOBILENO.trim(),
            EMAILID: form.EMAILID?.trim() || undefined,
            PHONENO2: form.PHONENO2?.trim() || undefined,
            MOBILENO2: form.MOBILENO2?.trim() || undefined,
            EMAILID2: form.EMAILID2?.trim() || undefined,
            CONTACTPERSON: form.CONTACTPERSON.trim(),
            REMARKS: form.REMARKS?.trim() || undefined,
            ACTIVE: form.ACTIVE,
        };

        if (editId) {
            // Update existing vendor
            updateVendor({
                ...payload,
                VENDORCODE: editId
            }, {
                onSuccess: () => {
                    refetchVendors();
                    resetForm();
                    setHighlightedId(editId);
                    toastUpdated("Vendor");
                },
                onError: (error: any) => {
                    console.error('Update error:', error);
                    const errorMessage = error?.response?.data?.message || error?.message || "Failed to update vendor";
                    toastError(errorMessage);
                },
            });
        } else {
            // Create new vendor
            createVendor({
                vendor: payload,
                createdBy: 1
            }, {
                onSuccess: (data) => {
                    refetchVendors();
                    resetForm();
                    if (data?.VENDORCODE) {
                        setHighlightedId(data.VENDORCODE);
                    }
                    toastCreated("Vendor");
                },
                onError: (error: any) => {
                    console.error('Create error:', error);
                    const errorMessage = error?.response?.data?.message || error?.message || "Failed to create vendor";
                    toastError(errorMessage);
                },
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteId) {
            deleteVendor(deleteId, {
                onSuccess: () => {
                    refetchVendors();
                    toastDeleted("Vendor");
                    setIsDeleteDialogOpen(false);
                    setDeleteId(null);
                },
                onError: (error: any) => {
                    console.error('Delete error:', error);
                    toastError("Failed to delete vendor");
                },
            });
        }
    };

    const handleExport = (option: string) => {
        const exportData = vendors.map((item: Vendor) => ({
            VENDORCODE: item.VENDORCODE,
            VENDORNAME: `${item.VENDORNAME} ${item.MIDDLENAME || ''} ${item.LASTNAME || ''}`.trim(),
            CONTACTPERSON: item.CONTACTPERSON,
            MOBILENO: item.MOBILENO,
            EMAILID: item.EMAILID || '-',
            PHONENO: item.PHONENO || '-',
            ADDRESS: `${item.ADDRESS1} ${item.ADDRESS2 || ''} ${item.ADDRESS3 || ''}`.trim(),
            AREA: item.AREA,
            CITY: item.CITY,
            DISTRICT: item.DISTRICT,
            STATE: item.STATE,
            COUNTRY: item.COUNTRY,
            PINCODE: item.PINCODE,
            GSTNUMBER: item.GSTNUMBER || '-',
            PANNO: item.PANNO || '-',
            TINNO: item.TINNO || '-',
            CSTNO: item.CSTNO || '-',
            HSNSTATECODE: item.HSNSTATECODE || '-',
            ACTIVE: item.ACTIVE,
        }));

        setData(exportData);
        setColumns([
            { key: "VENDORCODE", label: "Code" },
            { key: "VENDORNAME", label: "Vendor Name" },
            { key: "CONTACTPERSON", label: "Contact Person" },
            { key: "MOBILENO", label: "Mobile No" },
            { key: "EMAILID", label: "Email" },
            { key: "CITY", label: "City" },
            { key: "STATE", label: "State" },
            { key: "GSTNUMBER", label: "GST No" },
            { key: "ACTIVE", label: "Status" },
        ]);
        setShowSno(true);
        title?.("Vendor Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- FORM CONFIG -------------------- */
    const vendorFormFields = VendorConfig;
    const fieldSequence = vendorFormFields.map(f => f.name);

    const { register, focusNext } = useEnterNavigation(fieldSequence, () => {
        handleSave();
    });

    // Split fields into two columns
    const firstColumnFields = vendorFormFields.slice(0, 13);
    const secondColumnFields = vendorFormFields.slice(13, 26);

    const VendorColumns = [
        { key: "SNO", label: "S.No" },
        { key: "VENDORCODE", label: "Code" },
        { key: "VENDORNAME", label: "Vendor Name" },
        { key: "CONTACTPERSON", label: "Contact Person" },
        { key: "MOBILENO", label: "Mobile No" },
        { key: "EMAILID", label: "Email" },
        { key: "CITY", label: "City" },
        { key: "STATE", label: "State" },
        { key: "GSTNUMBER", label: "GST No" },
        { key: "ACTIVE", label: "Status" },
        { key: "ACTIONS", label: "Actions" },
    ];

    /* -------------------- UI -------------------- */
    if (isLoadingVendors) {
        return (
            <Center h="200px">
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary} p={4}>
            <Toaster />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Vendor"
                message="Are you sure you want to delete this vendor? This action cannot be undone."

            />

            <VendorDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => setIsDetailsDialogOpen(false)}
                vendor={selectedVendor}
            />

            <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={4}>
                {/* FORM SECTION */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef" >
                        <Text fontSize="lg" fontWeight="600">
                            VENDOR {editId ? 'EDIT' : 'CREATION'}
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <SimpleGrid columns={{ base: 1, md: 2 }}  width="100%">
                                    <VStack align="stretch">
                                        <DynamicForm
                                            fields={firstColumnFields}
                                            formData={form}
                                            onChange={handleChange}
                                            register={register}
                                            focusNext={focusNext}
                                            errors={formErrors}
                                        />
                                    </VStack>

                                    <VStack align="stretch">
                                        <DynamicForm
                                            fields={secondColumnFields}
                                            formData={form}
                                            onChange={handleChange}
                                            register={register}
                                            focusNext={focusNext}
                                            errors={formErrors}
                                        />
                                    </VStack>
                                </SimpleGrid>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack >
                            <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={handleSave}
                                loading={isSaving}
                                loadingText={editId ? "Updating..." : "Saving..."}
                            >
                                <AiOutlineSave style={{ marginRight: "6px" }} />
                                {editId ? "Update" : "Save"}
                            </Button>
                            <Button
                                size="sm"
                                colorScheme="gray"
                                onClick={resetForm}
                            >
                                <HStack gap={1}>
                                    <IoIosExit />
                                    <Text>Exit</Text>
                                </HStack>
                            </Button>
                        </HStack>
                    </VStack>
                </GridItem>

                {/* TABLE SECTION */}
                <GridItem>
                    <Box bg={theme.colors.formColor} p={4} borderRadius="xl" border="1px solid #eef">
                        <Box display="flex" mb={4} justifyContent="space-between" alignItems="center">
                            <Text fontWeight="semibold" fontSize="lg">
                                VENDOR DETAILS
                            </Text>
                            <HStack >
                                <Button variant="ghost" size="sm" onClick={() => handleExport("excel")}>
                                    <FaFileExcel />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")}>
                                    <FaPrint />
                                </Button>
                            </HStack>
                        </Box>

                        <CustomTable
                            columns={VendorColumns}
                            data={vendors}
                            headerBg={theme.colors.accient}
                            headerColor="white"
                            renderRow={(vendor: Vendor, index: number) => (
                                <>
                                    <Table.Cell>{index + 1}</Table.Cell>
                                    <Table.Cell>{vendor.VENDORCODE}</Table.Cell>
                                    <Table.Cell>
                                        {`${vendor.VENDORNAME} ${vendor.MIDDLENAME || ''} ${vendor.LASTNAME || ''}`.trim()}
                                    </Table.Cell>
                                    <Table.Cell>{vendor.CONTACTPERSON}</Table.Cell>
                                    <Table.Cell>{vendor.MOBILENO}</Table.Cell>
                                    <Table.Cell>{vendor.EMAILID || '-'}</Table.Cell>
                                    <Table.Cell>{vendor.CITY}</Table.Cell>
                                    <Table.Cell>{vendor.STATE}</Table.Cell>
                                    <Table.Cell>{vendor.GSTNUMBER || '-'}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={vendor.ACTIVE === 'Y' ? 'green' : 'red'}>
                                            {vendor.ACTIVE === 'Y' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <HStack gap={2}>
                                            <FaEye
                                                onClick={() => handleViewDetails(vendor)}
                                                cursor="pointer"
                                                color="green"
                                                size="16px"
                                                title="View Details"
                                            />
                                            <FaEdit
                                                onClick={() => handleEdit(vendor)}
                                                cursor="pointer"
                                                color="blue"
                                                size="16px"
                                                title="Edit"
                                            />
                                            <FaTrash
                                                onClick={() => vendor.VENDORCODE && handleDeleteClick(vendor.VENDORCODE)}
                                                cursor="pointer"
                                                color="red"
                                                size="16px"
                                                title="Delete"
                                            />
                                        </HStack>
                                    </Table.Cell>
                                </>
                            )}
                            highlightRowId={highlightedId}
                            rowIdKey="VENDORCODE"
                            emptyText="No vendors available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

export default VendorMaster;
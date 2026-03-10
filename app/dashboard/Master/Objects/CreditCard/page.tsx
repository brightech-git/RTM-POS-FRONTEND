// app/(dashboard)/creditcards/page.tsx
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
    Fieldset
} from "@chakra-ui/react";
import { AiOutlineSave } from "react-icons/ai";
import { IoIosExit } from "react-icons/io";
import { FaEdit, FaPrint, FaFileExcel, FaTrash } from "react-icons/fa";
import { Table } from "@chakra-ui/react/table";
import { useTheme } from "@/context/theme/themeContext";
import { Toaster } from "@/components/ui/toaster";
import { usePrint } from "@/context/print/usePrintContext";
import { useRouter } from "next/navigation";

import { CustomTable } from "@/component/table/CustomTable";
import {
    useAllCreditCards,
    useCreditCardById,
    useCreateCreditCard,
    useUpdateCreditCard,
    useDeleteCreditCard
} from "@/hooks/CreditCard/useCreditCard";
import { CreditCard } from "@/types/CreditCard/CreditCard";
import { CreditCardConfig } from "@/config/Master/Object/CreditCard";

import { toastCreated, toastError, toastLoaded, toastUpdated, toastDeleted } from "@/component/toast/toast";
import ScrollToTop from "@/component/scroll/ScrollToTop";
import { DynamicForm } from "@/component/form/DynamicForm";
import { useEnterNavigation } from "@/component/form/useEnterNavigation";
import { DeleteDialog } from "@/components/ui/DeleteDialog";

function CreditCardMaster() {
    const { theme } = useTheme();
    const router = useRouter();
    const { setData, setColumns, setShowSno, title } = usePrint();

    /* -------------------- API HOOKS -------------------- */
   const { data: creditCardsData = [], refetch: refetchCreditCards } = useAllCreditCards();
const creditCards = creditCardsData as CreditCard[];

    const [editId, setEditId] = useState<string | number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: creditCardById } = useCreditCardById(Number(editId) || 0);
    const creditCard = creditCardById ?? null;

    const { mutate: createCreditCard } = useCreateCreditCard();
    const { mutate: updateCreditCard } = useUpdateCreditCard();
    const { mutate: deleteCreditCard } = useDeleteCreditCard();

    /* -------------------- FORM STATE -------------------- */
    const [form, setForm] = useState<CreditCard>({
        CARDNAME: "",
        ACTIVE: "Y",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!creditCard) return;
        
        setForm({
            CARDNAME: creditCard.CARDNAME,
            ACTIVE: creditCard.ACTIVE ?? "Y",
        });

        setTimeout(() => {
            toastLoaded("Credit Card");
            ScrollToTop();
        }, 100);
    }, [creditCard]);

    useEffect(() => {
        if (!highlightedId) return;
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [highlightedId]);

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (field: any, value: any) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setEditId(null);
        setForm({
            CARDNAME: "",
            ACTIVE: "Y",
        });
        setFormErrors({});
    };

    const handleEdit = (creditCard: any) => {
        setEditId(creditCard.CARDCODE);
        setForm({
            CARDNAME: creditCard.CARDNAME,
            ACTIVE: creditCard.ACTIVE ?? "Y",
        });
        ScrollToTop();
    };

    const handleSave = () => {
        const errors: Record<string, string> = {};

        if (!form.CARDNAME?.trim()) errors.CARDNAME = "Card Name is required";
        if (!form.ACTIVE?.trim()) errors.ACTIVE = "Active selection is required";

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const payload: CreditCard = {
            CARDNAME: form.CARDNAME,
            ACTIVE: form.ACTIVE,
        };

        if (editId) {
            const updatePayload = {
                ...payload,
                CARDCODE: Number(editId)
            };

            updateCreditCard(updatePayload, {
                onSuccess: () => {
                    refetchCreditCards();
                    resetForm();
                    setHighlightedId(Number(editId));
                    toastUpdated("Credit Card");
                },
                onError: (error) => {
                    console.error('Update error:', error);
                    toastError("Failed to update credit card");
                },
            });
        } else {
            createCreditCard({
                data: payload,
                createdBy: 1
            }, {
                onSuccess: () => {
                    refetchCreditCards();
                    resetForm();
                    toastCreated("Credit Card");
                },
                onError: (error) => {
                    console.error('Create error:', error);
                    toastError("Failed to create credit card");
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
            deleteCreditCard(deleteId, {
                onSuccess: () => {
                    refetchCreditCards();
                    toastDeleted("Credit Card");
                    setIsDeleteDialogOpen(false);
                    setDeleteId(null);
                },
                onError: (error) => {
                    console.error('Delete error:', error);
                    toastError("Failed to delete credit card");
                },
            });
        }
    };

    const CreditCardColumns = [
        { key: "CARDCODE", label: "Code" },
        { key: "CARDNAME", label: "Card Name" },
        { key: "ACTIVE", label: "Active" },
    ];

    const handleExport = (option: string) => {
        const exportData = creditCards.map((item: any) => ({
            CARDCODE: item.CARDCODE,
            CARDNAME: item.CARDNAME,
            ACTIVE: item.ACTIVE,
        }));

        setData(exportData);
        setColumns(CreditCardColumns);
        setShowSno(true);
        title?.("Credit Card Master");
        router.push(`/print?export=${option}`);
    };

    /* -------------------- FORM CONFIG -------------------- */
    const creditCardFormFields = CreditCardConfig();
    const fieldSequence = creditCardFormFields.map(f => f.name);

    const { register, focusNext } = useEnterNavigation(fieldSequence, () => {
        handleSave();
    });

    /* -------------------- UI -------------------- */
    return (
        <Box fontWeight="semibold" bg={theme.colors.primary} color={theme.colors.secondary}>
            <Toaster />
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Credit Card"
                message="Are you sure you want to delete this credit card? This action cannot be undone."
            />

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={2}>
                {/* ---------------- FORM ---------------- */}
                <GridItem>
                    <VStack bg={theme.colors.formColor} p={2} borderRadius="xl" border="1px solid #eef">
                        <Text fontSize="small" fontWeight="600">
                            CREDIT CARD {editId ? 'EDIT' : 'CREATION'}
                        </Text>

                        <Fieldset.Root size="sm" width="100%">
                            <Fieldset.Content>
                                <DynamicForm
                                    fields={creditCardFormFields}
                                    formData={form}
                                    onChange={handleChange}
                                    register={register}
                                    focusNext={focusNext}
                                    errors={formErrors}
                                />
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <HStack mt={2}>
                            <Button size="xs" colorPalette="blue" onClick={handleSave}>
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
                        <Box display="flex" mb={2} gap={2} justifyContent="space-between" alignItems="center">
                            <Text fontWeight="semibold" fontSize="small">
                                CREDIT CARD DETAILS
                            </Text>
                            <HStack>
                                <Button variant="ghost" size="sm" onClick={() => handleExport("excel")}>
                                    <FaFileExcel />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")}>
                                    <FaPrint />
                                </Button>
                            </HStack>
                        </Box>

                        <CustomTable
                            columns={CreditCardColumns}
                            data={creditCards}
                            headerBg={theme.colors.accient}
                            headerColor="white"
                            renderRow={(creditCard: any, index: number) => (
                                <>
                                    <Table.Cell>
                                        <Box display="flex" justifyContent="center" alignItems='center' gap={2}>
                                            {index + 1}
                                            <FaEdit 
                                                onClick={() => handleEdit(creditCard)} 
                                                cursor="pointer" 
                                                color="blue"
                                            />
                                            <FaTrash 
                                                onClick={() => handleDeleteClick(creditCard.CARDCODE)} 
                                                cursor="pointer" 
                                                color="red"
                                            />
                                        </Box>
                                    </Table.Cell>
                                    <Table.Cell>{creditCard.CARDNAME}</Table.Cell>
                                    <Table.Cell>{creditCard.ACTIVE}</Table.Cell>
                                </>
                            )}
                            highlightRowId={highlightedId}
                            rowIdKey="CARDCODE"
                            emptyText="No credit cards available"
                        />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}

export default CreditCardMaster;
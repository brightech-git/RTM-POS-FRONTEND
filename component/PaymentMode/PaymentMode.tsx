"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Text, HStack, VStack, Button, Flex, Input } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react/table";
import { AiOutlineCreditCard } from "react-icons/ai";
import { MdClear } from "react-icons/md";
import { Toaster, toaster } from "@/components/ui/toaster";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PaymentMode = "CASH" | "CREDIT CARD" | "CHEQUE" | "DISCOUNT" | "PRIVILEGE";

export interface PaymentEntry {
    id: number;
    type: PaymentMode;
    amount: number;
    cardName: string;
    bankName: string;
    branchName: string;
    chequeNo: string;
    accountNo: string;
    chequeDate: string;
}

export interface PaymentModeModalProps {
    /** Total bill net payable amount */
    totalAmount: number;
    /** Whether the parent save mutation is pending */
    isSaving?: boolean;
    /** Called when payment is complete and user clicks final Ok */
    onSave: (payments: PaymentEntry[], cashGiven: number, balance: number) => void;
    /** Called when user clicks Back — closes the modal */
    onBack: () => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => Math.abs(n).toFixed(2);
const PAYMENT_MODES: PaymentMode[] = ["CASH", "CREDIT CARD", "CHEQUE", "DISCOUNT", "PRIVILEGE"];
const SHORTCUTS: { key: string; label: string; mode: PaymentMode }[] = [
    { key: "F1", label: "CASH",        mode: "CASH"        },
    { key: "F2", label: "CREDIT CARD", mode: "CREDIT CARD" },
    { key: "F3", label: "CHEQUE",      mode: "CHEQUE"      },
    { key: "F4", label: "DISCOUNT",    mode: "DISCOUNT"    },
    { key: "F5", label: "PRIVILEGE",   mode: "PRIVILEGE"   },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PaymentModeModal({
    totalAmount,
    isSaving = false,
    onSave,
    onBack,
}: PaymentModeModalProps) {
    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    const [selectedMode, setSelectedMode] = useState<PaymentMode>("CASH");
    const [cashAmount, setCashAmount] = useState<string>("");
    const [entryAmount, setEntryAmount] = useState<string>(totalAmount.toFixed(2));

    const entryAmtRef = useRef<HTMLInputElement>(null);
    const cashAmtRef = useRef<HTMLInputElement>(null);

    // ── Derived ───────────────────────────────────────────────────────────────

    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const remaining = Math.max(totalAmount - totalPaid, 0);
    const cashGiven = parseFloat(cashAmount) || 0;
    const midBalance = cashGiven - (parseFloat(entryAmount) || 0);

    // ── Keyboard shortcuts F1–F5 ──────────────────────────────────────────────

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const map: Record<string, PaymentMode> = {
                F1: "CASH", F2: "CREDIT CARD", F3: "CHEQUE", F4: "DISCOUNT", F5: "PRIVILEGE",
            };
            if (map[e.key]) { e.preventDefault(); handleModeSelect(map[e.key] as PaymentMode); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payments, totalAmount]);

    // ── Auto-focus entry amount field on mount ────────────────────────────────

    useEffect(() => {
        setTimeout(() => { entryAmtRef.current?.focus(); entryAmtRef.current?.select(); }, 100);
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleModeSelect = useCallback((mode: PaymentMode) => {
        setSelectedMode(mode);
        const rem = totalAmount - payments.reduce((s, p) => s + p.amount, 0);
        setEntryAmount(rem > 0 ? rem.toFixed(2) : "0.00");
        setCashAmount("");
        setTimeout(() => { entryAmtRef.current?.focus(); entryAmtRef.current?.select(); }, 80);
    }, [payments, totalAmount]);

    const handleAddPayment = useCallback(() => {
        const amt = parseFloat(entryAmount) || 0;
        if (amt <= 0) {
            toaster.create({ title: "Invalid Amount", description: "Enter a valid amount", type: "warning", duration: 2500 });
            return;
        }
        if (totalPaid + amt > totalAmount + 0.001) {
            toaster.create({ title: "Exceeds Balance", description: "Amount exceeds remaining balance", type: "warning", duration: 2500 });
            return;
        }

        const entry: PaymentEntry = {
            id: Date.now(),
            type: selectedMode,
            amount: amt,
            cardName: "",
            bankName: "",
            branchName: "",
            chequeNo: "",
            accountNo: "",
            chequeDate: "",
        };

        setPayments(prev => [...prev, entry]);
        setCashAmount("");

        // After adding, set entry amount to remaining balance
        const newRemaining = totalAmount - (totalPaid + amt);
        setEntryAmount(newRemaining > 0.001 ? newRemaining.toFixed(2) : "0.00");

        toaster.create({
            title: "Payment Added",
            description: `${selectedMode} — ₹${amt.toFixed(2)}`,
            type: "success",
            duration: 1500,
        });

        setTimeout(() => { entryAmtRef.current?.focus(); entryAmtRef.current?.select(); }, 80);
    }, [entryAmount, selectedMode, totalPaid, totalAmount]);

    const handleCancelEntry = useCallback(() => {
        setCashAmount("");
        setEntryAmount(remaining > 0 ? remaining.toFixed(2) : "0.00");
    }, [remaining]);

    const handleDeletePayment = useCallback((id: number) => {
        setPayments(prev => {
            const updated = prev.filter(p => p.id !== id);
            const newPaid = updated.reduce((s, p) => s + p.amount, 0);
            const newRem = totalAmount - newPaid;
            setEntryAmount(newRem > 0.001 ? newRem.toFixed(2) : "0.00");
            return updated;
        });
    }, [totalAmount]);

    const handleFinalSave = useCallback(() => {
        if (payments.length === 0) {
            toaster.create({ title: "No Payments", description: "Add at least one payment entry", type: "warning", duration: 2500 });
            return;
        }
        if (totalPaid < totalAmount - 0.01) {
            toaster.create({
                title: "Incomplete Payment",
                description: `Remaining: ₹${(totalAmount - totalPaid).toFixed(2)}`,
                type: "warning",
                duration: 3000,
            });
            return;
        }
        onSave(payments, cashGiven, cashGiven - totalAmount);
    }, [payments, totalPaid, totalAmount, cashGiven, onSave]);

    // ── Payment type summary (grouped) ────────────────────────────────────────

    const paymentSummary = payments.reduce<Record<string, number>>((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + p.amount;
        return acc;
    }, {});

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <Toaster />

            {/* Overlay */}
            <Box
                position="fixed"
                inset={0}
                bg="blackAlpha.600"
                zIndex={1000}
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={4}
            >
                {/* Dialog box */}
                <Box
                    bg="white"
                    borderRadius="md"
                    overflow="hidden"
                    width="100%"
                    maxW="980px"
                    display="flex"
                    flexDirection="column"
                    boxShadow="2xl"
                    maxH="92vh"
                >

                    {/* ── HEADER ──────────────────────────────────────────────── */}
                    <Box
                        bg="#1a8a9a"
                        px={4}
                        py="10px"
                        borderBottom="1px solid #2ab0c4"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexShrink={0}
                    >
                        <HStack gap={3}>
                            <Box
                                bg="white" borderRadius="md"
                                w="36px" h="36px"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <AiOutlineCreditCard size={22} color="#1a8a9a" />
                            </Box>
                            <Text fontSize="lg" fontWeight="700" color="white" letterSpacing="0.3px">
                                Payment Mode
                            </Text>
                        </HStack>
                        <HStack gap={1}>
                            <Text fontSize="sm" color="#b8eaf2" fontWeight="500">Balance &nbsp;&#8377;</Text>
                            <Text fontSize="xl" fontWeight="800" color="white">
                                {fmt(Math.max(totalAmount - totalPaid, 0))} /-
                            </Text>
                        </HStack>
                    </Box>

                    {/* ── BODY: left fields + right payment summary ────────────── */}
                    <Box
                        bg="#1a8a9a"
                        px={4}
                        py={3}
                        display="grid"
                        gridTemplateColumns="1fr 1fr"
                        gap={3}
                        flexShrink={0}
                    >
                        {/* Left: form fields */}
                        <VStack align="stretch" gap={3}>
                            <Box>
                                <Text fontSize="12px" color="#d8f4fa" fontWeight="600" mb="3px">To Receive</Text>
                                <Input
                                    size="sm" bg="white" borderRadius="sm"
                                    textAlign="right" fontSize="13px"
                                    value={totalPaid >= totalAmount ? "0.00" : fmt(totalAmount - totalPaid)}
                                    readOnly color="gray.700"
                                    border="1px solid #ccc"
                                    _focus={{}}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="12px" color="#d8f4fa" fontWeight="600" mb="3px">Balance Amount</Text>
                                <Input
                                    size="sm" bg="white" borderRadius="sm"
                                    textAlign="right" fontSize="13px"
                                    value={fmt(Math.max(totalAmount - totalPaid, 0))}
                                    readOnly color="gray.700"
                                    border="1px solid #ccc"
                                    _focus={{}}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="12px" color="#d8f4fa" fontWeight="600" mb="3px">Payment Mode</Text>
                                <select
                                    value={selectedMode}
                                    onChange={e => handleModeSelect(e.target.value as PaymentMode)}
                                    style={{
                                        height: "32px",
                                        background: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "2px",
                                        padding: "0 8px",
                                        fontSize: "13px",
                                        color: "#1a8a9a",
                                        fontWeight: "600",
                                        width: "100%",
                                        cursor: "pointer",
                                    }}
                                >
                                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </Box>
                        </VStack>

                        {/* Right: grouped payment summary */}
                        <Box bg="white" border="1px solid #bbb" borderRadius="sm" overflow="hidden">
                            <Box
                                display="grid" gridTemplateColumns="1fr 1fr"
                                borderBottom="1px solid #ddd"
                                px={3} py="6px" bg="gray.50"
                            >
                                <Text fontSize="11px" fontWeight="700" color="gray.600">PaymentType</Text>
                                <Text fontSize="11px" fontWeight="700" color="gray.600" textAlign="right">Amount</Text>
                            </Box>
                            <Box minH="80px" py={1}>
                                {Object.entries(paymentSummary).length === 0 ? (
                                    <Text fontSize="11px" color="gray.400" textAlign="center" pt={3}>No payments yet</Text>
                                ) : (
                                    Object.entries(paymentSummary).map(([type, amt]) => (
                                        <Box key={type} display="grid" gridTemplateColumns="1fr 1fr" px={3} py="3px">
                                            <Text fontSize="12px" color="gray.700">{type}</Text>
                                            <Text fontSize="12px" color="gray.700" textAlign="right" fontWeight="600">
                                                {amt.toFixed(2)}
                                            </Text>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* ── MID: cash / balance / amount entry row ───────────────── */}
                    <Box
                        bg="gray.50"
                        borderTop="1px solid #ccc"
                        borderBottom="1px solid #ccc"
                        px={4} py="8px"
                        flexShrink={0}
                    >
                        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={3} alignItems="end">
                            {/* Cash Amount */}
                            <Box>
                                <Text fontSize="11px" color="gray.600" fontWeight="600" mb="3px">Cash Amount</Text>
                                <Input
                                    ref={cashAmtRef}
                                    size="sm" bg="white"
                                    border="1px solid #bbb" borderRadius="sm"
                                    textAlign="right" fontSize="12px"
                                    type="number"
                                    value={cashAmount}
                                    onChange={e => setCashAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </Box>
                            {/* Balance Amount (change) */}
                            <Box>
                                <Text fontSize="11px" color="gray.600" fontWeight="600" mb="3px">Balance Amount</Text>
                                <Input
                                    size="sm" bg="white"
                                    border="1px solid #bbb" borderRadius="sm"
                                    textAlign="right" fontSize="12px"
                                    value={cashAmount ? midBalance.toFixed(2) : ""}
                                    readOnly
                                    placeholder="0.00"
                                    color={midBalance >= 0 ? "green.600" : "red.500"}
                                    fontWeight="600"
                                />
                            </Box>
                            {/* Entry Amount */}
                            <Box>
                                <Text fontSize="11px" color="gray.600" fontWeight="600" mb="3px">Amount</Text>
                                <Input
                                    ref={entryAmtRef}
                                    size="sm" bg="white"
                                    border="1px solid #bbb" borderRadius="sm"
                                    textAlign="right" fontSize="12px" fontWeight="600"
                                    type="number"
                                    value={entryAmount}
                                    onChange={e => setEntryAmount(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") handleAddPayment(); }}
                                    color="blue.700"
                                />
                            </Box>
                            {/* Cancel / Ok buttons */}
                            <VStack gap="5px" align="stretch" pb="1px">
                                <HStack
                                    as="button" gap={2}
                                    cursor="pointer" _hover={{ opacity: 0.75 }}
                                    onClick={handleCancelEntry}
                                    bg="none" border="none" p={0}
                                >
                                    <Box
                                        w="20px" h="20px" bg="red.500"
                                        borderRadius="full"
                                        display="flex" alignItems="center" justifyContent="center"
                                        flexShrink={0}
                                    >
                                        <MdClear size={12} color="white" />
                                    </Box>
                                    <Text fontSize="13px" fontWeight="700" color="red.600">Cancel</Text>
                                </HStack>
                                <HStack
                                    as="button" gap={2}
                                    cursor="pointer" _hover={{ opacity: 0.75 }}
                                    onClick={handleAddPayment}
                                    bg="none" border="none" p={0}
                                >
                                    <Box
                                        w="20px" h="20px" bg="green.500"
                                        borderRadius="full"
                                        display="flex" alignItems="center" justifyContent="center"
                                        flexShrink={0}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 10 10">
                                            <polyline points="2,5 4,8 8,2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Box>
                                    <Text fontSize="13px" fontWeight="700" color="green.600">Ok</Text>
                                </HStack>
                            </VStack>
                        </Box>
                    </Box>

                    {/* ── DETAIL TABLE ─────────────────────────────────────────── */}
                    <Box flex="1" overflowY="auto" minH="110px" maxH="200px">
                        <Table.Root size="sm" variant="outline" style={{ tableLayout: "fixed", width: "100%" }}>
                            <Table.Header bg="gray.100" position="sticky" top={0} zIndex={1}>
                                <Table.Row>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px" w="110px">PaymentType</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px" textAlign="right" w="80px">Amount</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px">CardName</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px">BankName</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px">BranchName</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px">ChequeNo | CardNo</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px">AccountNo | ApprovalNo</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="11px" fontWeight="700" color="gray.600" py="5px" w="90px">ChequeDate</Table.ColumnHeader>
                                    <Table.ColumnHeader w="36px" py="5px"></Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {payments.length === 0 ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={9} textAlign="center" py={5} color="gray.400" fontSize="12px">
                                            No payment entries yet — add one above
                                        </Table.Cell>
                                    </Table.Row>
                                ) : (
                                    payments.map((p, i) => (
                                        <Table.Row key={p.id} bg={i % 2 === 0 ? "white" : "gray.50"} _hover={{ bg: "blue.50" }}>
                                            <Table.Cell fontSize="11px" py="4px" color="gray.700">{p.type}</Table.Cell>
                                            <Table.Cell fontSize="11px" py="4px" textAlign="right" fontWeight="700" color="blue.700">{p.amount.toFixed(2)}</Table.Cell>
                                            <Table.Cell fontSize="11px" py="4px" color="gray.500">{p.cardName || "—"}</Table.Cell>
                                            <Table.Cell fontSize="11px" py="4px" color="gray.500">{p.bankName || "—"}</Table.Cell>
                                            <Table.Cell fontSize="11px" py="4px" color="gray.500">{p.branchName || "—"}</Table.Cell>
                                            <Table.Cell fontSize="11px" py="4px" color="gray.500">{p.chequeNo || "—"}</Table.Cell>
                                            <Table.Cell fontSize="11px" py="4px" color="gray.500">{p.accountNo || "—"}</Table.Cell>
                                            <Table.Cell fontSize="11px" py="4px" color="gray.500">{p.chequeDate || "—"}</Table.Cell>
                                            <Table.Cell py="4px" textAlign="center">
                                                <Box
                                                    as="button"
                                                    onClick={() => handleDeletePayment(p.id)}
                                                    color="red.400" _hover={{ color: "red.600" }}
                                                    cursor="pointer" bg="none" border="none"
                                                    p={0} fontSize="16px" lineHeight="1"
                                                    title="Remove"
                                                >
                                                    ×
                                                </Box>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                )}
                            </Table.Body>
                        </Table.Root>
                    </Box>

                    {/* ── FOOTER: shortcuts + Ok / Back ────────────────────────── */}
                    <Box
                        bg="#1a8a9a"
                        borderTop="2px solid #2ab0c4"
                        px={4} py="8px"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexShrink={0}
                    >
                        <HStack gap={2} flexWrap="wrap">
                            {SHORTCUTS.map(s => (
                                <Box
                                    key={s.key}
                                    as="button"
                                    fontSize="11px" color="#d8f4fa" fontWeight="500"
                                    cursor="pointer" px="6px" py="3px"
                                    borderRadius="sm" border="1px solid transparent"
                                    _hover={{ bg: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.3)" }}
                                    onClick={() => handleModeSelect(s.mode)}
                                    transition="all 0.12s"
                                >
                                    <Text as="span" color="white" fontWeight="700">{s.key}</Text>
                                    -{s.label}
                                </Box>
                            ))}
                        </HStack>
                        <HStack gap={2}>
                            <Button
                                size="sm"
                                bg="#27ae60" color="white"
                                _hover={{ bg: "#219a52" }}
                                borderRadius="sm" fontWeight="600" fontSize="13px" px={5}
                                onClick={handleFinalSave}
                                loading={isSaving}
                                disabled={payments.length === 0 || totalPaid < totalAmount - 0.01}
                            >
                                Ok
                            </Button>
                            <Button
                                size="sm"
                                bg="#e74c8b" color="white"
                                _hover={{ bg: "#c73579" }}
                                borderRadius="sm" fontWeight="600" fontSize="13px" px={4}
                                onClick={onBack}
                                disabled={isSaving}
                            >
                                Back
                            </Button>
                        </HStack>
                    </Box>

                </Box>
            </Box>
        </>
    );
}
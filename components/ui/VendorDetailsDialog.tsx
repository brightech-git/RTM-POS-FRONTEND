// components/ui/VendorDetailsDialog.tsx
import React, { useState } from "react";
import {
    Dialog,
    Button,
    Portal,
    Text,
    Box,
    Badge,
    Separator,
} from "@chakra-ui/react";

interface VendorDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    vendor: any;
}

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = ["Basic", "Tax", "Address", "Contact", "Other"] as const;
type TabKey = (typeof TABS)[number];

// ── Icon map (inline SVGs, no extra dep) ────────────────────────────────────
const TabIcon: Record<TabKey, React.ReactNode> = {
    Basic: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Tax: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    Address: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    Contact: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    Other: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
};

// ── Field row ────────────────────────────────────────────────────────────────
interface FieldItem {
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
    isBadge?: boolean;
    badgeColor?: string;
}

const FieldRow = ({ label, value, highlight, isBadge, badgeColor }: FieldItem) => (
    <Box
        display="grid"
        gridTemplateColumns="160px 1fr"
        gap={3}
        alignItems="start"
        px={3}
        py={2.5}
        borderRadius="lg"
        bg={highlight ? "blue.50" : "transparent"}
        _hover={{ bg: "gray.50" }}
        transition="background 0.15s"
    >
        <Text
            fontSize="xs"
            fontWeight="600"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.05em"
            lineHeight="1.6"
            pt="1px"
        >
            {label}
        </Text>
        <Box>
            {isBadge ? (
                <Badge
                    colorPalette={badgeColor}
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={0.5}
                    fontSize="xs"
                    fontWeight="600"
                >
                    {value}
                </Badge>
            ) : (
                <Text fontSize="sm" color="gray.800" fontWeight="500" lineHeight="1.6">
                    {value || "—"}
                </Text>
            )}
        </Box>
    </Box>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box>
        <Text
            fontSize="xs"
            fontWeight="700"
            color="blue.600"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mb={2}
            mt={1}
            px={3}
        >
            {title}
        </Text>
        <Box
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="xl"
            overflow="hidden"
            bg="white"
            boxShadow="sm"
        >
            {children}
        </Box>
    </Box>
);

// ── Main component ────────────────────────────────────────────────────────────
export const VendorDetailsDialog = ({ isOpen, onClose, vendor }: VendorDetailsDialogProps) => {
    const [activeTab, setActiveTab] = useState<TabKey>("Basic");

    if (!vendor) return null;

    const formatAddress = () =>
        [vendor.ADDRESS1, vendor.ADDRESS2, vendor.ADDRESS3, vendor.AREA,
            vendor.CITY, vendor.DISTRICT, vendor.STATE, vendor.COUNTRY, vendor.PINCODE]
            .filter(Boolean).join(", ");

    const fullName = `${vendor.VENDORNAME} ${vendor.MIDDLENAME || ""} ${vendor.LASTNAME || ""}`.trim();

    // ── Data maps ───────────────────────────────────────────────────────────
    const tabData: Record<TabKey, React.ReactNode> = {
        Basic: (
            <Section title="Vendor Profile">
                <FieldRow label="Vendor Code" value={vendor.VENDORCODE} highlight />
                <FieldRow label="Full Name" value={fullName} />
                <FieldRow label="Middle Name" value={vendor.MIDDLENAME} />
                <FieldRow label="Last Name" value={vendor.LASTNAME} />
                <FieldRow label="Contact Person" value={vendor.CONTACTPERSON} />
                <FieldRow
                    label="Status"
                    value={vendor.ACTIVE === "Y" ? "Active" : "Inactive"}
                    isBadge
                    badgeColor={vendor.ACTIVE === "Y" ? "green" : "red"}
                />
                <FieldRow label="Created By" value={vendor.CREATEDBY} />
                <FieldRow label="Created Date" value={vendor.CREATEDDATE} />
                <FieldRow label="Created Time" value={vendor.CREATEDTIME} />
            </Section>
        ),

        Tax: (
            <Section title="Tax Identifiers">
                <FieldRow label="PAN No" value={vendor.PANNO} />
                <FieldRow label="TIN No" value={vendor.TINNO} />
                <FieldRow label="CST No" value={vendor.CSTNO} />
                <FieldRow label="GST Number" value={vendor.GSTNUMBER} highlight />
                <FieldRow label="HSN State Code" value={vendor.HSNSTATECODE} />
            </Section>
        ),

        Address: (
            <>
                <Section title="Address Lines">
                    <FieldRow label="Address Line 1" value={vendor.ADDRESS1} highlight />
                    <FieldRow label="Address Line 2" value={vendor.ADDRESS2} />
                    <FieldRow label="Address Line 3" value={vendor.ADDRESS3} />
                    <FieldRow label="Area" value={vendor.AREA} />
                    <FieldRow label="City" value={vendor.CITY} />
                    <FieldRow label="District" value={vendor.DISTRICT} />
                    <FieldRow label="State" value={vendor.STATE} />
                    <FieldRow label="Country" value={vendor.COUNTRY} />
                    <FieldRow label="Pincode" value={vendor.PINCODE} />
                </Section>

                {/* Formatted address card */}
                <Box
                    mt={4}
                    p={4}
                    borderRadius="xl"
                    bg="linear-gradient(135deg, #EBF4FF 0%, #F0F4FF 100%)"
                    borderWidth="1px"
                    borderColor="blue.100"
                    position="relative"
                    overflow="hidden"
                >
                    <Box
                        position="absolute"
                        top={0} left={0}
                        w={1}
                        h="full"
                        bg="blue.400"
                        borderLeftRadius="xl"
                    />
                    <Text fontSize="xs" fontWeight="700" color="blue.500" textTransform="uppercase"
                        letterSpacing="0.08em" mb={1.5} pl={2}>
                        Formatted Address
                    </Text>
                    <Text fontSize="sm" color="gray.700" lineHeight="1.7" pl={2}>
                        {formatAddress() || "—"}
                    </Text>
                </Box>
            </>
        ),

        Contact: (
            <Section title="Contact Details">
                <FieldRow label="Phone 1" value={vendor.PHONENO} />
                <FieldRow label="Phone 2" value={vendor.PHONENO2} />
                <FieldRow label="Mobile 1" value={vendor.MOBILENO} highlight />
                <FieldRow label="Mobile 2" value={vendor.MOBILENO2} />
                <FieldRow label="Email 1" value={vendor.EMAILID} highlight />
                <FieldRow label="Email 2" value={vendor.EMAILID2} />
            </Section>
        ),

        Other: (
            <Section title="Remarks">
                <Box px={3} py={3}>
                    <Text fontSize="sm" color={vendor.REMARKS ? "gray.800" : "gray.400"}
                        fontStyle={vendor.REMARKS ? "normal" : "italic"} lineHeight="1.8">
                        {vendor.REMARKS || "No remarks added."}
                    </Text>
                </Box>
            </Section>
        ),
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size="xl">
            <Portal>
                <Dialog.Backdrop backdropFilter="blur(4px)" bg="blackAlpha.400" />
                <Dialog.Positioner>
                    <Dialog.Content
                        maxH="85vh"
                        borderRadius="2xl"
                        overflow="hidden"
                        boxShadow="0 25px 50px -12px rgba(0,0,0,0.25)"
                        border="1px solid"
                        borderColor="gray.100"
                    >
                        {/* ── Header ── */}
                        <Dialog.Header
                            px={6}
                            py={4}
                            bg="linear-gradient(135deg, #1A56DB 0%, #1E3A8A 100%)"
                            position="relative"
                            overflow="hidden"
                        >
                            {/* Decorative circles */}
                            <Box
                                position="absolute" top="-20px" right="-20px"
                                w="100px" h="100px" borderRadius="full"
                                bg="whiteAlpha.100"
                            />
                            <Box
                                position="absolute" bottom="-30px" right="80px"
                                w="70px" h="70px" borderRadius="full"
                                bg="whiteAlpha.50"
                            />

                            <Box display="flex" alignItems="center" justifyContent="space-between" position="relative">
                                <Box display="flex" alignItems="center" gap={3}>
                                    {/* Avatar circle */}
                                    <Box
                                        w="44px" h="44px" borderRadius="full"
                                        bg="whiteAlpha.200"
                                        border="2px solid"
                                        borderColor="whiteAlpha.400"
                                        display="flex" alignItems="center" justifyContent="center"
                                        flexShrink={0}
                                    >
                                        <Text fontSize="lg" fontWeight="700" color="white">
                                            {(vendor.VENDORNAME || "V")[0].toUpperCase()}
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text fontSize="lg" fontWeight="700" color="white" lineHeight="1.3">
                                            {vendor.VENDORNAME}
                                        </Text>
                                        <Text fontSize="xs" color="blue.200" fontWeight="500">
                                            {vendor.VENDORCODE} · {vendor.CONTACTPERSON || "No contact"}
                                        </Text>
                                    </Box>
                                </Box>

                                <Box display="flex" alignItems="center" gap={2}  padding={10}>
                                    <Badge
                                        colorPalette={vendor.ACTIVE === "Y" ? "green" : "red"}
                                        variant="solid"
                                        borderRadius="full"
                                        px={2}
                                        fontSize="xs"
                                        fontWeight="600"
                                       
                                    >
                                        {vendor.ACTIVE === "Y" ? "● Active" : "● Inactive"}
                                    </Badge>
                                </Box>
                            </Box>
                        </Dialog.Header>

                        {/* ── Custom Tab Bar ── */}
                        <Box
                            display="flex"
                            gap={1}
                            px={4}
                            pt={3}
                            pb={0}
                            bg="gray.50"
                            borderBottom="1px solid"
                            borderColor="gray.100"
                        >
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab;
                                return (
                                    <Box
                                        key={tab}
                                        as="button"
                                        onClick={() => setActiveTab(tab)}
                                        display="flex"
                                        alignItems="center"
                                        gap={1.5}
                                        px={3}
                                        py={2.5}
                                        fontSize="sm"
                                        fontWeight={isActive ? "600" : "500"}
                                        color={isActive ? "blue.600" : "gray.500"}
                                        borderBottom="2px solid"
                                        borderColor={isActive ? "blue.500" : "transparent"}
                                        bg="transparent"
                                        cursor="pointer"
                                        transition="all 0.15s"
                                        _hover={{ color: "blue.500" }}
                                        mb="-1px"
                                    >
                                        {TabIcon[tab]}
                                        {tab}
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* ── Body ── */}
                        <Dialog.Body
                            overflowY="auto"
                            px={5}
                            py={4}
                            bg="gray.50"
                            css={{
                                "&::-webkit-scrollbar": { width: "6px" },
                                "&::-webkit-scrollbar-track": { background: "transparent" },
                                "&::-webkit-scrollbar-thumb": {
                                    background: "#CBD5E0",
                                    borderRadius: "3px",
                                },
                            }}
                        >
                            <Box display="flex" flexDir="column" gap={4}>
                                {tabData[activeTab]}
                            </Box>
                        </Dialog.Body>

                        {/* ── Footer ── */}
                        <Dialog.Footer
                            px={5}
                            py={3}
                            bg="white"
                            borderTop="1px solid"
                            borderColor="gray.100"
                            display="flex"
                            justifyContent="flex-end"
                        >
                            <Button
                                onClick={onClose}
                                size="sm"
                                colorPalette="blue"
                                variant="solid"
                                borderRadius="lg"
                                px={5}
                                fontWeight="600"
                                boxShadow="sm"
                            >
                                Close
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
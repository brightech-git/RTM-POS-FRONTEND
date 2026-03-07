// hooks/useSelectionModal.ts
import { useState, useCallback, useRef } from "react";
import { useGlobalKey } from "@/components/key/useGlobalKey";

interface UseSelectionModalProps<T> {
    items: T[];
    onSelect: (item: T) => void;
    keyShortcut?: string;
    idKey?: string;
    nameKey?: string;
}

export function useSelectionModal<T extends Record<string, any>>({
    items,
    onSelect,
    keyShortcut = "F2",
    idKey = "id",
    nameKey = "name",
}: UseSelectionModalProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState<"product" | "subproduct" | null>(null);
    const [context, setContext] = useState<any>(null);
    
    const openModal = useCallback((type: "product" | "subproduct", contextData?: any) => {
        setModalType(type);
        setContext(contextData);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setModalType(null);
        setContext(null);
    }, []);

    const handleSelect = useCallback((item: T) => {
        onSelect(item);
        closeModal();
    }, [onSelect, closeModal]);

    // Register global key shortcut
    useGlobalKey(keyShortcut, (e) => {
        e.preventDefault();
        // You can customize this based on which input is focused
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLInputElement) {
            const inputName = activeElement.name;
            if (inputName === "PRODUCTCODE" || inputName === "PRODUCTNAME") {
                openModal("product");
            } else if (inputName === "SUBPRODUCTCODE" || inputName === "SUBPRODUCTNAME") {
                openModal("subproduct");
            }
        }
    }, "selection-modal-global");

    return {
        isOpen,
        modalType,
        context,
        openModal,
        closeModal,
        handleSelect,
    };
}
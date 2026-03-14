import { useRef, useEffect } from 'react';

type FieldName = string;
type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

interface UseEnterNavigationReturn {
    register: (fieldName: FieldName) => (el: InputElement) => void;
    focusNext: (currentField: FieldName) => void;
    focusFirst: () => void;
}

export const useEnterNavigation = (
    fields: FieldName[],
    onSubmit?: () => boolean  // ← was () => void
): UseEnterNavigationReturn => {
    const inputRefs = useRef<Record<FieldName, InputElement>>({});
    const hasMounted = useRef(false);

    const register = (fieldName: FieldName) => (el: InputElement) => {
        inputRefs.current[fieldName] = el;
    };

    const focusFirst = () => {
        if (fields.length > 0) {
            inputRefs.current[fields[0]]?.focus();
        }
    };

    const focusNext = (currentField: FieldName) => {
        const currentIndex = fields.indexOf(currentField);
        if (currentIndex === -1) return;

        for (let i = currentIndex + 1; i < fields.length; i++) {
            const nextField = fields[i];
            const element = inputRefs.current[nextField] as HTMLInputElement | null;
            if (element && !element.disabled && !element.readOnly && element.offsetParent !== null) {
                element.focus();
                return;
            }
        }

        // Last field — only focus first if submit succeeds
        if (onSubmit) {
            const success = onSubmit(); // ← capture return value
            if (success) {
                setTimeout(() => focusFirst(), 150); // ← only runs on success
            }
            // on failure: focus stays on SALEMANCODE (validate() already focused it)
        }
    };

    // Auto-focus first field ONLY on initial mount
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            const timer = setTimeout(() => focusFirst(), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    return { register, focusNext, focusFirst };
};
// // components/form/InputSelection.tsx
// "use client";

// import React, { useState, useRef, useEffect, forwardRef } from "react";
// import {
//     Input,
//     InputGroup,
//     InputElement,
//     IconButton,
//     HStack,
//     Text,
//     Kbd,
//     Tooltip,
//     Spinner,
// } from "@chakra-ui/react";
// import {FormControl,
//     FormLabel,
//     FormErrorMessage,} from "@chakra-ui/form-control"

// import { IoSearch, IoClose } from "react-icons/io5";
// import { useGlobalKey } from "@/components/key/useGlobalKey";
// import { SelectionModal, ColumnConfig } from "@/components/Modals/SelectionModal";

// export interface InputSelectionProps {
//     name: string;
//     label?: string;
//     value: string | number;
//     displayValue?: string;
//     placeholder?: string;
//     error?: string;
//     isDisabled?: boolean;
//     isRequired?: boolean;
//     autoFocus?: boolean;
//     size?: "xs" | "sm" | "md" | "lg";
//     items: any[];
//     modalTitle?: string;
//     modalSearchPlaceholder?: string;
//     searchKeys?: string[];
//     columns?: ColumnConfig[];
//     idKey?: string;
//     nameKey?: string;
//     codeKey?: string;
//     showCode?: boolean;
//     renderItem?: (item: any, isSelected: boolean) => React.ReactNode;
//     onSelect: (item: any) => void;
//     onChange?: (value: string) => void;
//     onSearch?: (value: string) => void;
//     onClear?: () => void;
//     onBlur?: () => void;
//     filterItems?: (items: any[]) => any[];
//     allowManualInput?: boolean;
//     inputType?: "text" | "number" | "tel";
//     pattern?: string;
//     maxLength?: number;
//     showShortcut?: boolean;
//     shortcutKey?: string;
//     leftIcon?: React.ReactElement;
//     inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
//     isLoading?: boolean;
// }

// export const InputSelection = forwardRef<HTMLInputElement, InputSelectionProps>(({
//     name,
//     label,
//     value,
//     displayValue,
//     placeholder = "Enter or search...",
//     error,
//     isDisabled = false,
//     isRequired = false,
//     autoFocus = false,
//     size = "sm",
//     items,
//     modalTitle = "Select Item",
//     modalSearchPlaceholder = "Search...",
//     searchKeys = ["name", "code"],
//     columns,
//     idKey = "id",
//     nameKey = "name",
//     codeKey = "code",
//     showCode = true,
//     renderItem,
//     onSelect,
//     onChange,
//     onSearch,
//     onClear,
//     onBlur,
//     filterItems,
//     allowManualInput = true,
//     inputType = "text",
//     pattern,
//     maxLength,
//     showShortcut = true,
//     shortcutKey = "F2",
//     leftIcon,
//     inputProps = {},
//     isLoading = false,
// }, ref) => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [localDisplayValue, setLocalDisplayValue] = useState(displayValue || "");
//     const inputRef = useRef<HTMLInputElement>(null);
//     const combinedRef = (ref || inputRef) as React.RefObject<HTMLInputElement>;

//     useEffect(() => {
//         setLocalDisplayValue(displayValue || "");
//     }, [displayValue]);

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const newValue = e.target.value;
//         if (!allowManualInput) return;

//         if (inputType === "number" || inputType === "tel") {
//             if (newValue === "" || /^\d*$/.test(newValue)) {
//                 setLocalDisplayValue(newValue);
//                 onChange?.(newValue);
//             }
//         } else {
//             setLocalDisplayValue(newValue);
//             onChange?.(newValue);
//         }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent) => {
//         if (e.key === "Enter") {
//             e.preventDefault();
//             if (localDisplayValue && onSearch) {
//                 onSearch(localDisplayValue);
//             }
//         }
//     };

//     useGlobalKey(shortcutKey, (e) => {
//         if (!isDisabled && document.activeElement === combinedRef.current) {
//             e.preventDefault();
//             openModal();
//         }
//     }, `input-selection-${name}`);

//     const openModal = () => {
//         if (isDisabled) return;
//         setIsModalOpen(true);
//     };

//     const handleSelect = (item: any) => {
//         onSelect(item);
//         setIsModalOpen(false);
//     };

//     const handleClear = () => {
//         setLocalDisplayValue("");
//         onChange?.("");
//         onClear?.();
//     };

//     const modalItems = React.useMemo(() => {
//         let filteredItems = [...items];
//         if (filterItems) filteredItems = filterItems(filteredItems);
//         return filteredItems;
//     }, [items, filterItems]);

//     const hasValue = value || localDisplayValue;

//     return (
//         <>
//             <FormControl isInvalid={!!error} isRequired={isRequired} isDisabled={isDisabled}>
//                 {label && (
//                     <FormLabel htmlFor={name} fontSize="sm" fontWeight="medium" mb={1}>
//                         {label} {isRequired && <span style={{ color: 'red' }}>*</span>}
//                     </FormLabel>
//                 )}

//                 <InputGroup size={size}>
//                     {leftIcon && (
//                         <InputElement pointerEvents="none">
//                             {leftIcon}
//                         </InputElement>
//                     )}

//                     <Input
//                         ref={combinedRef}
//                         id={name}
//                         name={name}
//                         type={inputType}
//                         value={localDisplayValue}
//                         onChange={handleInputChange}
//                         onKeyDown={handleKeyDown}
//                         onBlur={onBlur}
//                         placeholder={placeholder}
//                         disabled={isDisabled}
//                         autoFocus={autoFocus}
//                         pattern={pattern}
//                         maxLength={maxLength}
//                         bg="white"
//                         pr={hasValue ? "6rem" : "2.5rem"}
//                         pl={leftIcon ? "2.5rem" : undefined}
//                         {...inputProps}
//                     />

//                     <InputElement width={hasValue ? "6rem" : "2.5rem"}>
//                         <HStack>
//                             {hasValue && onClear && (
//                                 <Tooltip label="Clear" hasArrow>
//                                     <span>
//                                         <IconButton
//                                             aria-label="Clear"
//                                             size="xs"
//                                             variant="ghost"
//                                             colorScheme="red"
//                                             onClick={handleClear}
//                                             disabled={isDisabled}
//                                         >
//                                             <IoClose />
//                                         </IconButton>
//                                     </span>
//                                 </Tooltip>
//                             )}

//                             <Tooltip label={`Search (${shortcutKey})`} hasArrow >
//                                 <span>
//                                     <IconButton
//                                         aria-label="Search"
//                                         size="xs"
//                                         colorScheme="blue"
//                                         variant="ghost"
//                                         onClick={openModal}
//                                         disabled={isDisabled}
//                                     >
//                                         {isLoading ? <Spinner size="xs" /> : <IoSearch />}
//                                     </IconButton>
//                                 </span>
//                             </Tooltip>
//                         </HStack>
//                     </InputElement>
//                 </InputGroup>

//                 {error && (
//                     <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>
//                 )}

//                 {showShortcut && !isDisabled && (
//                     <HStack mt={1} fontSize="xs" color="gray.500">
//                         <Kbd>{shortcutKey}</Kbd>
//                         <Text>to open selector</Text>
//                         {onSearch && (
//                             <>
//                                 <Kbd ml={2}>Enter</Kbd>
//                                 <Text>to search</Text>
//                             </>
//                         )}
//                     </HStack>
//                 )}
//             </FormControl>

//             <SelectionModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 items={modalItems}
//                 onSelect={handleSelect}
//                 title={modalTitle}
//                 searchPlaceholder={modalSearchPlaceholder}
//                 searchKeys={searchKeys}
//                 columns={columns}
//                 renderItem={renderItem}
//                 idKey={idKey}
//                 nameKey={nameKey}
//                 codeKey={codeKey}
//                 showCode={showCode}
//             />
//         </>
//     );
// });

// InputSelection.displayName = "InputSelection";
// component/dialog/DeleteDialog.tsx
import React from "react";
import {
    Dialog,
    Button,
    Portal,
} from "@chakra-ui/react";

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const DeleteDialog = ({ isOpen, onClose, onConfirm, title, message }: DeleteDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>{message}</p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorPalette="red" onClick={onConfirm}>
                                Delete
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
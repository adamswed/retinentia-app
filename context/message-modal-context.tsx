'use client';
import { MessageModalMode } from '@/models/message-modal.model';
import { createContext, useContext, useState } from 'react';
type MessageModalContextType = {
  isOpen: boolean;
  message: string | null;
  openModal: (
    msg: string,
    mode?: string,
    confirmCallback?: () => void,
    cancelCallback?: () => void
  ) => void;
  closeModal: () => void;
};
const modalContext = createContext<MessageModalContextType | null>(null);

/**
 * MessageModalProvider component
 *
 * Provides context for displaying modal messages, including error and confirmation dialogs.
 * Manages modal open/close state, message, mode, and confirmation callbacks.
 *
 * @param children - React children components.
 */
export const MessageModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<string>(MessageModalMode.Error);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [onCancel, setOnCancel] = useState<(() => void) | null>(null);

  /**
   * Opens the modal with a message, mode, and optional confirmation callback.
   *
   * @param msg - The message to display in the modal.
   * @param mode - The modal mode (error, delete, etc.).
   * @param confirmCallback - Optional callback for confirmation actions.
   * @param cancelCallback - Optional callback for cancel actions.
   */
  const openModal = (
    msg: string,
    mode: string = MessageModalMode.Error,
    confirmCallback?: () => void,
    cancelCallback?: () => void
  ) => {
    setMessage(msg);
    setIsOpen(true);
    setModalMode(mode);
    if (confirmCallback) setOnConfirm(() => confirmCallback);
    if (cancelCallback) setOnCancel(() => cancelCallback);
  };

  /**
   * Closes the modal and resets message and confirmation state.
   */
  const closeModal = () => {
    setIsOpen(false);
    setMessage(null);
    setOnConfirm(null);
    setOnCancel(null);
  };

  return (
    <modalContext.Provider value={{ isOpen, message, openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className='modal-overlay'>
          <div className='modal'>
            <div className='modal-content'>
              <p>{message}</p>
            </div>
            <div className='modal-actions'>
              {modalMode === MessageModalMode.Error && (
                <button onClick={closeModal}>Ok</button>
              )}
              {(modalMode === MessageModalMode.DeleteCard ||
                modalMode === MessageModalMode.DeleteUser) && (
                <>
                  <button
                    onClick={() => {
                      if (onCancel) {
                        onCancel();
                      }
                      closeModal();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className='delete-button'
                    onClick={() => {
                      if (onConfirm) {
                        onConfirm();
                      }
                      closeModal();
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </modalContext.Provider>
  );
};

/**
 * Custom hook to access message modal context.
 *
 * @returns The message modal context value.
 */
export const useMessageModal = () => useContext(modalContext);

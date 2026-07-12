import Swal, { SweetAlertResult } from "sweetalert2";

interface ConfirmOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const confirmAction = async ({
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  confirmButtonText = "Yes, do it!",
  cancelButtonText = "Cancel",
}: ConfirmOptions = {}): Promise<SweetAlertResult> => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d4af37", // Gold theme
    cancelButtonColor: "#ef4444", // Red theme
    confirmButtonText,
    cancelButtonText,
    background: "#1a1a1a",
    color: "#ffffff",
  });
};

export const confirmDelete = async (
  text: string = "You won't be able to revert this deleted item!"
): Promise<SweetAlertResult> => {
  return confirmAction({
    title: "Are you sure?",
    text,
    confirmButtonText: "Yes, delete it!",
  });
};

export const showSuccessAlert = (
  title: string = "Success!",
  text: string = "Action completed successfully."
) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    background: "#1a1a1a",
    color: "#ffffff",
  });
};

export const showErrorAlert = (
  title: string = "Error!",
  text: string = "Something went wrong."
) => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    background: "#1a1a1a",
    color: "#ffffff",
  });
};

import Swal from "sweetalert2";

const CONFIRM_COLOR = "#4f46e5";

export const showSuccessDialog = (message, title = "Berhasil") =>
  Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: CONFIRM_COLOR,
  });

export const showErrorDialog = (message, title = "Gagal") =>
  Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: CONFIRM_COLOR,
  });

export const showWarningDialog = (message, title = "Perhatian") =>
  Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonColor: CONFIRM_COLOR,
  });

// Mengembalikan true jika pengguna menekan tombol konfirmasi
export const showConfirmDialog = async (message, title = "Konfirmasi") => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: CONFIRM_COLOR,
  });

  return result.isConfirmed;
};

// Contoh hasil: "28 Februari 2024 14.49"
export const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
const CONFIRM_COLOR = "#4f46e5";

// SweetAlert2 dimuat hanya saat dialog pertama kali dibutuhkan
const loadSwal = async () => {
  const { default: Swal } = await import("sweetalert2");
  return Swal;
};

export const showSuccessDialog = async (message, title = "Berhasil") => {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: CONFIRM_COLOR,
  });
};

export const showErrorDialog = async (message, title = "Gagal") => {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: CONFIRM_COLOR,
  });
};

export const showWarningDialog = async (message, title = "Perhatian") => {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonColor: CONFIRM_COLOR,
  });
};

// Mengembalikan true jika pengguna menekan tombol konfirmasi
export const showConfirmDialog = async (message, title = "Konfirmasi") => {
  const Swal = await loadSwal();
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
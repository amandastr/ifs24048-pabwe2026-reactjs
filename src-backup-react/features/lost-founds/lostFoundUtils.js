// Format: "29 September 2026 pukul 13.34"
export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export const isDone = (item) => Boolean(Number(item?.is_completed));

export const reporterOf = (item) => item?.user ?? item?.author ?? null;

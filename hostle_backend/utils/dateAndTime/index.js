import { format } from "date-fns";

export const getDay = (date = new Date(), type = "full") => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    console.error("getDay: Invalid date", date);
    return "";
  }

  return format(parsedDate, type === "short" ? "EEE" : "EEEE");
};

import { toast } from "sonner";
// import { FaFilePdf } from "react-icons/fa";
// import { IoDocumentText } from "react-icons/io5";
// import { TbFileTypeDocx } from "react-icons/tb";
// import { duration } from "moment";

export const toastMessage = (
  message,
  type = "success",
  id = null
  // duration = constant.TOAST_DURATION
) => {
  // console.log(duration,"Duration");
  // console.log("success toasted:--->", message);

  const toastFunction =
    {
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    }[type] || toast.success;

  // Call the toast function with message and id parameters
  if (message && message?.length) {
    toastFunction(message, { id });
  }
};

export const failedMessage = () => {
  return toastMessage(
    "Failed to fetch data or invalid response structure.",
    "error",
    "failed"
  );
};

// const previewDocIcon = (type) => {
//   const docLogo = {
//     pdf: <FaFilePdf className="pdf_icon"/>,
//     doc: <IoDocumentText />,
//     docx: <TbFileTypeDocx />,
//   }[type] || <FaFilePdf />;

//   return docLogo;
// };

// // Get file extension
// export const getFileExtension = (fileName) => {
//   if (fileName) {
//     return previewDocIcon(fileName.split(".").at(-1)) || ""; // Using .at(-1) to get the last element (file extension)
//   } else return null;
// };

// export const handleMediaDownload = (url) => {
//   window.open(url);
// };

// export const showImageHandler = (src) => {
//   if (src) {
//     const extension = src.split(".").at(-1) || "";
//     if (extension === "png" || extension === "jpg" || extension === "jpeg") {
//       return <img src={src} className="cstm_style_img" />;
//     } else {
//       return getFileExtension(src);
//     }
//   }
// };

"use client";

import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { FiUploadCloud, FiX, FiFile, FiLoader } from "react-icons/fi";
import { toastMessage } from "@/utils/toastMessage";
import { logger } from "@/utils/logger";
import "./RHFImgUpload.scss";

// Best-effort image detection from a URL (for hydrated/edit values).
const isImageUrl = (url = "") =>
  /\.(jpe?g|png|webp|gif|bmp|svg)(\?|#|$)/i.test(url);

const fileNameFromUrl = (url = "") => {
  try {
    return decodeURIComponent(url.split("?")[0].split("/").pop()) || "Uploaded";
  } catch {
    return "Uploaded";
  }
};

/**
 * RHFDocUploadLive — a SINGLE-file "upload on select" field for
 * react-hook-form + zod. Independent from RHFImgUploadLive (which is wired to a
 * different upload service); this one takes the upload function as a prop so it
 * stays generic.
 *
 * Behaviour:
 *  - The instant a file is picked it is uploaded via `uploadFn(file)`.
 *  - A local preview + spinner show while the upload is in flight.
 *  - On success the returned hosted URL is stored in the RHF field (a string).
 *  - If the field already holds a URL (edit mode), it hydrates and shows it.
 *
 * Required props:
 *  - name, control
 *  - uploadFn: (file: File) => Promise<{ url: string }>   (throw on failure)
 *
 * Optional: accept, title, subtitle, disabled, className.
 */
const LiveDocField = ({
  field,
  error,
  uploadFn,
  accept,
  title,
  subtitle,
  disabled,
  className,
}) => {
  // item: { name, localUrl, url, status: "uploading" | "done" } | null
  const [item, setItem] = useState(null);
  const localUrlRef = useRef(null);
  const hydratedRef = useRef(false);

  // Hydrate from an existing URL (edit mode) once on mount.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (typeof field.value === "string" && field.value) {
      setItem({
        name: fileNameFromUrl(field.value),
        localUrl: null,
        url: field.value,
        status: "done",
        isImage: isImageUrl(field.value),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke the object URL we created for the local preview on unmount.
  useEffect(
    () => () => {
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    },
    [],
  );

  const inputId = `rhf-doc-upload-${field.name}`;
  const uploading = item?.status === "uploading";

  const handleChange = async (e) => {
    const file = Array.from(e.target.files || [])[0];
    e.target.value = ""; // allow re-picking the same file
    if (!(file instanceof File)) return;

    const isImage = file.type?.startsWith("image/");
    const localUrl = isImage ? URL.createObjectURL(file) : null;
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = localUrl;

    setItem({ name: file.name, localUrl, url: null, status: "uploading", isImage });
    field.onChange(undefined); // invalid until the upload resolves

    try {
      const res = await uploadFn(file);
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error("Upload did not return a URL");
      setItem({ name: file.name, localUrl, url, status: "done", isImage });
      field.onChange(url);
    } catch (err) {
      logger.log("RHFDocUploadLive error:--->", err);
      toastMessage(err?.message || `Failed to upload ${file.name}`, "error");
      setItem(null);
      field.onChange(undefined);
    }
  };

  const remove = () => {
    if (localUrlRef.current) {
      URL.revokeObjectURL(localUrlRef.current);
      localUrlRef.current = null;
    }
    setItem(null);
    field.onChange(undefined);
  };

  const thumbSrc = item?.localUrl || item?.url || null;
  const openUrl = item?.url || item?.localUrl || null; // hosted URL preferred
  const showImage = item?.isImage && thumbSrc;

  const Thumb = () =>
    showImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="rhf_preview_thumb" src={thumbSrc} alt={item.name} />
    ) : (
      <div className="rhf_preview_thumb rhf_preview_file">
        <FiFile />
      </div>
    );

  return (
    <div className="rhf_img_upload">
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled || uploading}
        style={{ display: "none" }}
        onChange={handleChange}
        onBlur={field.onBlur}
      />

      <label
        htmlFor={inputId}
        className={`rhf_dropzone ${error ? "has_error" : ""} ${
          disabled || uploading ? "disabled" : ""
        } ${className}`}
      >
        <div className="rhf_upload_inner">
          <div className="rhf_upload_icon_circle">
            <FiUploadCloud className="rhf_upload_icon" />
          </div>
          <span className="rhf_upload_title">{title}</span>
          <span className="rhf_upload_sub">
            {uploading ? "Uploading…" : subtitle}
          </span>
        </div>
      </label>

      {item && (
        <ul className="rhf_previews">
          <li className="rhf_preview_item">
            {/* Clickable once uploaded → opens the file in a new tab. */}
            {openUrl && item.status === "done" ? (
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open uploaded file in a new tab"
                style={{ display: "block", position: "relative" }}
              >
                <Thumb />
              </a>
            ) : (
              <Thumb />
            )}

            {item.status === "uploading" && (
              <span
                className="rhf_preview_uploading"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: "inherit",
                }}
              >
                <FiLoader className="rhf_spin" />
              </span>
            )}

            {item.status === "done" && (
              <button
                type="button"
                className="rhf_preview_remove"
                onClick={remove}
                aria-label={`Remove ${item.name}`}
              >
                <FiX />
              </button>
            )}

            {openUrl && item.status === "done" ? (
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rhf_preview_name"
                style={{ textDecoration: "underline", cursor: "pointer" }}
                title="Open uploaded file in a new tab"
              >
                {item.name}
              </a>
            ) : (
              <span className="rhf_preview_name">{item.name}</span>
            )}
          </li>
        </ul>
      )}

      {error?.message && (
        <div className="rhf_upload_error">
          <p>{error.message}</p>
        </div>
      )}
    </div>
  );
};

const RHFDocUploadLive = ({
  name,
  control,
  uploadFn,
  accept = "image/*,.pdf",
  title = "Upload File",
  subtitle = "images, JPG or .PNG",
  disabled = false,
  className = "",
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <LiveDocField
          field={field}
          error={error}
          uploadFn={uploadFn}
          accept={accept}
          title={title}
          subtitle={subtitle}
          disabled={disabled}
          className={className}
        />
      )}
    />
  );
};

export default RHFDocUploadLive;

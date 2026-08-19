"use client";

import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { FiUploadCloud, FiX, FiFile, FiLoader } from "react-icons/fi";
import { toastMessage } from "@/utils/toastMessage";
import { logger } from "@/utils/logger";
import "./RHFImgUpload.scss";

/**
 * Cloudinary image upload component integrated with react-hook-form.
 * This uploads EACH picked file immediately to Cloudinary and stores the returned
 * `secure_url` in the form state as an array of objects: `[{ url: "..." }]`.
 */
const LiveFileUploadField = ({
  field,
  error,
  multiple,
  accept,
  title,
  subtitle,
  maxFiles,
  disabled,
  className,
  cloudName,
  uploadPreset,
}) => {
  // Local source of truth for what's shown. Each item:
  //   { id, name, isImage, localUrl, url, status: "uploading" | "done" }
  // Only the successfully uploaded URLs are pushed back into the RHF field.
  const [items, setItems] = useState(() => {
    // Initialize from field value if exists (for edit mode)
    const initialValue = field.value || [];
    const valArray = Array.isArray(initialValue) ? initialValue : [initialValue];
    
    return valArray.filter(Boolean).map((v, i) => ({
      id: `initial-${i}`,
      name: `Image ${i + 1}`,
      isImage: true,
      localUrl: v.url,
      url: v.url,
      status: "done",
    }));
  });
  
  const localUrlsRef = useRef([]);

  // Mirror the done URLs into the form field whenever items change.
  useEffect(() => {
    const urls = items
      .filter((it) => it.status === "done" && it.url)
      .map((it) => ({ url: it.url }));
      
    // field.onChange expects array of {url} objects
    field.onChange(multiple ? urls : urls[0] ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, multiple]);

  // Revoke any object URLs we created for image previews on unmount.
  useEffect(
    () => () => localUrlsRef.current.forEach((u) => u && URL.revokeObjectURL(u)),
    [],
  );

  const inputId = `rhf-cloudinary-upload-${field.name}`;
  const uploadingCount = items.filter((it) => it.status === "uploading").length;
  const limitReached = multiple && maxFiles ? items.length >= maxFiles : false;

  const handleChange = async (e) => {
    const picked = Array.from(e.target.files || []).filter(
      (f) => f instanceof File,
    );
    // allow re-picking the same file
    e.target.value = "";
    if (!picked.length) return;

    // Respect single-select and the maxFiles cap.
    let allowed = picked;
    if (!multiple) {
      allowed = picked.slice(0, 1);
    } else if (maxFiles) {
      const remaining = maxFiles - items.length;
      if (remaining <= 0) return;
      allowed = picked.slice(0, remaining);
    }

    // Build placeholder items shown while their upload is in flight.
    const placeholders = allowed.map((file, i) => {
      const isImage = file?.type?.startsWith("image/");
      const localUrl = isImage ? URL.createObjectURL(file) : null;
      if (localUrl) localUrlsRef.current.push(localUrl);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${i}`,
        name: file.name,
        isImage,
        localUrl,
        url: null,
        status: "uploading",
      };
    });

    setItems((prev) => (multiple ? [...prev, ...placeholders] : placeholders));

    // Fan out: one Cloudinary upload call per file
    await Promise.all(
      placeholders.map(async (ph, idx) => {
        try {
          const file = allowed[idx];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);
          formData.append("cloud_name", cloudName);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          
          if (!res.ok) {
            throw new Error(`Upload failed with status ${res.status}`);
          }

          const data = await res.json();
          const url = data?.secure_url;
          
          if (!url) throw new Error("Upload did not return a URL");
          
          setItems((prev) =>
            prev.map((it) =>
              it.id === ph.id ? { ...it, status: "done", url } : it,
            ),
          );
        } catch (err) {
          if (logger) logger.log("Cloudinary upload error:--->", err);
          else console.error("Cloudinary upload error:--->", err);
          
          if (toastMessage) toastMessage(
            err?.message || `Failed to upload ${ph.name}`,
            "error",
          );
          // Drop the failed placeholder so it doesn't linger as "uploading".
          setItems((prev) => prev.filter((it) => it.id !== ph.id));
        }
      }),
    );
  };

  const removeAt = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="rhf_img_upload">
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || limitReached}
        style={{ display: "none" }}
        onChange={handleChange}
        onBlur={field.onBlur}
      />

      <label
        htmlFor={inputId}
        className={`rhf_dropzone ${error ? "has_error" : ""} ${
          disabled || limitReached ? "disabled" : ""
        } ${className}`}
      >
        <div className="rhf_upload_inner">
          <div className="rhf_upload_icon_circle">
            <FiUploadCloud className="rhf_upload_icon" />
          </div>
          <span className="rhf_upload_title">{title}</span>
          <span className="rhf_upload_sub">
            {limitReached
              ? `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} reached`
              : subtitle}
          </span>
          {multiple && maxFiles ? (
            <span className="rhf_upload_count">
              {items.length} / {maxFiles} selected
              {uploadingCount ? ` · uploading ${uploadingCount}…` : ""}
            </span>
          ) : null}
        </div>
      </label>

      {/* Previews live BELOW the dropzone border */}
      {items.length > 0 && (
        <ul className="rhf_previews">
          {items.map((it) => {
            const thumbSrc = it.localUrl || (it.isImage ? it.url : null);
            return (
              <li key={it.id} className="rhf_preview_item">
                {thumbSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="rhf_preview_thumb"
                    src={thumbSrc}
                    alt={it.name}
                  />
                ) : (
                  <div className="rhf_preview_thumb rhf_preview_file">
                    <FiFile />
                  </div>
                )}

                {it.status === "uploading" && (
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

                {it.status === "done" && (
                  <button
                    type="button"
                    className="rhf_preview_remove"
                    onClick={() => removeAt(it.id)}
                    aria-label={`Remove ${it.name}`}
                  >
                    <FiX />
                  </button>
                )}

                <span className="rhf_preview_name">{it.name}</span>
              </li>
            );
          })}
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

const RHFCloudinaryUpload = ({
  name,
  control,
  multiple = true,
  accept = "image/*",
  title = "Upload Image",
  subtitle = "JPG or PNG",
  maxFiles = 5,
  disabled = false,
  className = "",
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "nqgb7edi",
  uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hostle_preset",
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <LiveFileUploadField
          field={field}
          error={error}
          multiple={multiple}
          accept={accept}
          title={title}
          subtitle={subtitle}
          maxFiles={maxFiles}
          disabled={disabled}
          className={className}
          cloudName={cloudName}
          uploadPreset={uploadPreset}
        />
      )}
    />
  );
};

export default RHFCloudinaryUpload;

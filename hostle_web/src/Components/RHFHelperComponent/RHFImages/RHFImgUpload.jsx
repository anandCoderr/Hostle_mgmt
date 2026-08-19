"use client";

import { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { FiUploadCloud, FiX, FiFile } from "react-icons/fi";
import "./RHFImgUpload.scss";

/**
 * Reusable, self-contained file/image upload for react-hook-form + zod.
 * Styles live in the co-located RHFImgUpload.scss so the whole thing can be
 * copy-pasted into any project and used as-is.
 *
 * Required props:
 *  - name     : field name registered in the form
 *  - control  : `control` returned from useForm()
 *
 * Optional props:
 *  - multiple : true  -> multi-select; field value is an array of File
 *               false -> single-select; field value is a single File (default)
 *  - accept   : input accept attribute (default: image/*,.pdf)
 *  - title    : dropzone CTA title
 *  - subtitle : dropzone CTA subtitle
 *  - maxFiles : cap on selected files when `multiple` (default: 5)
 *  - disabled : disable file selection
 *  - className: extra class on the dropzone
 *
 * Selected files are previewed (image thumbnails) BELOW the dropzone, each with
 * a cross button to remove it, plus a live "x / max selected" counter.
 *
 * Pair with a zod field that is either `imageSchema`/`multipleImagesSchema`
 * (required) or `.optional()` (e.g. the health-reports field on the intake
 * form) from src/common/validations/_commonSchema.js.
 */
const FileUploadField = ({
  field,
  error,
  multiple,
  accept,
  title,
  subtitle,
  maxFiles,
  disabled,
  className,
}) => {
  // Normalise the field value into an array we can render either way.
  const files = useMemo(() => {
    if (multiple) return Array.isArray(field.value) ? field.value : [];
    return field.value instanceof File ? [field.value] : [];
  }, [field.value, multiple]);

  // Build (and clean up) object URLs for image previews.
  const previews = useMemo(
    () =>
      files.map((file) => {
        const isImage = file?.type?.startsWith("image/");
        return {
          file,
          isImage,
          url: isImage ? URL.createObjectURL(file) : null,
        };
      }),
    [files],
  );

  useEffect(
    () => () => previews.forEach((p) => p.url && URL.revokeObjectURL(p.url)),
    [previews],
  );

  const inputId = `rhf-img-upload-${field.name}`;
  const limitReached = multiple && maxFiles ? files.length >= maxFiles : false;

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []).filter(
      (f) => f instanceof File,
    );
    if (!picked.length) return;

    if (multiple) {
      const existing = Array.isArray(field.value) ? field.value : [];
      let next = [...existing, ...picked];
      if (maxFiles) next = next.slice(0, maxFiles);
      field.onChange(next);
    } else {
      field.onChange(picked[0]);
    }
    // allow re-picking the same file
    e.target.value = "";
  };

  const removeAt = (idx) => {
    if (multiple) {
      field.onChange(files.filter((_, i) => i !== idx));
    } else {
      field.onChange(undefined);
    }
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
              {files.length} / {maxFiles} selected
            </span>
          ) : null}
        </div>
      </label>

      {/* Previews live BELOW the dropzone border */}
      {previews.length > 0 && (
        <ul className="rhf_previews">
          {previews.map((p, idx) => (
            <li key={`${p.file.name}-${idx}`} className="rhf_preview_item">
              {p.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="rhf_preview_thumb" src={p.url} alt={p.file.name} />
              ) : (
                <div className="rhf_preview_thumb rhf_preview_file">
                  <FiFile />
                </div>
              )}

              <button
                type="button"
                className="rhf_preview_remove"
                onClick={() => removeAt(idx)}
                aria-label={`Remove ${p.file.name}`}
              >
                <FiX />
              </button>

              <span className="rhf_preview_name">{p.file.name}</span>
            </li>
          ))}
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

const RHFImgUpload = ({
  name,
  control,
  multiple = false,
  accept = "image/*,.pdf",
  title = "Upload File",
  subtitle = "images, JPG or .PNG",
  maxFiles = 5,
  disabled = false,
  className = "",
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FileUploadField
          field={field}
          error={error}
          multiple={multiple}
          accept={accept}
          title={title}
          subtitle={subtitle}
          maxFiles={maxFiles}
          disabled={disabled}
          className={className}
        />
      )}
    />
  );
};

export default RHFImgUpload;

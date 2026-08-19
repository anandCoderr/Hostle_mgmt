"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { Modal } from "react-bootstrap";
import { Cropper } from "react-cropper";
import { FiUploadCloud, FiX, FiFile, FiCrop } from "react-icons/fi";
import { Button } from "@/component/form";
import "cropperjs/dist/cropper.css";
import "./RHFImgUpload.scss"; // shared dropzone + preview styles
import "./RHFImgUploadWithCropper.scss"; // cropper-modal additions

/**
 * RHFImgUploadWithCropper — same API/behaviour as RHFImgUpload, but every
 * selected image is run through a free-form cropper (react-cropper) in a modal
 * BEFORE it lands in the form. The field value is the cropped File(s), so the
 * usual multipart `formData.append(name, file)` keeps working unchanged.
 *
 * Required props:
 *  - name     : field name registered in the form
 *  - control  : `control` returned from useForm()
 *
 * Optional props (superset of RHFImgUpload):
 *  - multiple     : true -> field value is File[]; false -> single File (default)
 *  - accept       : input accept attribute
 *  - title        : dropzone CTA title
 *  - subtitle     : dropzone CTA subtitle
 *  - maxFiles     : cap when `multiple` (default 5)
 *  - disabled     : disable selection
 *  - className    : extra class on the dropzone
 *  - cropperHeight: cropper canvas height in px (default 400)
 *  - aspectRatio  : fix the crop ratio (default undefined -> free crop)
 *  - outputQuality: JPEG/WEBP quality for the cropped blob (default 0.92)
 *
 * When multiple files are picked, they're cropped one-by-one (a small "Image
 * X of N" indicator shows progress). Each committed preview also has a crop
 * button to re-crop it later.
 */
const FileUploadFieldWithCropper = ({
  field,
  error,
  multiple,
  accept,
  title,
  subtitle,
  maxFiles,
  disabled,
  className,
  cropperHeight,
  aspectRatio,
  outputQuality,
}) => {
  // Normalise the field value into an array we can render either way.
  const files = useMemo(() => {
    if (multiple) return Array.isArray(field.value) ? field.value : [];
    return field.value instanceof File ? [field.value] : [];
  }, [field.value, multiple]);

  // Object URLs for the committed preview thumbnails.
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

  // ---- cropper state ----------------------------------------------------
  // queue       : raw Files from the latest pick still waiting to be cropped
  // batch       : cropped results accumulated for the current pick
  // activeSrc   : object URL of the image currently shown in the cropper
  // recropIndex : when re-cropping an already-committed file, its index (else null)
  const [queue, setQueue] = useState([]);
  const [batch, setBatch] = useState([]);
  const [activeSrc, setActiveSrc] = useState("");
  const [recropIndex, setRecropIndex] = useState(null);
  const cropperRef = useRef(null);
  const stageRef = useRef(null);

  const isRecrop = recropIndex != null;
  const activeFile = isRecrop ? files[recropIndex] : queue[0];
  const showModal = Boolean(activeSrc && activeFile);

  // Revoke the active object URL whenever it changes / unmounts.
  useEffect(
    () => () => {
      if (activeSrc) URL.revokeObjectURL(activeSrc);
    },
    [activeSrc],
  );

  // ---- cap the cropper height at `cropperHeight`, shrinking for short images.
  // We size the cropper to min(cropperHeight, stageWidth / imageAspectRatio):
  // a wide/short image fits in less than the max; a tall image is capped at it.
  const [imgRatio, setImgRatio] = useState(null); // naturalWidth / naturalHeight
  const [stageWidth, setStageWidth] = useState(0);

  useEffect(() => {
    if (!activeSrc) return;
    let alive = true;
    const probe = new window.Image();
    probe.onload = () => {
      if (alive && probe.naturalHeight) {
        setImgRatio(probe.naturalWidth / probe.naturalHeight);
      }
    };
    probe.src = activeSrc;
    return () => {
      alive = false;
    };
  }, [activeSrc]);

  useEffect(() => {
    if (!showModal) return;
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setStageWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [showModal]);

  const cropHeight =
    imgRatio && stageWidth
      ? Math.min(cropperHeight, Math.round(stageWidth / imgRatio))
      : cropperHeight;

  const inputId = `rhf-img-cropper-${field.name}`;
  const limitReached = multiple && maxFiles ? files.length >= maxFiles : false;

  const swapActive = (file) => {
    setActiveSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : "";
    });
  };

  const closeCropper = () => {
    swapActive(null);
    setQueue([]);
    setBatch([]);
    setRecropIndex(null);
  };

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []).filter(
      (f) => f instanceof File,
    );
    e.target.value = ""; // allow re-picking the same file
    if (!picked.length) return;

    // Only queue what we still have room for.
    let allowed;
    if (multiple) {
      const room = maxFiles ? Math.max(0, maxFiles - files.length) : picked.length;
      allowed = picked.slice(0, room);
    } else {
      allowed = picked.slice(0, 1);
    }
    if (!allowed.length) return;

    setRecropIndex(null);
    setBatch([]);
    setQueue(allowed);
    swapActive(allowed[0]);
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    const file = activeFile;
    if (!cropper || !file) return;

    const canvas = cropper.getCroppedCanvas();
    if (!canvas) return;

    const type = file.type || "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const cropped = new File([blob], file.name, {
          type,
          lastModified: Date.now(),
        });

        if (isRecrop) {
          // Replace the single committed file in place.
          const next = files.slice();
          next[recropIndex] = cropped;
          field.onChange(multiple ? next : cropped);
          closeCropper();
          return;
        }

        const nextBatch = [...batch, cropped];
        const rest = queue.slice(1);

        if (rest.length) {
          // More images in this pick — advance to the next one.
          setBatch(nextBatch);
          setQueue(rest);
          swapActive(rest[0]);
          return;
        }

        // Last image of the batch — commit everything to the field.
        if (multiple) {
          const existing = Array.isArray(field.value) ? field.value : [];
          let merged = [...existing, ...nextBatch];
          if (maxFiles) merged = merged.slice(0, maxFiles);
          field.onChange(merged);
        } else {
          field.onChange(nextBatch[0]);
        }
        closeCropper();
      },
      type,
      outputQuality,
    );
  };

  const recropAt = (idx) => {
    setQueue([]);
    setBatch([]);
    setRecropIndex(idx);
    swapActive(files[idx]);
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

      {/* Cropped previews live BELOW the dropzone border */}
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

              {p.isImage && (
                <button
                  type="button"
                  className="rhf_preview_crop"
                  onClick={() => recropAt(idx)}
                  aria-label={`Crop ${p.file.name}`}
                >
                  <FiCrop />
                </button>
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

      {/* Crop modal — one image at a time */}
      <Modal
        show={showModal}
        onHide={closeCropper}
        centered
        size="lg"
        backdrop="static"
        keyboard={false}
        className="rhf_cropper_modal"
      >
        <Modal.Body>
          <div className="rhf_cropper_header">
            <h2 className="rhf_cropper_title">Crop image</h2>
            {!isRecrop && queue.length > 1 ? (
              <span className="rhf_cropper_progress">
                Image {batch.length + 1} of {batch.length + queue.length}
              </span>
            ) : null}
          </div>

          <div className="rhf_cropper_stage" ref={stageRef}>
            {showModal && (
              <Cropper
                ref={cropperRef}
                src={activeSrc}
                style={{ height: cropHeight, width: "100%" }}
                // viewMode 0 + dragMode "crop" = fully free crop: draw/move/
                // resize the crop box anywhere, no aspect-ratio lock.
                viewMode={0}
                dragMode="crop"
                aspectRatio={aspectRatio ?? NaN}
                autoCropArea={1}
                guides
                background={false}
                responsive
                restore
                checkOrientation={false}
                toggleDragModeOnDblclick={false}
                cropBoxMovable
                cropBoxResizable
                zoomable
                scalable
                movable
              />
            )}
          </div>

          <div className="rhf_cropper_actions">
            <Button
              type="button"
              className="btn_outline"
              onClick={closeCropper}
            >
              Cancel
            </Button>
            <Button type="button" className="btn_one" onClick={handleCrop}>
              {!isRecrop && queue.length > 1 ? "Crop & Next" : "Crop & Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const RHFImgUploadWithCropper = ({
  name,
  control,
  multiple = false,
  accept = "image/*",
  title = "Upload Image",
  subtitle = "JPG / PNG / WEBP",
  maxFiles = 5,
  disabled = false,
  className = "",
  cropperHeight = 400,
  aspectRatio = undefined,
  outputQuality = 0.92,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FileUploadFieldWithCropper
          field={field}
          error={error}
          multiple={multiple}
          accept={accept}
          title={title}
          subtitle={subtitle}
          maxFiles={maxFiles}
          disabled={disabled}
          className={className}
          cropperHeight={cropperHeight}
          aspectRatio={aspectRatio}
          outputQuality={outputQuality}
        />
      )}
    />
  );
};

export default RHFImgUploadWithCropper;

"use client";

import { ImageUp, LoaderCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  disabled?: boolean;
  fileName?: string | null;
  isUploading?: boolean;
  onFileAccepted: (file: File) => void;
};

export function UploadDropzone(props: UploadDropzoneProps) {
  const dropzone = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    disabled: props.disabled || props.isUploading,
    maxFiles: 1,
    onDropAccepted(files) {
      const file = files[0];
      if (file) {
        props.onFileAccepted(file);
      }
    },
  });

  return (
    <div
      {...dropzone.getRootProps()}
      className={cn(
        "group relative rounded-[28px] border border-dashed border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,239,0.96))] p-6 transition",
        dropzone.isDragActive && "border-gold-500 bg-gold-300/10",
        (props.disabled || props.isUploading) && "cursor-not-allowed opacity-80",
        !props.disabled && !props.isUploading && "cursor-pointer hover:border-gold-500/70 hover:shadow-panel",
      )}
    >
      <input {...dropzone.getInputProps()} />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-300/20 text-gold-600">
            {props.isUploading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <ImageUp className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-base font-semibold text-ink">Загрузите изображение</div>
            <p className="mt-1 max-w-xs text-sm leading-6 text-black/55">
              JPG, PNG или WEBP. Файл сразу сохраняется как оригинал в постоянное хранилище.
            </p>
          </div>
        </div>
        <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-black/35">
          max 15mb
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-black/6 bg-white/80 px-4 py-3 text-sm text-black/60">
        {props.fileName ? (
          <span className="font-medium text-ink">{props.fileName}</span>
        ) : (
          "Перетащите файл сюда или нажмите, чтобы выбрать изображение."
        )}
      </div>
    </div>
  );
}

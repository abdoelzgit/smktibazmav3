"use client";

import {
  ImageCropper as ArkImageCropper,
  useImageCropper as useArkImageCropper,
  useImageCropperContext as useArkImageCropperContext,
} from "@ark-ui/react/image-cropper";
import type React from "react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const useImageCropper = useArkImageCropper;
export const useImageCropperContext = useArkImageCropperContext;
export const ImageCropperContext = ArkImageCropper.Context;

// The frame's proportions, `--cropper-aspect`, are the photo's own, set once
// it has loaded (16 / 9 if it fails to). A class that sets the ratio or the
// height wins over them.
const imageCropperRootClassName = cn(
  "[--cropper-accent:var(--color-white)] [--cropper-handler-size:--spacing(2)] [--cropper-handler-width:--spacing(1)]",
  "relative",
  "w-full",
  "aspect-(--cropper-aspect)"
);

const ImageCropperFrame = (props: { children?: React.ReactNode }) => {
  const { children } = props;
  const viewportRef = useRef<HTMLDivElement>(null);

  // zag draws the photo to fill the frame and maps each axis back to the file
  // on its own, so a frame of other proportions stretches the photo and the
  // export. The frame takes the photo's proportions in the capture phase of
  // its load, before the cropper's own handler measures it for the first
  // crop. Until then the frame has no height: zag starts no crop in a frame
  // it can't see, so it has none to rescale when the frame changes.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const root = viewport?.parentElement;
    if (!(viewport && root)) {
      return;
    }
    const fit = (target: EventTarget | null) => {
      if (
        !(
          target instanceof HTMLImageElement &&
          target.matches('[data-scope="image-cropper"][data-part="image"]') &&
          target.complete
        )
      ) {
        return;
      }
      if (target.naturalWidth > 0 && target.naturalHeight > 0) {
        root.style.setProperty(
          "--cropper-aspect",
          `${target.naturalWidth} / ${target.naturalHeight}`
        );
      } else if (
        target.currentSrc &&
        !root.style.getPropertyValue("--cropper-aspect")
      ) {
        root.style.setProperty("--cropper-aspect", "16 / 9");
      }
    };
    const onLoadOrError = (event: Event) => fit(event.target);
    // A photo that loaded before hydration fires no load event.
    fit(
      viewport.querySelector('[data-scope="image-cropper"][data-part="image"]')
    );
    viewport.addEventListener("load", onLoadOrError, true);
    viewport.addEventListener("error", onLoadOrError, true);
    return () => {
      viewport.removeEventListener("load", onLoadOrError, true);
      viewport.removeEventListener("error", onLoadOrError, true);
    };
  }, []);

  return (
    <ArkImageCropper.Viewport
      className={cn("size-full", "overflow-hidden")}
      data-slot="image-cropper-viewport"
      ref={viewportRef}
    >
      {children}
    </ArkImageCropper.Viewport>
  );
};

type ImageCropperProps = React.ComponentProps<typeof ArkImageCropper.Root>

export const ImageCropper = (props: ImageCropperProps) => {
  const { className, children, ...rest } = props;

  return (
    <ArkImageCropper.Root
      className={cn(imageCropperRootClassName, className)}
      data-slot="image-cropper"
      {...rest}
    >
      <ImageCropperFrame>{children}</ImageCropperFrame>
    </ArkImageCropper.Root>
  );
};

/**
 * The cropper on a machine from `useImageCropper`, for code outside the
 * cropper that reads its API, such as `getCroppedImage` on a Save button.
 */
export const ImageCropperRootProvider = (
  props: React.ComponentProps<typeof ArkImageCropper.RootProvider>
) => {
  const { className, children, ...rest } = props;

  return (
    <ArkImageCropper.RootProvider
      className={cn(imageCropperRootClassName, className)}
      data-slot="image-cropper"
      {...rest}
    >
      <ImageCropperFrame>{children}</ImageCropperFrame>
    </ArkImageCropper.RootProvider>
  );
};

export const ImageCropperImage = (
  props: React.ComponentProps<typeof ArkImageCropper.Image>
) => {
  const { className, ...rest } = props;

  return (
    <ArkImageCropper.Image
      className={cn(
        "absolute top-0 left-0",
        "size-full object-contain",
        "select-none",
        "backface-hidden",
        "pointer-events-none",
        "origin-center",
        className
      )}
      data-slot="image-cropper-image"
      {...rest}
    />
  );
};

interface ImageCropperSelectionProps
  extends React.ComponentProps<typeof ArkImageCropper.Selection> {
  /**
   * The axis of the grid to show.
   *
   * @default "both"
   */
  axis?: "horizontal" | "vertical" | "both";
}

export const ImageCropperSelection = (props: ImageCropperSelectionProps) => {
  const { axis = "both", className, children, ...rest } = props;

  return (
    <ArkImageCropper.Selection
      className={cn(
        "shadow-[0_0_0_9999px_rgb(0_0_0/0.5)]",
        "border-2 border-white/64",
        "backface-visibility-hidden",
        "cursor-move",
        "data-[shape=circle]:rounded-full",
        "outline-none focus-visible:border-(--cropper-accent) focus-visible:ring-(--cropper-accent)/50 focus-visible:ring-[3px]",
        "data-disabled:cursor-default",
        "data-dragging:cursor-grabbing data-dragging:border-white/84",
        className
      )}
      data-slot="image-cropper-selection"
      {...rest}
    >
      {children}

      {(axis === "horizontal" || axis === "both") && (
        <ImageCropperGrid axis="horizontal" />
      )}
      {(axis === "vertical" || axis === "both") && (
        <ImageCropperGrid axis="vertical" />
      )}

      <ImageCropperHandle position="n" />
      <ImageCropperHandle position="e" />
      <ImageCropperHandle position="s" />
      <ImageCropperHandle position="w" />
      <ImageCropperHandle position="ne" />
      <ImageCropperHandle position="se" />
      <ImageCropperHandle position="sw" />
      <ImageCropperHandle position="nw" />
    </ArkImageCropper.Selection>
  );
};

export const ImageCropperHandle = (
  props: React.ComponentProps<typeof ArkImageCropper.Handle>
) => {
  const { className, ...rest } = props;

  return (
    <ArkImageCropper.Handle
      className={cn(
        "absolute flex touch-none items-center justify-center",
        "h-[calc(var(--cropper-handler-size)+8px)] w-[calc(var(--cropper-handler-size)+8px)]",
        "data-disabled:hidden",
        "data-[position=ne]:cursor-nesw-resize data-[position=nw]:cursor-nwse-resize",
        "data-[position=se]:cursor-nwse-resize data-[position=sw]:cursor-nesw-resize",
        "data-[position=n]:cursor-ns-resize data-[position=s]:cursor-ns-resize",
        "data-[position=e]:cursor-ew-resize data-[position=w]:cursor-ew-resize",
        "border-(--cropper-accent)",
        "[&>span]:bg-(--cropper-accent) [&>span]:shadow-[0_1px_3px_rgb(0_0_0/0.3)]",
        "data-[position=nw]:hover:**:scale-110 [&[data-position=nw]_*]:size-(--cropper-handler-size) [&[data-position=nw]_*]:border-t-[length:(--cropper-handler-width)] [&[data-position=nw]_*]:border-l-[length:(--cropper-handler-width)] [&[data-position=nw]_*]:bg-(--cropper-accent)",
        "data-[position=ne]:hover:**:scale-110 [&[data-position=ne]_*]:size-(--cropper-handler-size) [&[data-position=ne]_*]:border-t-[length:(--cropper-handler-width)] [&[data-position=ne]_*]:border-r-[length:(--cropper-handler-width)] [&[data-position=ne]_*]:bg-(--cropper-accent)",
        "data-[position=se]:hover:**:scale-110 [&[data-position=se]_*]:size-(--cropper-handler-size) [&[data-position=se]_*]:border-r-[length:(--cropper-handler-width)] [&[data-position=se]_*]:border-b-[length:(--cropper-handler-width)] [&[data-position=se]_*]:bg-(--cropper-accent)",
        "data-[position=sw]:hover:**:scale-110 [&[data-position=sw]_*]:size-(--cropper-handler-size) [&[data-position=sw]_*]:border-b-[length:(--cropper-handler-width)] [&[data-position=sw]_*]:border-l-[length:(--cropper-handler-width)] [&[data-position=sw]_*]:bg-(--cropper-accent)",
        "[&[data-position=n]_*]: data-[position=n]:hover:**:opacity-100 [&[data-position=n]_*]:size-1.5 [&[data-position=n]_*]:opacity-0",
        "data-[position=s]:hover:**:opacity-100 [&[data-position=s]_*]:size-1.5 [&[data-position=s]_*]:bg-(--cropper-accent) [&[data-position=s]_*]:opacity-0",
        "data-[position=e]:hover:**:opacity-100 [&[data-position=e]_*]:size-1.5 [&[data-position=e]_*]:bg-(--cropper-accent) [&[data-position=e]_*]:opacity-0",
        "data-[position=w]:hover:**:opacity-100 [&[data-position=w]_*]:size-1.5 [&[data-position=w]_*]:bg-(--cropper-accent) [&[data-position=w]_*]:opacity-0",
        className
      )}
      data-slot="image-cropper-handle"
      {...rest}
    >
      <span aria-hidden className="block size-(--cropper-handler-size)" />
    </ArkImageCropper.Handle>
  );
};

export const ImageCropperGrid = (
  props: React.ComponentProps<typeof ArkImageCropper.Grid>
) => {
  const { className, ...rest } = props;

  return (
    <ArkImageCropper.Grid
      className={cn(
        "absolute",
        "opacity-0",
        "pointer-events-none",
        "transition-opacity duration-200",
        "data-[axis=horizontal]:inset-[33.33%_0] data-[axis=horizontal]:border-white/40 data-[axis=horizontal]:border-t data-[axis=horizontal]:border-b",
        "data-[axis=vertical]:inset-0_[33.33%] data-[axis=vertical]:border-white/40 data-[axis=vertical]:border-r data-[axis=vertical]:border-l",
        "data-dragging:opacity-100",
        "data-panning:opacity-100",
        "motion-reduce:transition-none!",
        className
      )}
      data-slot="image-cropper-grid"
      {...rest}
    />
  );
};

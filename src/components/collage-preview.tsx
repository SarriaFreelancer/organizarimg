
"use client";

import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn, drawImageCover, drawPlaceholder } from '@/lib/utils';

type LayoutOptions = 2 | 4 | 6;

interface CollagePreviewProps {
  images: HTMLImageElement[];
  layout: LayoutOptions;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export interface CollagePreviewHandles {
  getCanvasDataUrl: (pageIndex: number) => string | null;
}

export const CANVAS_WIDTH = 2042; 
export const CANVAS_HEIGHT = 1422; 

const drawPage = (
  ctx: CanvasRenderingContext2D,
  imagesForPage: HTMLImageElement[],
  layout: LayoutOptions,
  pageNumber: number,
  isLastPage: boolean
) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cols = layout === 2 ? 2 : (layout === 4 ? 2 : 3);
  const rows = layout === 2 ? 1 : 2;
  const gap = 12;
  const leftPad = 0;
  const topPad = 0;
  const rightPad = 0;
  const bottomPad = 0;

  const gridW = CANVAS_WIDTH - leftPad - rightPad;
  const gridH = CANVAS_HEIGHT - topPad - bottomPad;

  const cellW = Math.floor((gridW - gap * (cols - 1)) / cols);
  const cellH = Math.floor((gridH - gap * (rows - 1)) / rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= layout) continue;
      
      const imageIndexInAll = pageNumber * layout + i;
      const img = imagesForPage[i];
      
      if (isLastPage && !img) {
          continue;
      }

      const x = leftPad + c * (cellW + gap);
      const y = topPad + r * (cellH + gap);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

      const titleHeight = 32;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, cellW, titleHeight);
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, titleHeight - 1);
      ctx.fillStyle = '#111827';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Foto N°${imageIndexInAll + 1}`, x + 12, y + titleHeight / 2);

      const imgContainerY = y + titleHeight;
      const imgContainerH = cellH - titleHeight;

      if (img && img.complete && img.naturalWidth > 0) {
        drawImageCover(ctx, img, x, imgContainerY, cellW, imgContainerH);
      } else {
        drawPlaceholder(ctx, x, imgContainerY, cellW, imgContainerH, `Imagen ${imageIndexInAll + 1}`);
      }
    }
  }
};

const CollagePreview = forwardRef<CollagePreviewHandles, CollagePreviewProps>(
  ({ images, layout, currentPage, onPageChange }, ref) => {
    const totalPages = Math.max(1, Math.ceil(images.length / layout));
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const [api, setApi] = useState<CarouselApi>();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const pages = useMemo(() => {
      const pageData = [];
      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * layout;
        const endIndex = startIndex + layout;
        pageData.push(images.slice(startIndex, endIndex));
      }
      return pageData;
    }, [images, layout, totalPages]);

    useImperativeHandle(ref, () => ({
      getCanvasDataUrl: (pageIndex: number) => {
        const canvas = canvasRefs.current[pageIndex];
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const imagesForPage = pages[pageIndex] || [];
            const isLastPage = pageIndex === totalPages - 1;
            drawPage(ctx, imagesForPage, layout, pageIndex, isLastPage);
        }

        return canvas.toDataURL('image/png', 1.0);
      }
    }));

    useEffect(() => {
      if (!isClient) return;

      pages.forEach((imagesForPage, i) => {
        const canvas = canvasRefs.current[i];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const isLastPage = i === totalPages - 1;
            drawPage(ctx, imagesForPage, layout, i, isLastPage);
          }
        }
      });
    }, [pages, layout, images, isClient, totalPages]);

    useEffect(() => {
      if (!api) return;
      
      const handleSelect = () => onPageChange(api.selectedScrollSnap());
      const handleReinit = () => {
         if (api.selectedScrollSnap() !== currentPage) {
          api.scrollTo(currentPage, true);
         }
      }

      api.on("select", handleSelect);
      api.on("reInit", handleReinit);

      if (api.selectedScrollSnap() !== currentPage) {
        api.scrollTo(currentPage, true);
      }

      return () => {
        api.off("select", handleSelect);
        api.off("reInit", handleReinit);
      }
    }, [api, onPageChange, currentPage]);

    useEffect(() => {
      if (api && api.selectedScrollSnap() !== currentPage) {
        api.scrollTo(currentPage, true);
      }
    }, [currentPage, api]);

    const placeholder = (
        <Card className="w-full flex items-center justify-center bg-muted/50 border-dashed">
          <div className="text-center text-muted-foreground p-8">
              <h3 className="font-headline text-2xl mb-2">Sube fotos para empezar</h3>
              <p>Tu hermoso collage aparecerá aquí.</p>
          </div>
        </Card>
      );
    
    if (!isClient || images.length === 0) {
      return placeholder;
    }

    return (
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {pages.map((_, index) => (
            <CarouselItem key={index}>
              <Card className="shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <canvas
                    //ref={el => canvasRefs.current[index] = el}
                    ref={el => { canvasRefs.current[index] = el; }}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  }
);
CollagePreview.displayName = "CollagePreview";

export default CollagePreview;

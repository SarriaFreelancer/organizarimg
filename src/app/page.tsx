
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { AnimatePresence, motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Sparkles, Trash2, Download, Loader2, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
import Header from '@/components/header';
import CollagePreview, { type CollagePreviewHandles } from '@/components/collage-preview';
import * as docx from 'docx';

type LayoutOptions = 2 | 4 | 6;

function getLayoutRecommendation(photoCount: number): LayoutOptions {
    if (photoCount <= 3) return 2;
    if (photoCount <= 6) return 4;
    return 6;
}

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes.buffer;
}

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [layout, setLayout] = useState<LayoutOptions>(4);
  const [recommendedLayout, setRecommendedLayout] = useState<LayoutOptions | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const collagePreviewRef = useRef<CollagePreviewHandles>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast, dismiss } = useToast();

  const debouncedImageCount = useDebounce(images.length, 500);
  const isCreating = images.length > 0;
  const totalPages = Math.ceil(images.length / layout) || 1;

  useEffect(() => {
    if (images.length === 0) {
      setLoadedImages([]);
      return;
    }

    const imageElements: HTMLImageElement[] = [];
    const objectUrls: string[] = [];

    images.forEach(file => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      objectUrls.push(url);
      img.src = url;
      imageElements.push(img);
    });

    Promise.all(imageElements.map(img => new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    }))).then(() => {
      setLoadedImages(imageElements);
    });

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    if (debouncedImageCount > 0) {
        const recommendation = getLayoutRecommendation(debouncedImageCount);
        if (recommendation) {
            setRecommendedLayout(recommendation);
            if(recommendation !== layout) {
              setLayout(recommendation);
              toast({
                title: 'Diseño automático aplicado',
                description: `Hemos seleccionado el diseño de ${recommendation} fotos por página para ti.`
              });
            }
        }
    } else {
      setRecommendedLayout(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedImageCount, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
    }
    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (currentPage * layout >= images.length - 1) {
      setCurrentPage(Math.max(0, currentPage -1));
    }
  };

  const handleLoadSample = async () => {
    toast({ title: 'Cargando imágenes de ejemplo...', description: 'Por favor, espera un momento.' });
    const sampleImages = PlaceHolderImages.slice(0, 6);
    const filePromises = sampleImages.map(async (img) => {
      const response = await fetch(img.imageUrl);
      const blob = await response.blob();
      return new File([blob], `${img.id}.jpg`, { type: blob.type });
    });
    const files = await Promise.all(filePromises);
    setImages(files);
  };
  
  const resetApp = () => {
    setImages([]);
    setLoadedImages([]);
    setCurrentPage(0);
    setLayout(4);
    setRecommendedLayout(null);
  };

  const handleDownload = async () => {
    if (!collagePreviewRef.current || loadedImages.length === 0) return;
    setIsDownloading(true);
    const { id: toastId, update } = toast({
        title: 'Generando documento...',
        description: 'Preparando páginas...',
    });

    try {
        const sections: docx.ISectionOptions[] = [];
        
        const PAGE_WIDTH = 16838;
        const PAGE_HEIGHT = 11906;
        const MARGIN_TWIPS = 720;
        
        for (let i = 0; i < totalPages; i++) {
            update({
                id: toastId,
                title: 'Generando documento...',
                description: `Procesando página ${i + 1} de ${totalPages}...`,
            });
            const dataUrl = collagePreviewRef.current.getCanvasDataUrl(i);
            if (dataUrl) {
                const img = new window.Image();
                img.src = dataUrl;
                await new Promise((resolve) => (img.onload = resolve));
            
                const naturalWidth = img.width;
                const naturalHeight = img.height;
            
                const maxWidth = PAGE_WIDTH - MARGIN_TWIPS * 2;
                const maxHeight = PAGE_HEIGHT - MARGIN_TWIPS * 2;
            
                const widthRatio = maxWidth / naturalWidth;
                const heightRatio = maxHeight / naturalHeight;
                const scaleFactor = Math.min(widthRatio, heightRatio);
            
                const finalWidth = naturalWidth * scaleFactor;
                const finalHeight = naturalHeight * scaleFactor;
            
                const imageBuffer = dataUrlToArrayBuffer(dataUrl);

                const imageParagraph = new docx.Paragraph({
                    alignment: docx.AlignmentType.CENTER,
                    children: [
                        new docx.ImageRun({
                            data: imageBuffer,
                            transformation: {
                                width: finalWidth,
                                height: finalHeight,
                            },
                        }),
                    ],
                });

                const section: docx.ISectionOptions = {
                    properties: {
                        page: {
                            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
                            orientation: docx.PageOrientation.LANDSCAPE,
                            margin: { top: MARGIN_TWIPS, right: MARGIN_TWIPS, bottom: MARGIN_TWIPS, left: MARGIN_TWIPS },
                        },
                    },
                    footers: {
                        default: new docx.Footer({
                            children: [
                                new docx.Paragraph({
                                    alignment: docx.AlignmentType.RIGHT,
                                    children: [
                                        new docx.TextRun({
                                            children: ["Página ", docx.PageNumber.CURRENT, " de ", docx.PageNumber.TOTAL_PAGES],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    children: [imageParagraph],
                };
                sections.push(section);
            }
        }

        if (sections.length === 0) {
            throw new Error("No se pudo generar ninguna página del documento.");
        }

        update({
            id: toastId,
            title: 'Generando documento...',
            description: 'Ensamblando archivo final...',
        });
        
        const doc = new docx.Document({
            sections: sections,
        });

        const finalBlob = await docx.Packer.toBlob(doc);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(finalBlob);
        link.download = 'Mosaico-de-Fotos.docx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        update({
            id: toastId,
            title: '¡Descarga completa!',
            description: 'Tu documento ha sido guardado.',
            duration: 5000,
        });

    } catch (error) {
        console.error("Error generando el documento:", error);
        update({
            id: toastId,
            variant: 'destructive',
            title: 'Falló la descarga',
            description: error instanceof Error ? error.message : 'No se pudo generar el documento.',
            duration: 5000,
        });
    } finally {
        setIsDownloading(false);
        setTimeout(() => dismiss(toastId), 5000);
    }
  };


  const HeroSection = () => (
    <div className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-4">Generador de Mosaicos de Fotos</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Convierte tus recuerdos en hermosos collages. Sube tus fotos y el diseño se adaptará automáticamente para un resultado espectacular.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2" /> Subir Fotos
          </Button>
          <Button size="lg" variant="secondary" onClick={handleLoadSample}>
            <Wand2 className="mr-2" /> Cargar Ejemplo
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const MosaicCreator = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 p-4 md:p-8">
      <aside className="lg:sticky top-8 self-start flex flex-col gap-6">
        <Card className="p-6">
          <h2 className="font-headline text-2xl font-semibold mb-4">Tus Fotos ({images.length})</h2>
          <div className="grid grid-cols-3 gap-2 mb-4 max-h-60 overflow-y-auto pr-2">
            {loadedImages.map((img, index) => (
              <div key={index} className="relative group aspect-square">
                <Image src={img.src} alt={`vista-previa-subida-${index}`} width={100} height={100} className="rounded-md object-cover w-full h-full" />
                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(index)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="mr-2" /> Añadir Más Fotos
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-headline text-xl font-semibold mb-4 flex items-center">
            Opciones de Diseño
          </h3>
          <p className="text-sm text-muted-foreground mb-4">La descarga generará un documento Word con el diseño que veas en la vista previa.</p>
          <RadioGroup value={String(layout)} onValueChange={(val) => setLayout(Number(val) as LayoutOptions)} className="space-y-3">
            {[2, 4, 6].map(option => (
              <div key={option} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${layout === option ? 'bg-accent' : ''}`}>
                <RadioGroupItem value={String(option)} id={`layout-${option}`} />
                <Label htmlFor={`layout-${option}`} className="flex-grow cursor-pointer">{option} Fotos por Página</Label>
                {recommendedLayout === option && (
                  <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
                    <Sparkles className="h-4 w-4" />
                    <span>Recomendado</span>
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
           <Button size="lg" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
            {isDownloading ? 'Generando...' : 'Descargar Documento'}
          </Button>
          <Button size="lg" variant="secondary" onClick={resetApp}>
            Empezar de Nuevo
          </Button>
        </Card>
      </aside>

      <main>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline text-3xl font-bold">Vista Previa del Collage</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Página {currentPage + 1} de {totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
              <ArrowLeft />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>
              <ArrowRight />
            </Button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPage}-${layout}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <CollagePreview
              ref={collagePreviewRef}
              images={loadedImages}
              layout={layout}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={isCreating ? 'creator' : 'hero'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isCreating ? <MosaicCreator /> : <HeroSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

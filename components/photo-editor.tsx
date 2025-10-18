"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, Download, Save, RotateCw, Sparkles, Crop } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PhotoEditorProps {
  onSave: (media: { type: "photo"; url: string; name: string }) => void
}

type Filter = {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  grayscale: number
  sepia: number
  hueRotate: number
  invert: number
}

type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

export function PhotoEditor({ onSave }: PhotoEditorProps) {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [filters, setFilters] = useState<Filter>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    invert: 0,
  })
  const [rotation, setRotation] = useState(0)
  const [cropMode, setCropMode] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setFileName(file.name)
        setCropArea({ x: 0, y: 0, width: 100, height: 100 })
        setCropMode(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyFilters = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imageRef.current
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
      hue-rotate(${filters.hueRotate}deg)
      invert(${filters.invert}%)
    `

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    if (cropMode && previewCanvasRef.current) {
      drawCropOverlay()
    }
  }

  const drawCropOverlay = () => {
    if (!previewCanvasRef.current || !canvasRef.current) return

    const previewCanvas = previewCanvasRef.current
    const sourceCanvas = canvasRef.current
    const ctx = previewCanvas.getContext("2d")
    if (!ctx) return

    previewCanvas.width = sourceCanvas.width
    previewCanvas.height = sourceCanvas.height

    // Draw the original image
    ctx.drawImage(sourceCanvas, 0, 0)

    // Draw dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)

    // Clear crop area
    const cropX = (cropArea.x / 100) * previewCanvas.width
    const cropY = (cropArea.y / 100) * previewCanvas.height
    const cropW = (cropArea.width / 100) * previewCanvas.width
    const cropH = (cropArea.height / 100) * previewCanvas.height

    ctx.clearRect(cropX, cropY, cropW, cropH)
    ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, cropX, cropY, cropW, cropH)

    // Draw crop border
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.strokeRect(cropX, cropY, cropW, cropH)

    // Draw corner handles
    const handleSize = 12
    ctx.fillStyle = "#3b82f6"
    // Top-left
    ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize)
    // Top-right
    ctx.fillRect(cropX + cropW - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize)
    // Bottom-left
    ctx.fillRect(cropX - handleSize / 2, cropY + cropH - handleSize / 2, handleSize, handleSize)
    // Bottom-right
    ctx.fillRect(cropX + cropW - handleSize / 2, cropY + cropH - handleSize / 2, handleSize, handleSize)
  }

  const applyCrop = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cropX = (cropArea.x / 100) * canvas.width
    const cropY = (cropArea.y / 100) * canvas.height
    const cropW = (cropArea.width / 100) * canvas.width
    const cropH = (cropArea.height / 100) * canvas.height

    // Create temporary canvas with cropped image
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = cropW
    tempCanvas.height = cropH
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

    // Convert to data URL and update the image source
    const croppedDataUrl = tempCanvas.toDataURL()

    // Create new image to load the cropped version
    const newImg = new Image()
    newImg.onload = () => {
      setImage(croppedDataUrl)
      setCropMode(false)
      setCropArea({ x: 0, y: 0, width: 100, height: 100 })

      toast({
        title: "Zugeschnitten",
        description: "Dein Foto wurde erfolgreich zugeschnitten",
      })
    }
    newImg.src = croppedDataUrl
  }

  useEffect(() => {
    if (image) {
      applyFilters()
    }
  }, [filters, rotation, image, cropMode, cropArea])

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `edited-${fileName || "image.png"}`
    link.href = canvasRef.current.toDataURL()
    link.click()

    toast({
      title: "Erfolgreich exportiert",
      description: "Dein Foto wurde heruntergeladen",
    })
  }

  const handleSave = () => {
    if (!canvasRef.current) return

    const dataUrl = canvasRef.current.toDataURL()
    onSave({
      type: "photo",
      url: dataUrl,
      name: `edited-${fileName || "image.png"}`,
    })

    toast({
      title: "In Library gespeichert",
      description: "Dein Foto wurde zur Library hinzugefügt",
    })
  }

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "vintage":
        setFilters({ ...filters, sepia: 60, contrast: 110, saturation: 80, brightness: 95 })
        break
      case "vivid":
        setFilters({ ...filters, saturation: 150, contrast: 120, brightness: 105, hueRotate: 0 })
        break
      case "bw":
        setFilters({ ...filters, grayscale: 100, contrast: 120, brightness: 100 })
        break
      case "soft":
        setFilters({ ...filters, blur: 1, brightness: 105, saturation: 90, contrast: 95 })
        break
      case "cool":
        setFilters({ ...filters, hueRotate: 180, saturation: 110, contrast: 105, brightness: 100 })
        break
      case "warm":
        setFilters({ ...filters, hueRotate: 20, saturation: 120, contrast: 105, brightness: 105 })
        break
      case "dramatic":
        setFilters({ ...filters, contrast: 150, saturation: 130, brightness: 90, grayscale: 0 })
        break
      case "fade":
        setFilters({ ...filters, contrast: 80, saturation: 70, brightness: 110, blur: 0.5 })
        break
      case "cinematic":
        setFilters({ ...filters, contrast: 115, saturation: 85, brightness: 95, sepia: 15 })
        break
      case "neon":
        setFilters({ ...filters, saturation: 200, contrast: 130, brightness: 110, hueRotate: 90 })
        break
      case "retro":
        setFilters({ ...filters, sepia: 40, contrast: 120, saturation: 110, hueRotate: 10 })
        break
      case "arctic":
        setFilters({ ...filters, hueRotate: 200, saturation: 90, contrast: 110, brightness: 115 })
        break
      case "sunset":
        setFilters({ ...filters, hueRotate: 350, saturation: 140, contrast: 110, brightness: 100 })
        break
      case "noir":
        setFilters({ ...filters, grayscale: 100, contrast: 140, brightness: 90, invert: 0 })
        break
      case "invert":
        setFilters({ ...filters, invert: 100, contrast: 110, brightness: 100, saturation: 100 })
        break
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          {!image ? (
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Foto hochladen</h3>
              <p className="text-muted-foreground mb-6">Wähle ein Foto aus, um mit der Bearbeitung zu beginnen</p>
              <Button onClick={() => fileInputRef.current?.click()}>Foto auswählen</Button>
              <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            <div className="w-full">
              <div className="relative mb-4 flex justify-center bg-muted/30 rounded-lg p-4">
                <img
                  ref={imageRef}
                  src={image || "/placeholder.svg"}
                  alt="Preview"
                  className="hidden"
                  onLoad={applyFilters}
                />
                <canvas ref={canvasRef} className="hidden" />
                {cropMode ? (
                  <canvas ref={previewCanvasRef} className="max-w-full h-auto rounded-lg shadow-lg" />
                ) : (
                  <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-lg" />
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Neues Foto
                </Button>
                <Button onClick={() => setRotation((r) => r + 90)} variant="outline" size="sm">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Drehen
                </Button>
                {!cropMode ? (
                  <Button onClick={() => setCropMode(true)} variant="outline" size="sm">
                    <Crop className="h-4 w-4 mr-2" />
                    Zuschneiden
                  </Button>
                ) : (
                  <>
                    <Button onClick={applyCrop} variant="default" size="sm">
                      Zuschnitt anwenden
                    </Button>
                    <Button onClick={() => setCropMode(false)} variant="outline" size="sm">
                      Abbrechen
                    </Button>
                  </>
                )}
                <Button onClick={handleSave} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
                <Button onClick={handleDownload} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </Button>
              </div>
              <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}
        </div>
      </Card>

      {image && (
        <Card className="p-6">
          <div className="space-y-6">
            {cropMode && (
              <div className="space-y-4 pb-6 border-b border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Crop className="h-5 w-5 text-primary" />
                  Zuschneiden
                </h3>
                <div>
                  <Label className="text-sm">X Position: {cropArea.x}%</Label>
                  <Slider
                    value={[cropArea.x]}
                    onValueChange={([v]) => setCropArea({ ...cropArea, x: v })}
                    min={0}
                    max={100 - cropArea.width}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Y Position: {cropArea.y}%</Label>
                  <Slider
                    value={[cropArea.y]}
                    onValueChange={([v]) => setCropArea({ ...cropArea, y: v })}
                    min={0}
                    max={100 - cropArea.height}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Breite: {cropArea.width}%</Label>
                  <Slider
                    value={[cropArea.width]}
                    onValueChange={([v]) => setCropArea({ ...cropArea, width: v })}
                    min={10}
                    max={100 - cropArea.x}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Höhe: {cropArea.height}%</Label>
                  <Slider
                    value={[cropArea.height]}
                    onValueChange={([v]) => setCropArea({ ...cropArea, height: v })}
                    min={10}
                    max={100 - cropArea.y}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Filter Presets
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                <Button onClick={() => applyPreset("vintage")} variant="outline" size="sm">
                  Vintage
                </Button>
                <Button onClick={() => applyPreset("vivid")} variant="outline" size="sm">
                  Vivid
                </Button>
                <Button onClick={() => applyPreset("bw")} variant="outline" size="sm">
                  Schwarz/Weiß
                </Button>
                <Button onClick={() => applyPreset("soft")} variant="outline" size="sm">
                  Soft
                </Button>
                <Button onClick={() => applyPreset("cool")} variant="outline" size="sm">
                  Cool
                </Button>
                <Button onClick={() => applyPreset("warm")} variant="outline" size="sm">
                  Warm
                </Button>
                <Button onClick={() => applyPreset("dramatic")} variant="outline" size="sm">
                  Dramatic
                </Button>
                <Button onClick={() => applyPreset("fade")} variant="outline" size="sm">
                  Fade
                </Button>
                <Button onClick={() => applyPreset("cinematic")} variant="outline" size="sm">
                  Cinematic
                </Button>
                <Button onClick={() => applyPreset("neon")} variant="outline" size="sm">
                  Neon
                </Button>
                <Button onClick={() => applyPreset("retro")} variant="outline" size="sm">
                  Retro
                </Button>
                <Button onClick={() => applyPreset("arctic")} variant="outline" size="sm">
                  Arctic
                </Button>
                <Button onClick={() => applyPreset("sunset")} variant="outline" size="sm">
                  Sunset
                </Button>
                <Button onClick={() => applyPreset("noir")} variant="outline" size="sm">
                  Noir
                </Button>
                <Button onClick={() => applyPreset("invert")} variant="outline" size="sm">
                  Invert
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm">Helligkeit: {filters.brightness}%</Label>
                <Slider
                  value={[filters.brightness]}
                  onValueChange={([v]) => setFilters({ ...filters, brightness: v })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Kontrast: {filters.contrast}%</Label>
                <Slider
                  value={[filters.contrast]}
                  onValueChange={([v]) => setFilters({ ...filters, contrast: v })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Sättigung: {filters.saturation}%</Label>
                <Slider
                  value={[filters.saturation]}
                  onValueChange={([v]) => setFilters({ ...filters, saturation: v })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Weichzeichner: {filters.blur}px</Label>
                <Slider
                  value={[filters.blur]}
                  onValueChange={([v]) => setFilters({ ...filters, blur: v })}
                  min={0}
                  max={10}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Graustufen: {filters.grayscale}%</Label>
                <Slider
                  value={[filters.grayscale]}
                  onValueChange={([v]) => setFilters({ ...filters, grayscale: v })}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Sepia: {filters.sepia}%</Label>
                <Slider
                  value={[filters.sepia]}
                  onValueChange={([v]) => setFilters({ ...filters, sepia: v })}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Farbton: {filters.hueRotate}°</Label>
                <Slider
                  value={[filters.hueRotate]}
                  onValueChange={([v]) => setFilters({ ...filters, hueRotate: v })}
                  min={0}
                  max={360}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Invertieren: {filters.invert}%</Label>
                <Slider
                  value={[filters.invert]}
                  onValueChange={([v]) => setFilters({ ...filters, invert: v })}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={() =>
                setFilters({
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  blur: 0,
                  grayscale: 0,
                  sepia: 0,
                  hueRotate: 0,
                  invert: 0,
                })
              }
              variant="outline"
              className="w-full"
            >
              Filter zurücksetzen
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

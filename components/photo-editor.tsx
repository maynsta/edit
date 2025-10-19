"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Upload, RotateCw, Crop, Sparkles, Download, Check, X } from "lucide-react"

type Filter =
  | "none"
  | "grayscale"
  | "sepia"
  | "vintage"
  | "bright"
  | "contrast"
  | "blur"
  | "sharpen"
  | "vignette"
  | "warm"
  | "cool"
  | "dramatic"

export function PhotoEditor() {
  const [image, setImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("none")
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [blur, setBlur] = useState(0)
  const [hue, setHue] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [cropMode, setCropMode] = useState(false)
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null)
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
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

    if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth === 0 || img.naturalHeight === 0) {
      return
    }

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    if (canvas.width === 0 || canvas.height === 0) {
      return
    }

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) hue-rotate(${hue}deg)`

    switch (filter) {
      case "grayscale":
        ctx.filter += " grayscale(100%)"
        break
      case "sepia":
        ctx.filter += " sepia(100%)"
        break
      case "vintage":
        ctx.filter += " sepia(50%) contrast(120%) brightness(90%)"
        break
      case "bright":
        ctx.filter += " brightness(120%) saturate(120%)"
        break
      case "contrast":
        ctx.filter += " contrast(150%) saturate(130%)"
        break
      case "blur":
        ctx.filter += " blur(3px)"
        break
      case "sharpen":
        ctx.filter += " contrast(120%) brightness(105%)"
        break
      case "vignette":
        ctx.filter += " brightness(90%) contrast(110%)"
        break
      case "warm":
        ctx.filter += " sepia(20%) saturate(120%) hue-rotate(-10deg)"
        break
      case "cool":
        ctx.filter += " saturate(110%) hue-rotate(10deg) brightness(105%)"
        break
      case "dramatic":
        ctx.filter += " contrast(140%) saturate(140%) brightness(95%)"
        break
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    if (filter === "vignette") {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.5,
      )
      gradient.addColorStop(0, "rgba(0,0,0,0)")
      gradient.addColorStop(1, "rgba(0,0,0,0.6)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    if (displayCanvasRef.current) {
      const displayCanvas = displayCanvasRef.current
      const displayCtx = displayCanvas.getContext("2d")
      if (displayCtx && canvas.width > 0 && canvas.height > 0) {
        displayCanvas.width = canvas.width
        displayCanvas.height = canvas.height
        displayCtx.drawImage(canvas, 0, 0)
      }
    }
  }

  useEffect(() => {
    if (image && imageRef.current) {
      applyFilters()
    }
  }, [image, filter, brightness, contrast, saturation, blur, hue, rotation])

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !displayCanvasRef.current) return

    const rect = displayCanvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCropStart({ x, y })
    setCropEnd({ x, y })
    setIsDragging(true)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !isDragging || !displayCanvasRef.current) return

    const rect = displayCanvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCropEnd({ x, y })
    drawCropOverlay()
  }

  const handleCanvasMouseUp = () => {
    if (!cropMode) return
    setIsDragging(false)
  }

  const drawCropOverlay = () => {
    if (!displayCanvasRef.current || !canvasRef.current || !cropStart || !cropEnd) return

    const displayCanvas = displayCanvasRef.current
    const canvas = canvasRef.current
    const ctx = displayCanvas.getContext("2d")
    if (!ctx) return

    if (canvas.width === 0 || canvas.height === 0 || displayCanvas.width === 0 || displayCanvas.height === 0) {
      return
    }

    // Redraw the filtered image
    ctx.drawImage(canvas, 0, 0)

    // Draw crop overlay
    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const width = Math.abs(cropEnd.x - cropStart.x)
    const height = Math.abs(cropEnd.y - cropStart.y)

    // Darken outside crop area
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height)

    if (width > 0 && height > 0) {
      ctx.clearRect(x, y, width, height)
      ctx.drawImage(canvas, x, y, width, height, x, y, width, height)

      // Draw crop border
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)
    }
  }

  const applyCrop = () => {
    if (!canvasRef.current || !displayCanvasRef.current || !cropStart || !cropEnd) return

    const canvas = canvasRef.current
    const displayCanvas = displayCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (canvas.width === 0 || canvas.height === 0 || displayCanvas.width === 0 || displayCanvas.height === 0) {
      return
    }

    const scaleX = canvas.width / displayCanvas.width
    const scaleY = canvas.height / displayCanvas.height

    const x = Math.min(cropStart.x, cropEnd.x) * scaleX
    const y = Math.min(cropStart.y, cropEnd.y) * scaleY
    const width = Math.abs(cropEnd.x - cropStart.x) * scaleX
    const height = Math.abs(cropEnd.y - cropStart.y) * scaleY

    if (width === 0 || height === 0) {
      return
    }

    // Create temporary canvas with cropped content
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height)

    // Update main canvas
    canvas.width = width
    canvas.height = height
    ctx.drawImage(tempCanvas, 0, 0)

    // Update display
    displayCanvas.width = width
    displayCanvas.height = height
    const displayCtx = displayCanvas.getContext("2d")
    if (displayCtx) {
      displayCtx.drawImage(canvas, 0, 0)
    }

    if (imageRef.current) {
      imageRef.current.width = width
      imageRef.current.height = height
    }

    // Reset crop state
    setCropMode(false)
    setCropStart(null)
    setCropEnd(null)
  }

  const cancelCrop = () => {
    setCropMode(false)
    setCropStart(null)
    setCropEnd(null)
    applyFilters()
  }

  useEffect(() => {
    if (cropMode && cropStart && cropEnd) {
      drawCropOverlay()
    }
  }, [cropStart, cropEnd, cropMode])

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "edited-photo.png"
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const filters: { name: string; value: Filter }[] = [
    { name: "None", value: "none" },
    { name: "Grayscale", value: "grayscale" },
    { name: "Sepia", value: "sepia" },
    { name: "Vintage", value: "vintage" },
    { name: "Bright", value: "bright" },
    { name: "Contrast", value: "contrast" },
    { name: "Blur", value: "blur" },
    { name: "Sharpen", value: "sharpen" },
    { name: "Vignette", value: "vignette" },
    { name: "Warm", value: "warm" },
    { name: "Cool", value: "cool" },
    { name: "Dramatic", value: "dramatic" },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-muted/30 rounded-lg">
          {!image ? (
            <div className="text-center">
              <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Upload a photo</h3>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to select</p>
              <Button onClick={() => fileInputRef.current?.click()}>Choose File</Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
              <img
                ref={imageRef}
                src={image || "/placeholder.svg"}
                alt="Uploaded"
                className="hidden"
                onLoad={applyFilters}
                crossOrigin="anonymous"
              />
              <canvas ref={canvasRef} className="hidden" />
              <canvas
                ref={displayCanvasRef}
                className="max-w-full max-h-[500px] object-contain cursor-crosshair"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              {cropMode && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={applyCrop} disabled={!cropStart || !cropEnd}>
                    <Check className="h-4 w-4 mr-2" />
                    Apply Crop
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelCrop}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-foreground">Tools</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={handleRotate}
              disabled={!image}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate 90°
            </Button>
            <Button
              variant={cropMode ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setCropMode(!cropMode)}
              disabled={!image}
            >
              <Crop className="h-4 w-4 mr-2" />
              {cropMode ? "Cropping..." : "Crop Image"}
            </Button>
            <Button variant="default" className="w-full justify-start" onClick={handleDownload} disabled={!image}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Filters
          </h3>
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
                disabled={!image}
                className="text-xs"
              >
                {f.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-foreground">Adjustments</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            <div>
              <Label className="text-sm text-foreground">Brightness</Label>
              <Slider
                value={[brightness]}
                onValueChange={(v) => setBrightness(v[0])}
                min={0}
                max={200}
                step={1}
                disabled={!image}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{brightness}%</span>
            </div>
            <div>
              <Label className="text-sm text-foreground">Contrast</Label>
              <Slider
                value={[contrast]}
                onValueChange={(v) => setContrast(v[0])}
                min={0}
                max={200}
                step={1}
                disabled={!image}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{contrast}%</span>
            </div>
            <div>
              <Label className="text-sm text-foreground">Saturation</Label>
              <Slider
                value={[saturation]}
                onValueChange={(v) => setSaturation(v[0])}
                min={0}
                max={200}
                step={1}
                disabled={!image}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{saturation}%</span>
            </div>
            <div>
              <Label className="text-sm text-foreground">Blur</Label>
              <Slider
                value={[blur]}
                onValueChange={(v) => setBlur(v[0])}
                min={0}
                max={10}
                step={0.5}
                disabled={!image}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{blur}px</span>
            </div>
            <div>
              <Label className="text-sm text-foreground">Hue</Label>
              <Slider
                value={[hue]}
                onValueChange={(v) => setHue(v[0])}
                min={-180}
                max={180}
                step={1}
                disabled={!image}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{hue}°</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

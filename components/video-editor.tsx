"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Upload, Play, Pause, Scissors, Download, Sparkles } from "lucide-react"

type VideoFilter =
  | "none"
  | "grayscale"
  | "sepia"
  | "vintage"
  | "bright"
  | "contrast"
  | "warm"
  | "cool"
  | "dramatic"
  | "blur"
  | "sharpen"

export function VideoEditor() {
  const [video, setVideo] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [filter, setFilter] = useState<VideoFilter>("none")
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideo(url)
    }
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)

    if (endTime > 0 && videoRef.current.currentTime >= endTime) {
      videoRef.current.pause()
      setIsPlaying(false)
      videoRef.current.currentTime = startTime
    }
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    const dur = videoRef.current.duration
    setDuration(dur)
    setEndTime(dur)
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getFilterStyle = () => {
    const baseFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

    switch (filter) {
      case "grayscale":
        return baseFilter + " grayscale(100%)"
      case "sepia":
        return baseFilter + " sepia(100%)"
      case "vintage":
        return baseFilter + " sepia(50%) contrast(120%) brightness(90%)"
      case "bright":
        return baseFilter + " brightness(120%) saturate(120%)"
      case "contrast":
        return baseFilter + " contrast(150%) saturate(130%)"
      case "warm":
        return baseFilter + " sepia(20%) saturate(120%) hue-rotate(-10deg)"
      case "cool":
        return baseFilter + " saturate(110%) hue-rotate(10deg) brightness(105%)"
      case "dramatic":
        return baseFilter + " contrast(140%) saturate(140%) brightness(95%)"
      case "blur":
        return baseFilter + " blur(3px)"
      case "sharpen":
        return baseFilter + " contrast(120%) brightness(105%)"
      default:
        return baseFilter
    }
  }

  const filters: { name: string; value: VideoFilter }[] = [
    { name: "None", value: "none" },
    { name: "Grayscale", value: "grayscale" },
    { name: "Sepia", value: "sepia" },
    { name: "Vintage", value: "vintage" },
    { name: "Bright", value: "bright" },
    { name: "Contrast", value: "contrast" },
    { name: "Warm", value: "warm" },
    { name: "Cool", value: "cool" },
    { name: "Dramatic", value: "dramatic" },
    { name: "Blur", value: "blur" },
    { name: "Sharpen", value: "sharpen" },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-muted/30 rounded-lg">
          {!video ? (
            <div className="text-center">
              <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Upload a video</h3>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to select</p>
              <Button onClick={() => fileInputRef.current?.click()}>Choose File</Button>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="relative w-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={video}
                  className="max-w-full max-h-[400px]"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  style={{ filter: getFilterStyle() }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button size="icon" variant="outline" onClick={togglePlayPause}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      min={0}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Trim Video
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground">Start Time</Label>
              <Slider
                value={[startTime]}
                onValueChange={(v) => setStartTime(v[0])}
                min={0}
                max={duration}
                step={0.1}
                disabled={!video}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{formatTime(startTime)}</span>
            </div>
            <div>
              <Label className="text-sm text-foreground">End Time</Label>
              <Slider
                value={[endTime]}
                onValueChange={(v) => setEndTime(v[0])}
                min={0}
                max={duration}
                step={0.1}
                disabled={!video}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{formatTime(endTime)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Duration: {formatTime(endTime - startTime)}</p>
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
                disabled={!video}
                className="text-xs"
              >
                {f.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-foreground">Adjustments</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground">Brightness</Label>
              <Slider
                value={[brightness]}
                onValueChange={(v) => setBrightness(v[0])}
                min={0}
                max={200}
                step={1}
                disabled={!video}
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
                disabled={!video}
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
                disabled={!video}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{saturation}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-foreground">Export</h3>
          <Button variant="default" className="w-full justify-start" disabled={!video}>
            <Download className="h-4 w-4 mr-2" />
            Download Video
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Note: Video export requires server-side processing</p>
        </Card>
      </div>
    </div>
  )
}

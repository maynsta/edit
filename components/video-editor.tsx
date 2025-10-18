"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, Download, Save, Play, Pause, Scissors } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideoEditorProps {
  onSave: (media: { type: "video"; url: string; name: string }) => void
}

export function VideoEditor({ onSave }: VideoEditorProps) {
  const [video, setVideo] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file)
      setVideo(url)
      setFileName(file.name)
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
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    const dur = videoRef.current.duration
    setDuration(dur)
    setTrimEnd(dur)
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const vol = value[0] / 100
    videoRef.current.volume = vol
    setVolume(value[0])
  }

  const handlePlaybackRateChange = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = value[0]
    setPlaybackRate(value[0])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSave = () => {
    if (!video) return

    onSave({
      type: "video",
      url: video,
      name: `edited-${fileName || "video.mp4"}`,
    })

    toast({
      title: "In Library gespeichert",
      description: "Dein Video wurde zur Library hinzugefügt",
    })
  }

  const handleDownload = () => {
    if (!video) return

    const link = document.createElement("a")
    link.download = `edited-${fileName || "video.mp4"}`
    link.href = video
    link.click()

    toast({
      title: "Erfolgreich exportiert",
      description: "Dein Video wurde heruntergeladen",
    })
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          {!video ? (
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
                <Upload className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video hochladen</h3>
              <p className="text-muted-foreground mb-6">Wähle ein Video aus, um mit der Bearbeitung zu beginnen</p>
              <Button onClick={() => fileInputRef.current?.click()}>Video auswählen</Button>
              <Input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="relative bg-muted/30 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={video}
                  className="w-full rounded-lg"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button onClick={togglePlayPause} size="sm">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <Slider value={[currentTime]} onValueChange={handleSeek} min={0} max={duration || 100} step={0.1} />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Neues Video
                  </Button>
                  <Button onClick={handleSave} variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                  <Button onClick={handleDownload} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportieren
                  </Button>
                </div>
              </div>

              <Input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}
        </div>
      </Card>

      {video && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-secondary" />
                Video Einstellungen
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm">Lautstärke: {volume}%</Label>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Geschwindigkeit: {playbackRate}x</Label>
                <Slider
                  value={[playbackRate]}
                  onValueChange={handlePlaybackRateChange}
                  min={0.25}
                  max={2}
                  step={0.25}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Trim Start: {formatTime(trimStart)}</Label>
                <Slider
                  value={[trimStart]}
                  onValueChange={([v]) => setTrimStart(v)}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">Trim End: {formatTime(trimEnd)}</Label>
                <Slider
                  value={[trimEnd]}
                  onValueChange={([v]) => setTrimEnd(v)}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Schnelle Effekte</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.style.filter = "grayscale(100%)"
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Schwarz/Weiß
                </Button>
                <Button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.style.filter = "sepia(100%)"
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Sepia
                </Button>
                <Button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.style.filter = "blur(2px)"
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Blur
                </Button>
                <Button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.style.filter = "none"
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2, ImageIcon, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MediaItem {
  id: string
  type: "photo" | "video"
  url: string
  name: string
  timestamp: number
}

interface MediaLibraryProps {
  media: MediaItem[]
  onDelete: (id: string) => void
}

export function MediaLibrary({ media, onDelete }: MediaLibraryProps) {
  const { toast } = useToast()

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement("a")
    link.download = item.name
    link.href = item.url
    link.click()

    toast({
      title: "Download gestartet",
      description: `${item.name} wird heruntergeladen`,
    })
  }

  const handleDelete = (id: string) => {
    onDelete(id)
    toast({
      title: "Gelöscht",
      description: "Das Medium wurde aus der Library entfernt",
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (media.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <ImageIcon className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Keine Medien gespeichert</h3>
          <p className="text-muted-foreground">Bearbeite Fotos oder Videos und speichere sie hier in deiner Library</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Deine Library</h2>
        <p className="text-muted-foreground">
          {media.length} {media.length === 1 ? "Medium" : "Medien"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {media.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="aspect-video bg-muted relative overflow-hidden">
              {item.type === "photo" ? (
                <img src={item.url || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="relative w-full h-full">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Video className="h-12 w-12 text-white" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleDownload(item)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                {item.type === "photo" ? (
                  <ImageIcon className="h-4 w-4 text-primary" />
                ) : (
                  <Video className="h-4 w-4 text-secondary" />
                )}
                <p className="text-sm font-medium truncate flex-1">{item.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

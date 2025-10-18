"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhotoEditor } from "@/components/photo-editor"
import { VideoEditor } from "@/components/video-editor"
import { MediaLibrary } from "@/components/media-library"
import { ImageIcon, VideoIcon, LibraryIcon } from "lucide-react"

export default function Home() {
  const [savedMedia, setSavedMedia] = useState<
    Array<{ id: string; type: "photo" | "video"; url: string; name: string; timestamp: number }>
  >([])

  const handleSaveMedia = (media: { type: "photo" | "video"; url: string; name: string }) => {
    const newMedia = {
      id: Date.now().toString(),
      ...media,
      timestamp: Date.now(),
    }
    setSavedMedia((prev) => [newMedia, ...prev])
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Tabs defaultValue="photo" className="w-full">
          <TabsContent value="photo" className="mt-0">
            <PhotoEditor onSave={handleSaveMedia} />
          </TabsContent>

          <TabsContent value="video" className="mt-0">
            <VideoEditor onSave={handleSaveMedia} />
          </TabsContent>

          <TabsContent value="library" className="mt-0">
            <MediaLibrary
              media={savedMedia}
              onDelete={(id) => setSavedMedia((prev) => prev.filter((m) => m.id !== id))}
            />
          </TabsContent>

          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50">
            <div className="container mx-auto px-4">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-16 bg-transparent">
                <TabsTrigger
                  value="photo"
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-primary/10"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs">Foto</span>
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-primary/10"
                >
                  <VideoIcon className="h-5 w-5" />
                  <span className="text-xs">Video</span>
                </TabsTrigger>
                <TabsTrigger
                  value="library"
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-primary/10"
                >
                  <LibraryIcon className="h-5 w-5" />
                  <span className="text-xs">Library</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </Tabs>
      </div>
    </main>
  )
}

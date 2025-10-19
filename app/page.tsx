"use client"

import { useState } from "react"
import { PhotoEditor } from "@/components/photo-editor"
import { VideoEditor } from "@/components/video-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Video } from "lucide-react"

export default function EditApp() {
  const [activeTab, setActiveTab] = useState("photo")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Edit.</h1>
            <p className="text-sm text-muted-foreground">Professional Photo & Video Editor</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="photo" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photo Editor
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photo" className="mt-0">
            <PhotoEditor />
          </TabsContent>

          <TabsContent value="video" className="mt-0">
            <VideoEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

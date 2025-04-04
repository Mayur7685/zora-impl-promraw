"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  Droplets,
  Pencil,
  Highlighter,
  Sparkles,
  Menu,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { useMobile } from "@/hooks/use-mobile"

interface DrawingCanvasProps {
  onScoreUpdate?: (scores: {
    creativity: number
    promptAdherence: number
    artisticQuality: number
    overall: number
    feedback: string
    nftCard: {
      name: string
      type: string
      hp: number
      moves: Array<{
        name: string
        damage: number
      }>
      description: string
    }
  }) => void
  prompt?: string
}

type DrawingTool = "brush" | "eraser" | "pencil" | "marker" | "spray" | "rainbow"
type CanvasAction = "draw" | "move" | "zoom"

export default function DrawingCanvas({ onScoreUpdate, prompt = "" }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#FF5722") // Orange default - more funky!
  const [brushSize, setBrushSize] = useState([8])
  const [tool, setTool] = useState<DrawingTool>("brush")
  const [action, setAction] = useState<CanvasAction>("draw")
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const [rainbowHue, setRainbowHue] = useState(0)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()

  // More funky, vibrant colors
  const predefinedColors = [
    "#FF5722", // Orange
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#673AB7", // Deep Purple
    "#3F51B5", // Indigo
    "#2196F3", // Blue
    "#00BCD4", // Cyan
    "#009688", // Teal
    "#4CAF50", // Green
    "#CDDC39", // Lime
    "#FFEB3B", // Yellow
    "#FF9800", // Amber
    "#000000", // Black
    "#ffffff", // White
  ]

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    canvas.width = 800
    canvas.height = 600

    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (context) {
      context.lineCap = "round"
      context.lineJoin = "round"
      context.strokeStyle = color
      context.lineWidth = brushSize[0]
      context.fillStyle = "#ffffff" // White background
      context.fillRect(0, 0, canvas.width, canvas.height)
      setCtx(context)

      // Save initial canvas state
      const initialState = context.getImageData(0, 0, canvas.width, canvas.height)
      setHistory([initialState])
      setHistoryIndex(0)
    }
  }, [])

  // Update context when color or brush size changes
  useEffect(() => {
    if (!ctx) return

    if (tool === "eraser") {
      ctx.strokeStyle = "#FFFFFF"
    } else if (tool === "rainbow") {
      // Rainbow is handled during drawing
      ctx.strokeStyle = `hsl(${rainbowHue}, 100%, 50%)`
    } else {
      ctx.strokeStyle = color
    }

    ctx.lineWidth = brushSize[0]

    // Set different compositing based on tool
    if (tool === "marker") {
      ctx.globalAlpha = 0.3 // Semi-transparent
    } else {
      ctx.globalAlpha = 1.0
    }

    // Set different line styles based on tool
    if (tool === "pencil") {
      ctx.lineWidth = brushSize[0] / 2
    } else if (tool === "spray") {
      ctx.lineWidth = 1 // Spray is handled differently
    }
  }, [color, brushSize, tool, ctx, rainbowHue])

  // Save current state to history
  const saveState = () => {
    if (!ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Remove any states after current index (if we've undone and then drawn something new)
    const newHistory = history.slice(0, historyIndex + 1)

    setHistory([...newHistory, currentState])
    setHistoryIndex(newHistory.length)
  }

  // Improved smooth drawing with quadratic curves
  const drawSmoothLine = (x: number, y: number) => {
    if (!ctx || !lastPoint) return

    // Start a new path
    ctx.beginPath()

    // Move to the last point
    ctx.moveTo(lastPoint.x, lastPoint.y)

    // Calculate the control point (midpoint)
    const controlX = (lastPoint.x + x) / 2
    const controlY = (lastPoint.y + y) / 2

    // Draw a quadratic curve to the current point
    ctx.quadraticCurveTo(controlX, controlY, x, y)

    // Stroke the path
    ctx.stroke()

    // Update the last point
    setLastPoint({ x, y })
  }

  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | TouchEvent,
  ) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    let clientX, clientY

    if ("touches" in e) {
      // Touch event
      if (e.touches.length === 0) return { x: 0, y: 0 }
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    // Calculate the scale of the canvas
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Get the position within the canvas element
    const x = ((clientX - rect.left) * scaleX) / zoom - position.x
    const y = ((clientY - rect.top) * scaleY) / zoom - position.y

    return { x, y }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return

    e.preventDefault() // Prevent scrolling on touch devices

    if (action === "move") {
      setIsDrawing(true)
      if ("touches" in e) {
        setLastPosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        })
      } else {
        setLastPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }
      return
    }

    if (action === "zoom") {
      return // Zoom is handled by buttons
    }

    setIsDrawing(true)

    const { x, y } = getCanvasCoordinates(e)

    // Set the last point for smooth drawing
    setLastPoint({ x, y })

    ctx.beginPath()
    ctx.moveTo(x, y)

    // For spray tool, start spraying
    if (tool === "spray") {
      spray(x, y)
    } else {
      // For other tools, draw a dot at the starting point
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return

    e.preventDefault() // Prevent scrolling on touch devices

    if (action === "move") {
      let currentX, currentY
      if ("touches" in e) {
        currentX = e.touches[0].clientX
        currentY = e.touches[0].clientY
      } else {
        currentX = e.clientX
        currentY = e.clientY
      }

      const deltaX = currentX - lastPosition.x
      const deltaY = currentY - lastPosition.y

      setPosition((prev) => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom,
      }))

      setLastPosition({
        x: currentX,
        y: currentY,
      })
      return
    }

    const { x, y } = getCanvasCoordinates(e)

    if (tool === "rainbow") {
      // Update rainbow color
      setRainbowHue((prev) => (prev + 5) % 360)
      ctx.strokeStyle = `hsl(${rainbowHue}, 100%, 50%)`
    }

    if (tool === "spray") {
      spray(x, y)
    } else {
      // Use smooth drawing for all other tools
      drawSmoothLine(x, y)
    }
  }

  const spray = (x: number, y: number) => {
    if (!ctx) return

    const density = brushSize[0] * 2
    const radius = brushSize[0] * 2

    for (let i = 0; i < density; i++) {
      const offsetX = getRandomInt(-radius, radius)
      const offsetY = getRandomInt(-radius, radius)

      // Only draw within the radius
      if (offsetX * offsetX + offsetY * offsetY <= radius * radius) {
        const sprayX = x + offsetX
        const sprayY = y + offsetY

        ctx.beginPath()
        ctx.moveTo(sprayX, sprayY)
        ctx.lineTo(sprayX + 1, sprayY + 1)
        ctx.stroke()
      }
    }
  }

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const endDrawing = () => {
    if (!isDrawing || !ctx || !canvasRef.current) return

    ctx.closePath()
    setIsDrawing(false)
    setLastPoint(null)

    // Only save state if we were drawing (not moving)
    if (action === "draw") {
      saveState()
    }
  }

  // Handle touch events outside the canvas
  useEffect(() => {
    const handleTouchEnd = () => {
      if (isDrawing) {
        endDrawing()
      }
    }

    document.addEventListener("touchend", handleTouchEnd)
    return () => {
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDrawing])

  const handleUndo = () => {
    if (historyIndex <= 0 || !ctx || !canvasRef.current) return

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    const canvas = canvasRef.current
    ctx.putImageData(history[newIndex], 0, 0)
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !ctx || !canvasRef.current) return

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)

    const canvas = canvasRef.current
    ctx.putImageData(history[newIndex], 0, 0)
  }

  const handleClear = () => {
    if (!ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    saveState()
  }

  // Add a method to clear the canvas
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    saveState()
  }

  // Expose the clearCanvas method to parent components
  useEffect(() => {
    if (canvasRef.current) {
      // @ts-ignore - Add a clear method to the canvas element
      canvasRef.current.clear = clearCanvas
    }
  }, [ctx])

  const handleDownload = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL("image/png")

    const link = document.createElement("a")
    link.download = "promraw-drawing.png"
    link.href = dataURL
    link.click()
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleResetView = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleSubmitForScoring = async () => {
    if (!canvasRef.current || !prompt) {
      toast({
        title: "Error",
        description: "Cannot submit drawing. Make sure you have a prompt and a drawing.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const canvas = canvasRef.current
      const dataURL = canvas.toDataURL("image/png")

      // Create form data
      const formData = new FormData()
      formData.append("image", dataURL)
      formData.append("prompt", prompt)

      // Submit to scoring API
      const response = await fetch("/api/score", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to score drawing")
      }

      const data = await response.json()

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
        return
      }

      // Update scores
      if (onScoreUpdate && data.scores) {
        onScoreUpdate(data.scores)

        toast({
          title: "Drawing Scored!",
          description: `Overall score: ${data.scores.overall.toFixed(1)}/10`,
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Error submitting drawing:", error)
      toast({
        title: "Error",
        description: "Failed to score drawing. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCanvasEmpty = () => {
    if (!canvasRef.current || !ctx) return true

    const canvas = canvasRef.current
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data

    // Check if all pixel data is white (255, 255, 255)
    for (let i = 0; i < pixelData.length; i += 4) {
      if (pixelData[i] !== 255 || pixelData[i + 1] !== 255 || pixelData[i + 2] !== 255) {
        return false
      }
    }

    return true
  }

  // Mobile toolbar component
  const MobileToolbar = () => (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 shadow-lg bg-black text-white border-2 border-white"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[70vh] rounded-t-xl bg-gray-100">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Drawing Tools</h3>
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Drawing Modes */}
            <div>
              <h4 className="text-sm font-medium mb-2">Mode</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={action === "draw" ? "default" : "outline"}
                  onClick={() => setAction("draw")}
                  className={`h-16 ${action === "draw" ? "bg-black text-white" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <Paintbrush className="h-6 w-6 mb-1" />
                    <span className="text-xs">Draw</span>
                  </div>
                </Button>
                <Button
                  variant={action === "move" ? "default" : "outline"}
                  onClick={() => setAction("move")}
                  className={`h-16 ${action === "move" ? "bg-black text-white" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <Move className="h-6 w-6 mb-1" />
                    <span className="text-xs">Move</span>
                  </div>
                </Button>
                <Button
                  variant={action === "zoom" ? "default" : "outline"}
                  onClick={() => setAction("zoom")}
                  className={`h-16 ${action === "zoom" ? "bg-black text-white" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <ZoomIn className="h-6 w-6 mb-1" />
                    <span className="text-xs">Zoom</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Drawing Tools */}
            {action === "draw" && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tools</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={tool === "brush" ? "default" : "outline"}
                    onClick={() => setTool("brush")}
                    className={`h-16 ${tool === "brush" ? "bg-black text-white" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <Paintbrush className="h-6 w-6 mb-1" />
                      <span className="text-xs">Brush</span>
                    </div>
                  </Button>
                  <Button
                    variant={tool === "pencil" ? "default" : "outline"}
                    onClick={() => setTool("pencil")}
                    className={`h-16 ${tool === "pencil" ? "bg-black text-white" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <Pencil className="h-6 w-6 mb-1" />
                      <span className="text-xs">Pencil</span>
                    </div>
                  </Button>
                  <Button
                    variant={tool === "marker" ? "default" : "outline"}
                    onClick={() => setTool("marker")}
                    className={`h-16 ${tool === "marker" ? "bg-black text-white" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <Highlighter className="h-6 w-6 mb-1" />
                      <span className="text-xs">Marker</span>
                    </div>
                  </Button>
                  <Button
                    variant={tool === "spray" ? "default" : "outline"}
                    onClick={() => setTool("spray")}
                    className={`h-16 ${tool === "spray" ? "bg-black text-white" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <Droplets className="h-6 w-6 mb-1" />
                      <span className="text-xs">Spray</span>
                    </div>
                  </Button>
                  <Button
                    variant={tool === "rainbow" ? "default" : "outline"}
                    onClick={() => setTool("rainbow")}
                    className={`h-16 ${tool === "rainbow" ? "bg-black text-white" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <Sparkles className="h-6 w-6 mb-1" />
                      <span className="text-xs">Rainbow</span>
                    </div>
                  </Button>
                  <Button
                    variant={tool === "eraser" ? "default" : "outline"}
                    onClick={() => setTool("eraser")}
                    className={`h-16 ${tool === "eraser" ? "bg-black text-white" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <Eraser className="h-6 w-6 mb-1" />
                      <span className="text-xs">Eraser</span>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Color Picker */}
            {action === "draw" && (
              <div>
                <h4 className="text-sm font-medium mb-2">Color</h4>
                <div className="grid grid-cols-7 gap-2">
                  {predefinedColors.map((c, i) => (
                    <button
                      key={i}
                      className={`w-10 h-10 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-black" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Brush Size */}
            {action === "draw" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Brush Size</h4>
                  <span className="text-sm">{brushSize[0]}</span>
                </div>
                <Slider value={brushSize} min={1} max={50} step={1} onValueChange={setBrushSize} />
              </div>
            )}

            {/* Zoom Controls */}
            {action === "zoom" && (
              <div>
                <h4 className="text-sm font-medium mb-2">Zoom Controls</h4>
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="lg" onClick={handleZoomOut}>
                    <ZoomOut className="h-6 w-6 mr-2" />
                    Zoom Out
                  </Button>
                  <div className="text-lg font-medium">{(zoom * 100).toFixed(0)}%</div>
                  <Button variant="outline" size="lg" onClick={handleZoomIn}>
                    <ZoomIn className="h-6 w-6 mr-2" />
                    Zoom In
                  </Button>
                </div>
                <Button variant="outline" size="lg" onClick={handleResetView} className="w-full mt-2">
                  Reset View
                </Button>
              </div>
            )}

            {/* History Controls */}
            <div>
              <h4 className="text-sm font-medium mb-2">Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleUndo} disabled={historyIndex <= 0}>
                  <Undo2 className="h-5 w-5 mr-2" />
                  Undo
                </Button>
                <Button variant="outline" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                  <Redo2 className="h-5 w-5 mr-2" />
                  Redo
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-5 w-5 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )

  // Desktop toolbar component
  const DesktopToolbar = () => (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2 mb-2 p-4 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md border-4 border-dashed border-gray-400 dark:border-gray-600">
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={action === "draw" ? "default" : "outline"}
                size="icon"
                onClick={() => setAction("draw")}
                className="rounded-full bg-black hover:bg-gray-800 text-white shadow-md"
              >
                <Paintbrush className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Draw Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={action === "move" ? "default" : "outline"}
                size="icon"
                onClick={() => setAction("move")}
                className="rounded-full"
              >
                <Move className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move Canvas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={action === "zoom" ? "default" : "outline"}
                size="icon"
                onClick={() => setAction("zoom")}
                className="rounded-full"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Mode</TooltipContent>
          </Tooltip>
        </div>

        {action === "draw" && (
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "brush" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("brush")}
                  className="rounded-full bg-black text-white"
                >
                  <Paintbrush className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Brush</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "pencil" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("pencil")}
                  className="rounded-full bg-black text-white"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pencil</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "marker" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("marker")}
                  className="rounded-full bg-black text-white"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Marker</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "spray" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("spray")}
                  className="rounded-full bg-black text-white"
                >
                  <Droplets className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Spray</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "rainbow" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("rainbow")}
                  className="rounded-full bg-black text-white"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rainbow</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "eraser" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("eraser")}
                  className="rounded-full"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eraser</TooltipContent>
            </Tooltip>
          </div>
        )}

        {action === "zoom" && (
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomIn} className="rounded-full">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomOut} className="rounded-full">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleResetView} className="rounded-full">
                  Reset View
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View</TooltipContent>
            </Tooltip>

            <div className="text-sm font-medium ml-2">Zoom: {(zoom * 100).toFixed(0)}%</div>
          </div>
        )}

        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="rounded-full"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="rounded-full"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleClear} className="rounded-full">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleDownload} className="rounded-full">
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        </div>

        {action === "draw" && (
          <>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <Tabs defaultValue="palette">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="palette">Palette</TabsTrigger>
                      <TabsTrigger value="picker">Picker</TabsTrigger>
                    </TabsList>
                    <TabsContent value="palette" className="mt-2">
                      <div className="grid grid-cols-7 gap-2">
                        {predefinedColors.map((c, i) => (
                          <button
                            key={i}
                            className={`w-8 h-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-black" : ""}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                          />
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="picker" className="mt-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>

              <div className="w-32">
                <Slider value={brushSize} min={1} max={50} step={1} onValueChange={setBrushSize} className="h-4" />
              </div>
              <div className="text-xs font-medium">Size: {brushSize[0]}</div>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )

  return (
    <div className="flex flex-col space-y-4">
      {isMobile ? null : <DesktopToolbar />}
      {isMobile && <MobileToolbar />}

      <div
        ref={containerRef}
        className="border-8 border-gray-400 dark:border-gray-600 rounded-xl overflow-hidden bg-white shadow-lg relative"
        style={{
          height: "400px",
          overflow: "hidden",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: "0 0",
            width: "800px",
            height: "600px",
          }}
        >
          <canvas
            ref={canvasRef}
            className="touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            width={800}
            height={600}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmitForScoring}
        disabled={isSubmitting || isCanvasEmpty()}
        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-transform hover:scale-105"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Analyzing your artwork...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Submit for AI Scoring
          </>
        )}
      </Button>
    </div>
  )
}


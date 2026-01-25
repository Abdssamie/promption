import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

export function ZoomControls() {
  const [zoom, setZoom] = useState(125); // Default to 125%

  useEffect(() => {
    // Set initial zoom to 125%
    const initZoom = async () => {
      try {
        const webview = getCurrentWebview();
        await webview.setZoom(1.25);
        console.log("Initial zoom set to 125%");
      } catch (error) {
        console.error("Failed to set initial zoom:", error);
      }
    };
    initZoom();
  }, []);

  const handleZoomIn = async () => {
    try {
      const newZoom = Math.min(zoom + 10, 200);
      const webview = getCurrentWebview();
      await webview.setZoom(newZoom / 100);
      setZoom(newZoom);
      console.log(`Zoom set to ${newZoom}%`);
    } catch (error) {
      console.error("Failed to zoom in:", error);
    }
  };

  const handleZoomOut = async () => {
    try {
      const newZoom = Math.max(zoom - 10, 50);
      const webview = getCurrentWebview();
      await webview.setZoom(newZoom / 100);
      setZoom(newZoom);
      console.log(`Zoom set to ${newZoom}%`);
    } catch (error) {
      console.error("Failed to zoom out:", error);
    }
  };

  const handleResetZoom = async () => {
    try {
      const webview = getCurrentWebview();
      await webview.setZoom(1.25); // Reset to 125%
      setZoom(125);
      console.log("Zoom reset to 125%");
    } catch (error) {
      console.error("Failed to reset zoom:", error);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomOut}
        className="h-7 w-7 hover:bg-secondary"
        title="Zoom out"
        disabled={zoom <= 50}
      >
        <ZoomOut size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleResetZoom}
        className="h-7 w-7 text-xs px-1 hover:bg-secondary"
        title="Reset zoom to 125%"
      >
        {zoom}%
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomIn}
        className="h-7 w-7 hover:bg-secondary"
        title="Zoom in"
        disabled={zoom >= 200}
      >
        <ZoomIn size={14} />
      </Button>
    </div>
  );
}

import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getCurrentWebview } from '@tauri-apps/api/webview';

export function ZoomControls() {
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = async () => {
        try {
            const newZoom = Math.min(zoom + 10, 200);
            const webview = getCurrentWebview();
            await webview.setZoom(newZoom / 100);
            setZoom(newZoom);
        } catch (error) {
            console.error('Failed to zoom in:', error);
        }
    };

    const handleZoomOut = async () => {
        try {
            const newZoom = Math.max(zoom - 10, 50);
            const webview = getCurrentWebview();
            await webview.setZoom(newZoom / 100);
            setZoom(newZoom);
        } catch (error) {
            console.error('Failed to zoom out:', error);
        }
    };

    const handleResetZoom = async () => {
        try {
            const webview = getCurrentWebview();
            await webview.setZoom(1.0);
            setZoom(100);
        } catch (error) {
            console.error('Failed to reset zoom:', error);
        }
    };

    return (
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="h-7 w-7"
                title="Zoom out"
                disabled={zoom <= 50}
            >
                <ZoomOut size={14} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleResetZoom}
                className="h-7 w-7 text-xs px-1"
                title="Reset zoom"
            >
                {zoom}%
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="h-7 w-7"
                title="Zoom in"
                disabled={zoom >= 200}
            >
                <ZoomIn size={14} />
            </Button>
        </div>
    );
}

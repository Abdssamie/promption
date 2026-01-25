import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ZoomControls() {
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = () => {
        const newZoom = Math.min(zoom + 10, 200);
        setZoom(newZoom);
        document.body.style.zoom = `${newZoom}%`;
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoom - 10, 50);
        setZoom(newZoom);
        document.body.style.zoom = `${newZoom}%`;
    };

    const handleResetZoom = () => {
        setZoom(100);
        document.body.style.zoom = '100%';
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

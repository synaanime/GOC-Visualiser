import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pen, Trash2, Send } from 'lucide-react';

interface DrawingCanvasProps {
  onCapture: (dataUrl: string | null) => void;
  isProcessing: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onCapture, isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [strokeColor] = useState('#1e293b'); // slate-800
  
  // Set canvas size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Save current content
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        tempCtx?.drawImage(canvasRef.current, 0, 0);

        // Resize
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        
        // Restore content
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
           ctx.lineCap = 'round';
           ctx.lineJoin = 'round';
           ctx.fillStyle = '#ffffff';
           ctx.fillRect(0, 0, width, height);
           ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial delay to ensure container has size
    setTimeout(handleResize, 10);
    
    // Initial fill white
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && containerRef.current) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, containerRef.current.offsetWidth, containerRef.current.offsetHeight);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isProcessing) return;
    setIsDrawing(true);
    // Mark as drawn when user starts interacting
    setHasDrawn(true);
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isProcessing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    const { offsetX, offsetY } = getCoordinates(e);
    
    ctx.lineWidth = tool === 'eraser' ? 20 : 3;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : strokeColor;
    
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isProcessing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleCapture = () => {
    if (!hasDrawn) {
      onCapture(null);
      return;
    }
    if (canvasRef.current) {
      // Use JPEG with 0.7 quality for smaller payload and faster upload
      onCapture(canvasRef.current.toDataURL('image/jpeg', 0.7));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div 
        ref={containerRef} 
        className={`relative flex-grow w-full bg-white rounded-xl shadow-inner border-2 overflow-hidden touch-none ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'border-slate-200 dark:border-slate-600 cursor-crosshair'} transition-colors duration-300`}
        style={{ minHeight: '300px', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
            title="Pen"
          >
            <Pen size={20} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
            title="Eraser"
          >
            <Eraser size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1 transition-colors"></div>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Clear All"
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        <button
          onClick={handleCapture}
          disabled={isProcessing || !hasDrawn}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isProcessing ? 'Analyzing...' : 'Identify'} <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
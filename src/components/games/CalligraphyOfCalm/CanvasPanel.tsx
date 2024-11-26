import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import type { Kanji } from './types';

type Props = {
  kanji: Kanji;
  onStrokeComplete: (path: number[][]) => void;
};

const CanvasPanel = forwardRef<HTMLCanvasElement, Props>(({ kanji, onStrokeComplete }, ref) => {
  const canvasRef = React.useRef<fabric.Canvas | null>(null);

  useImperativeHandle(ref, () => ({
    getContext: () => canvasRef.current?.getContext()
  }));

  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = new fabric.Canvas('calligraphyCanvas', {
        isDrawingMode: true,
        width: 800,
        height: 600,
        backgroundColor: '#f8f8f8'
      });

      // Configure brush
      canvas.freeDrawingBrush.width = 10;
      canvas.freeDrawingBrush.color = '#000';
      
      // Add template
      fabric.Image.fromURL(kanji.template, (img) => {
        img.set({
          left: canvas.width! / 2 - img.width! / 2,
          top: canvas.height! / 2 - img.height! / 2,
          selectable: false,
          opacity: 0.3
        });
        canvas.add(img);
        canvas.renderAll();
      });

      // Handle path creation
      canvas.on('path:created', (e) => {
        const path = e.path;
        if (!path) return;

        const points = path.path.map((cmd: any[]) => [cmd[1], cmd[2]]);
        onStrokeComplete(points);
      });

      canvasRef.current = canvas;
    }

    return () => {
      canvasRef.current?.dispose();
    };
  }, [kanji, onStrokeComplete]);

  return (
    <div className="absolute inset-0">
      <canvas id="calligraphyCanvas" />
    </div>
  );
});

export default CanvasPanel;
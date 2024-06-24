import type {
  BaseCanvasTool,
  InteractionData,
} from "@_vue/components/BaseCanvas.vue";

interface PenTool extends BaseCanvasTool {
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineJoin: CanvasPathDrawingStyles["lineJoin"];
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
  color?: CanvasColor;
}

interface EraserTool extends BaseCanvasTool {
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
  color?: CanvasColor;
}

type CanvasColor = string | CanvasPattern | CanvasGradient;

export function useCanvasTool() {
  function createPenTool(name: string, settings: Partial<PenTool>): PenTool {
    return {
      toolName: name,
      handleInteraction(_e: PointerEvent, data: InteractionData) {
        const { x, y, canvasContext } = data;
        canvasContext.lineCap = this.lineCap;
        canvasContext.lineJoin = this.lineJoin;
        canvasContext.lineWidth = this.lineWidth;
        canvasContext.strokeStyle = this.color ?? "black";
        canvasContext.lineTo(x, y);
        canvasContext.stroke();
      },
      handleInteractionEnd(_e: PointerEvent, data: InteractionData) {
        const { canvasContext } = data;
        canvasContext.beginPath();
      },
      lineCap: "round",
      lineJoin: "round",
      lineWidth: 5,
      ...settings,
    };
  }

  function createEraserTool(
    name: string,
    settings: Partial<EraserTool>
  ): EraserTool {
    return {
      toolName: name,
      lineCap: "round",
      handleInteraction(_e: PointerEvent, data: InteractionData) {
        const { x, y, canvasElement, canvasContext } = data;
        const { width, height } = canvasElement;

        switch (this.lineCap) {
          case "butt":
          case "round":
            canvasContext.save();
            canvasContext.arc(x, y, this.lineWidth / 2, 0, 360);
            canvasContext.clip();
            canvasContext.clearRect(0, 0, width, height);
            canvasContext.restore();

            break;
          case "square":
            canvasContext.clearRect(
              x - this.lineWidth / 2,
              y - this.lineWidth / 2,
              this.lineWidth,
              this.lineWidth
            );

            break;
        }
      },
      lineWidth: 5,
      ...settings,
    };
  }

  return {
    createPenTool,
    createEraserTool,
  };
}
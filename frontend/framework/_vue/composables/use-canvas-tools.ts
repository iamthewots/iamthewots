import type { CanvasTool } from "@_vue/components/BaseCanvas.vue";

interface PenTool extends CanvasTool {
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineJoin: CanvasPathDrawingStyles["lineJoin"];
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
  color?: CanvasColor;
}

interface EraserTool extends CanvasTool {
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
  color?: CanvasColor;
}

interface PanTool extends CanvasTool {}

type CanvasColor = string | CanvasGradient | CanvasPattern;

export function useCanvasTools() {
  function createPenTool(
    name: string,
    settings: Partial<PenTool> = {}
  ): PenTool {
    return {
      name,
      handleInteraction(_e, data) {
        const { x, y, canvasContext } = data;
        canvasContext.lineCap = this.lineCap;
        canvasContext.lineJoin = this.lineJoin;
        canvasContext.lineWidth = this.lineWidth;
        canvasContext.strokeStyle = this.color ?? "#000";
        canvasContext.lineTo(x, y);
        canvasContext.stroke();
      },
      handleInteractionEnd(_e, data) {
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
    settings: Partial<EraserTool> = {}
  ): EraserTool {
    return {
      name,
      handleInteraction(_e, data) {
        const { x, y, canvasContext } = data;

        switch (this.lineCap) {
          case "butt":
          case "round":
            canvasContext.save();
            canvasContext.arc(x, y, this.lineWidth / 2, 0, 360);
            canvasContext.clip();
            canvasContext.clearRect(
              x - this.lineWidth / 2,
              y - this.lineWidth / 2,
              this.lineWidth,
              this.lineWidth
            );
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
      handleInteractionEnd(_e, data) {
        const { canvasContext } = data;
        canvasContext.beginPath();
      },
      lineCap: "round",
      lineWidth: 10,
      ...settings,
    };
  }

  const panTool: PanTool = {
    name: "pan",
    doNotUpdateHistory: true,
    handleInteractionStart(e, data) {
      // use pointerhistory again
      // fuck you leo
      // seriously, fuck everything
    },
  };

  return {
    createPenTool,
    createEraserTool,
    panTool,
  };
}

import { CanvasTool } from "@_vue/components/BaseCanvas.vue";

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
      handleInteractionStart(_e, data) {
        const { x, y, canvasContext } = data;
        canvasContext.beginPath();
        canvasContext.moveTo(x, y);
      },
      handleInteraction(_e, data) {
        const { x, y, canvasContext } = data;

        canvasContext.lineCap = this.lineCap;
        canvasContext.lineJoin = this.lineJoin;
        canvasContext.lineWidth = this.lineWidth;
        canvasContext.strokeStyle = this.color ?? "#000";
        canvasContext.lineTo(x, y);
        canvasContext.stroke();
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
      handleInteractionStart(_e, data) {
        const { canvasContext } = data;
        canvasContext.beginPath();
      },
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
      lineCap: "round",
      lineWidth: 10,
      ...settings,
    };
  }

  const panTool: PanTool = {
    name: "pan",
    doNotUpdateHistory: true,
    handleInteractionStart(e, data) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
      // use pointerhistory again
      // fuck you leo
      // seriously, fuck everything

      const { x, y, wrapperElement, pointerHistory } = data;

      if (pointerHistory.length < 2) {
        return;
      }

      const previousPoint = pointerHistory.slice(-2)[0];
      const left = Math.sign(x - previousPoint.x) * 10;
      const top = Math.sign(y - previousPoint.y) * 10;
      console.log(left, top);
      wrapperElement.scrollBy({ left, top });
    },
  };

  return {
    createPenTool,
    createEraserTool,
    panTool,
  };
}

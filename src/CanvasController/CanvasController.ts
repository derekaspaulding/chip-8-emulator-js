export default class CanvasController {
  private CONTAINER_CLASS = "canvas-container";
  private canvasCTX: CanvasRenderingContext2D;
  private height = 0;
  private width = 0;
  private get pixelSize() {
    return this.width / 64;
  }

  constructor() {
    const containerDiv = document.querySelector(`.${this.CONTAINER_CLASS}`);
    this.width = containerDiv.clientWidth * 0.75;
    this.height = this.width / 2;
    const canvasElement = document.createElement("canvas");
    canvasElement.width = this.width;
    canvasElement.height = this.height;
    canvasElement.className = "game-canvas";
    containerDiv.appendChild(canvasElement);

    this.canvasCTX = canvasElement.getContext("2d");
    this.canvasCTX.fillRect(0, 0, this.width, this.height);
  }

  doSomething() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.canvasCTX.fillStyle = x % 2 === y % 2 ? "#9d9b8a" : "#000";
        this.canvasCTX.fillRect(
          this.pixelSize * x,
          this.pixelSize * y,
          this.pixelSize,
          this.pixelSize
        );
      }
    }
  }
}

import CanvasController from "../CanvasController/CanvasController";
import { parseInstruction } from "./Instructions";

export enum PROGRAM_STATUS {
  NOT_STARTED,
  RUNNING,
  DONE
}

export default class Interpreter {
  private memory = new Uint8Array(4096);
  private pc = 512;
  private registers = new Uint8Array(16);
  private stack = new Uint16Array(16);
  private sp = 0;

  status = PROGRAM_STATUS.NOT_STARTED;

  constructor(rom: ArrayBuffer) {
    this.memory.set(new Uint8Array(rom), 512);
    console.log(this.memory);
  }

  runNextInstruction = () => {
    if (this.status === PROGRAM_STATUS.NOT_STARTED) {
      this.status = PROGRAM_STATUS.RUNNING;
    }
    const instruction = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
    const parsedInstruction = parseInstruction(instruction);
    if (parsedInstruction) {
      console.log(
        `PC: ${this.pc} ${parsedInstruction.type} ${parsedInstruction.raw}`
      );
    }

    this.pc += 2;
    if (this.pc >= this.memory.length) {
      this.status = PROGRAM_STATUS.DONE;
    }
  };
}

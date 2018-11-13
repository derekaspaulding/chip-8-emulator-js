import CanvasController from "./CanvasController";
import Interpreter, { PROGRAM_STATUS } from "./Interpreter/Interpreter";

CanvasController.doSomething();

const fileUploadInput = document.querySelector(
  "#rom-upload"
) as HTMLInputElement;

fileUploadInput.onchange = () => {
  readFile(fileUploadInput.files[0])
    .then(contents => {
      const interpreter = new Interpreter(contents);
      while (interpreter.status !== PROGRAM_STATUS.DONE)
        interpreter.runNextInstruction();
    })
    .catch(console.log);
};

const readFile = (romFile: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(romFile);
    fileReader.onerror = reject;
    fileReader.onloadend = () => {
      resolve(fileReader.result as ArrayBuffer);
    };
  });
};

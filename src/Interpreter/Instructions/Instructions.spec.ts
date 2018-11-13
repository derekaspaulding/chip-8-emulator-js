import { parseInstruction, InvalidInstructionError } from "./Instructions";
import {
  NoArgInstruction,
  NoArgInstructionType,
  AddressArgInstruction,
  AddressArgInstructionType,
  RegisterByteInstruction,
  RegisterByteInstructionType,
  TwoRegisterInstruction,
  TwoRegisterInstructionType,
  SingleRegisterInstruction,
  SingleRegisterInstructionType,
  DrawInstruction,
  Instruction
} from "./InstructionTypes";

/*
 * Abbreviations for the instructions in the test descriptions:
 * - nnn: A 12 bit value
 * - x: 4 bit value, typically an index of a register
 * - y: 4 bit value, typically an index of a register
 * - kk: 1 byte value
 * Anything else is a literal value.
 */

describe("parseInstruction", () => {
  it("should return a CLS NoArgInstruction for instruction 00E0", () => {
    const testInstruction = 0x00e0;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: NoArgInstruction = {
      raw: "00E0",
      type: NoArgInstructionType.CLS
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a RET NoArgInstruction for instruction 00EE", () => {
    const testInstruction = 0x00ee;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: NoArgInstruction = {
      raw: "00EE",
      type: NoArgInstructionType.RET
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SYS AddressArgInstruction for instruction 0x0nnn for nnn >= 0x200", () => {
    const instructions = [];
    const parsedInstructions: Instruction[] = [];
    for (let instruction = 0x200; instruction <= 0x0fff; instruction++) {
      instructions.push(instruction);
    }

    instructions.forEach(instruction => {
      try {
        const parsedInstruction = parseInstruction(instruction);
        parsedInstructions.push(parsedInstruction);
      } catch {
        // ignore
      }
    });

    expect(parsedInstructions.length).toEqual(instructions.length);
  });

  it("should throw an InvalidInstructionError for any other 0hhh instruction", () => {
    const validInstructions = [0x00e0, 0x00ee];
    const failedTestInstructions = [];
    for (let instruction = 0; instruction < 0x0200; instruction++) {
      if (!validInstructions.includes(instruction)) {
        try {
          // expect this to throw
          parseInstruction(instruction);
          // if we are here, the instruction didn't throw
          failedTestInstructions.push(instruction.toString(16));
        } catch {
          // ignore
        }
      }
    }

    expect(failedTestInstructions.length).toEqual(0);
  });

  it("should return a JP AddressArgInstruction with the specified address for instruction 1nnn", () => {
    const testInstruction = 0x1e32;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: AddressArgInstruction = {
      raw: "1E32",
      type: AddressArgInstructionType.JP,
      address: 0xe32
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a CALL AddressArgInstruction with the specified address for instruction 2nnn", () => {
    const testInstruction = 0x2def;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: AddressArgInstruction = {
      raw: "2DEF",
      type: AddressArgInstructionType.CALL,
      address: 0xdef
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SE RegisterByteInstruction with the specified register and byte values for instruction 3xkk", () => {
    const testInstruction = 0x3efd;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: RegisterByteInstruction = {
      raw: "3EFD",
      type: RegisterByteInstructionType.SE,
      register: 0xe,
      byte: 0xfd
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SNE RegisterByteInstruction with the specified register and byte values for instruction 4xkk", () => {
    const testInstruction = 0x4efd;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: RegisterByteInstruction = {
      raw: "4EFD",
      type: RegisterByteInstructionType.SNE,
      register: 0xe,
      byte: 0xfd
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SE TwoRegisterInstruction with the specified registers for instruction 5xy0", () => {
    const testInstruction = 0x53f0;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "53F0",
      type: TwoRegisterInstructionType.SE,
      Vx: 0x3,
      Vy: 0xf
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should throw an InvalidInstructionError for any other instruction starting with 5xy", () => {
    for (let lastFourBits = 0x1; lastFourBits <= 0xf; lastFourBits++) {
      const testInstruction = 0x52c0 | lastFourBits;
      expect(() => parseInstruction(testInstruction)).toThrow(
        new InvalidInstructionError(testInstruction)
      );
    }
  });

  it("should return a LD RegisterByteInstruction with the specified register and byte values for instruction 6xkk", () => {
    const testInstruction = 0x67fe;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: RegisterByteInstruction = {
      raw: "67FE",
      type: RegisterByteInstructionType.LD,
      register: 0x7,
      byte: 0xfe
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a ADD RegisterByteInstruction with the specified register and byte values for instruction 7xkk", () => {
    const testInstruction = 0x78e2;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: RegisterByteInstruction = {
      raw: "78E2",
      type: RegisterByteInstructionType.ADD,
      register: 0x8,
      byte: 0xe2
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a LD TwoRegisterInstruction with the specified registers for instruction 8xy0", () => {
    const testInstruction = 0x8350;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "8350",
      type: TwoRegisterInstructionType.LD,
      Vx: 0x3,
      Vy: 0x5
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a OR TwoRegisterInstruction with the specified registers for instruction 8xy1", () => {
    const testInstruction = 0x8f41;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "8F41",
      type: TwoRegisterInstructionType.OR,
      Vx: 0xf,
      Vy: 0x4
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a AND TwoRegisterInstruction with the specified registers for instruction 8xy2", () => {
    const testInstruction = 0x8e62;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "8E62",
      type: TwoRegisterInstructionType.AND,
      Vx: 0xe,
      Vy: 0x6
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a XOR TwoRegisterInstruction with the specified registers for instruction 8xy3", () => {
    const testInstruction = 0x8bc3;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "8BC3",
      type: TwoRegisterInstructionType.XOR,
      Vx: 0xb,
      Vy: 0xc
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a ADD TwoRegisterInstruction with the specified registers for instruction 8xy4", () => {
    const testInstruction = 0x85a4;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "85A4",
      type: TwoRegisterInstructionType.ADD,
      Vx: 0x5,
      Vy: 0xa
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SUB TwoRegisterInstruction with the specified registers for instruction 8xy5", () => {
    const testInstruction = 0x8b05;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "8B05",
      type: TwoRegisterInstructionType.SUB,
      Vx: 0xb,
      Vy: 0x0
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SHR SingleRegisterInstruction with the specified registers for instruction 8x06", () => {
    const testInstruction = 0x8206;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "8206",
      type: SingleRegisterInstructionType.SHR,
      register: 0x2
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SUBN TwoRegisterInstruction with the specified registers for instruction 8xy7", () => {
    const testInstruction = 0x8df7;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "8DF7",
      type: TwoRegisterInstructionType.SUBN,
      Vx: 0xd,
      Vy: 0xf
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SHL SingleRegisterInstruction with the specified registers for instruction 8x0E", () => {
    const testInstruction = 0x8e0e;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "8E0E",
      type: SingleRegisterInstructionType.SHL,
      register: 0xe
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SNE TwoRegisterInstruction with the specified registers for instruction 9xy0", () => {
    const testInstruction = 0x9bf0;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: TwoRegisterInstruction = {
      raw: "9BF0",
      type: TwoRegisterInstructionType.SNE,
      Vx: 0xb,
      Vy: 0xf
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should throw an InvalidInstructionError for any other instruction starting with 9xy", () => {
    for (let lastFourBits = 0x1; lastFourBits <= 0xf; lastFourBits++) {
      const testInstruction = 0x9af0 | lastFourBits;
      expect(() => parseInstruction(testInstruction)).toThrow(
        new InvalidInstructionError(testInstruction)
      );
    }
  });

  it("should return a LD AddressArgInstruction with the specified address for instruction Annn", () => {
    const testInstruction = 0xa846;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: AddressArgInstruction = {
      raw: "A846",
      type: AddressArgInstructionType.LD,
      address: 0x846
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a JPADD AddressArgInstruction with the specified address for instruction Bnnn", () => {
    const testInstruction = 0xbf29;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: AddressArgInstruction = {
      raw: "BF29",
      type: AddressArgInstructionType.JPADD,
      address: 0xf29
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a RND RegisterByteInstruction with the specified register and byte values for instruction Cxkk", () => {
    const testInstruction = 0xcbff;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: RegisterByteInstruction = {
      raw: "CBFF",
      type: RegisterByteInstructionType.RND,
      register: 0xb,
      byte: 0xff
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a DRW DrawInstruction with the specified register and n values for instruction Dxyn", () => {
    const testInstruction = 0xd58a;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: DrawInstruction = {
      raw: "D58A",
      type: "DRW",
      Vx: 0x5,
      Vy: 0x8,
      n: 0xa
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a DRW DrawInstruction with the specified register and n values for instruction Dxyn", () => {
    const testInstruction = 0xd58a;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: DrawInstruction = {
      raw: "D58A",
      type: "DRW",
      Vx: 0x5,
      Vy: 0x8,
      n: 0xa
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SKP SingleRegisterInstruction with the specified register for instruction Ex9E", () => {
    const testInstruction = 0xe89e;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "E89E",
      type: SingleRegisterInstructionType.SKP,
      register: 0x8
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a SKNP SingleRegisterInstruction with the specified register for instruction ExA1", () => {
    const testInstruction = 0xeda1;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "EDA1",
      type: SingleRegisterInstructionType.SKNP,
      register: 0xd
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should throw an InvalidInstructionError for any other instruction starting with Ex", () => {
    const validSecondByteValues = [0x9e, 0xa1];
    for (let secondByte = 0x0; secondByte <= 0xff; secondByte++) {
      if (!validSecondByteValues.includes(secondByte)) {
        const testInstruction = 0xe200 | secondByte;
        expect(() => parseInstruction(testInstruction)).toThrow(
          new InvalidInstructionError(testInstruction)
        );
      }
    }
  });

  it("should return a DT2R SingleRegisterInstruction with the specified register for instruction Fx07", () => {
    const testInstruction = 0xf607;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "F607",
      type: SingleRegisterInstructionType.DT2R,
      register: 0x6
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a LDK SingleRegisterInstruction with the specified register for instruction Fx0A", () => {
    const testInstruction = 0xfa0a;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "FA0A",
      type: SingleRegisterInstructionType.LDK,
      register: 0xa
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a R2DT SingleRegisterInstruction with the specified register for instruction Fx15", () => {
    const testInstruction = 0xf415;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "F415",
      type: SingleRegisterInstructionType.R2DT,
      register: 0x4
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a R2ST SingleRegisterInstruction with the specified register for instruction Fx18", () => {
    const testInstruction = 0xf218;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "F218",
      type: SingleRegisterInstructionType.R2ST,
      register: 0x2
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a ADD SingleRegisterInstruction with the specified register for instruction Fx1E", () => {
    const testInstruction = 0xfc1e;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "FC1E",
      type: SingleRegisterInstructionType.ADD,
      register: 0xc
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a LDF SingleRegisterInstruction with the specified register for instruction Fx29", () => {
    const testInstruction = 0xf129;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "F129",
      type: SingleRegisterInstructionType.LDF,
      register: 0x1
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a BCD SingleRegisterInstruction with the specified register for instruction Fx33", () => {
    const testInstruction = 0xf033;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "F033",
      type: SingleRegisterInstructionType.BCD,
      register: 0x0
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a RMEM SingleRegisterInstruction with the specified register for instruction Fx55", () => {
    const testInstruction = 0xfe55;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "FE55",
      type: SingleRegisterInstructionType.RMEM,
      register: 0xe
    };
    expect(parsedInstruction).toEqual(expected);
  });

  it("should return a MEMR SingleRegisterInstruction with the specified register for instruction Fx65", () => {
    const testInstruction = 0xf465;

    const parsedInstruction = parseInstruction(testInstruction);

    const expected: SingleRegisterInstruction = {
      raw: "F465",
      type: SingleRegisterInstructionType.MEMR,
      register: 0x4
    };
    expect(parsedInstruction).toEqual(expected);
  });

  // Parameterized Tests for Invalid Fhhh instructions
  it("should throw an InvalidInstructionError for any other instruction starting with Fx", () => {
    const validSecondByteValues = [
      0x07,
      0x0a,
      0x15,
      0x18,
      0x1e,
      0x29,
      0x33,
      0x55,
      0x65
    ];
    for (let secondByte = 0x0; secondByte <= 0xff; secondByte++) {
      if (!validSecondByteValues.includes(secondByte)) {
        const testInstruction = 0xf800 | secondByte;
        expect(() => parseInstruction(testInstruction)).toThrow(
          new InvalidInstructionError(testInstruction)
        );
      }
    }
  });
});

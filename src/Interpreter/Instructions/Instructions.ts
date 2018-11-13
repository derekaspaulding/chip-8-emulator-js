import {
  Instruction,
  TwoRegisterInstruction,
  TwoRegisterInstructionType,
  DrawInstruction,
  SingleRegisterInstruction,
  SingleRegisterInstructionType,
  NoArgInstruction,
  AddressArgInstruction,
  AddressArgInstructionType,
  NoArgInstructionType,
  RegisterByteInstruction,
  RegisterByteInstructionType
} from "./InstructionTypes";
export class InvalidInstructionError extends Error {
  constructor(instruction: number) {
    const message = `Invalid Instruction: ${getRawInstructionValue(
      instruction
    )}`;
    super(message);
  }
}

export const parseInstruction = (instruction: number): Instruction => {
  const zeroedInstruction = ~(-1 << 16) & instruction;
  const upper4Bits = ((0b1111 << 12) & zeroedInstruction) >> 12;
  switch (upper4Bits) {
    case 0x0:
      return handleZeroBasedInstruction(instruction);
    case 0x1:
    // Fall Through
    case 0x2:
      return handleAddressInstruction(instruction, upper4Bits);
    case 0x3:
    // Fall Through
    case 0x4:
      return handleRegisterByteInstruction(instruction);
    case 0x5:
      return handleSkipEqual(instruction);
    case 0x6:
    // Fall Through
    case 0x7:
      return handleRegisterByteInstruction(instruction);
    case 0x8:
      return handleEightBasedInstruction(instruction);
    case 0x9:
      return handleSkipNotEqual(instruction);
    case 0xa:
    // Fall Through
    case 0xb:
      return handleAddressInstruction(instruction, upper4Bits);
    case 0xc:
      return handleRegisterByteInstruction(instruction);
    case 0xd:
      return handleDrawInstruction(instruction);
    case 0xe:
      return handleKeyInstruction(instruction);
    case 0xf:
      return handleFBasedInstruction(instruction);
    default:
      throw new InvalidInstructionError(instruction);
  }
};

const handleSkipNotEqual = (instruction: number): TwoRegisterInstruction => {
  if ((instruction & 0xf) === 0) {
    return {
      type: TwoRegisterInstructionType.SNE,
      raw: getRawInstructionValue(instruction),
      Vx: (instruction >> 8) & 0xf,
      Vy: (instruction >> 4) & 0xf
    };
  }
  throw new InvalidInstructionError(instruction);
};

const handleSkipEqual = (instruction: number): TwoRegisterInstruction => {
  if ((instruction & 0xf) === 0) {
    return {
      type: TwoRegisterInstructionType.SE,
      raw: getRawInstructionValue(instruction),
      Vx: (instruction >> 8) & 0xf,
      Vy: (instruction >> 4) & 0xf
    };
  }
  throw new InvalidInstructionError(instruction);
};

const handleDrawInstruction = (instruction: number): DrawInstruction => ({
  type: "DRW",
  Vx: (instruction >> 8) & 0xf,
  Vy: (instruction >> 4) & 0xf,
  n: instruction & 0xf,
  raw: getRawInstructionValue(instruction)
});

const handleKeyInstruction = (
  instruction: number
): SingleRegisterInstruction => {
  const register = (instruction >> 8) & 0xf;
  const raw = getRawInstructionValue(instruction);
  const lastEightBits = instruction & 0xff;
  let type: SingleRegisterInstructionType;

  switch (lastEightBits) {
    case 0x9e:
      type = SingleRegisterInstructionType.SKP;
      break;
    case 0xa1:
      type = SingleRegisterInstructionType.SKNP;
      break;
    default:
      throw new InvalidInstructionError(instruction);
  }

  return { type, raw, register };
};

const handleZeroBasedInstruction = (
  instruction: number
): NoArgInstruction | AddressArgInstruction => {
  const lastTwelveBits = instruction & ~(0b1111 << 12);
  if (lastTwelveBits >= 0x200) {
    return {
      type: AddressArgInstructionType.SYS,
      address: lastTwelveBits,
      raw: getRawInstructionValue(instruction)
    };
  }
  switch (lastTwelveBits) {
    case 0x0e0:
      return {
        type: NoArgInstructionType.CLS,
        raw: getRawInstructionValue(instruction)
      };
    case 0x0ee:
      return {
        type: NoArgInstructionType.RET,
        raw: getRawInstructionValue(instruction)
      };
    default:
      throw new InvalidInstructionError(instruction);
  }
};

const handleEightBasedInstruction = (
  instruction: number
): SingleRegisterInstruction | TwoRegisterInstruction => {
  const lastFourBits = instruction & 0xf;
  const firstRegister = (instruction >> 8) & 0xf;
  const secondRegister = (instruction >> 4) & 0xf;
  const raw = getRawInstructionValue(instruction);
  let twoRegisterType: TwoRegisterInstructionType;
  let singleRegisterType: SingleRegisterInstructionType;
  switch (lastFourBits) {
    case 0x0:
      twoRegisterType = TwoRegisterInstructionType.LD;
      break;
    case 0x1:
      twoRegisterType = TwoRegisterInstructionType.OR;
      break;
    case 0x2:
      twoRegisterType = TwoRegisterInstructionType.AND;
      break;
    case 0x3:
      twoRegisterType = TwoRegisterInstructionType.XOR;
      break;
    case 0x4:
      twoRegisterType = TwoRegisterInstructionType.ADD;
      break;
    case 0x5:
      twoRegisterType = TwoRegisterInstructionType.SUB;
      break;
    case 0x6:
      singleRegisterType = SingleRegisterInstructionType.SHR;
      break;
    case 0x7:
      twoRegisterType = TwoRegisterInstructionType.SUBN;
      break;
    case 0xe:
      singleRegisterType = SingleRegisterInstructionType.SHL;
      break;
    default:
      throw new InvalidInstructionError(instruction);
  }
  if (singleRegisterType !== undefined) {
    return {
      raw,
      type: singleRegisterType,
      register: firstRegister
    };
  }

  return {
    raw,
    type: twoRegisterType,
    Vx: firstRegister,
    Vy: secondRegister
  };
};

const handleFBasedInstruction = (
  instruction: number
): SingleRegisterInstruction => {
  const raw = getRawInstructionValue(instruction);
  const register = (instruction >> 8) & 0xf;
  const lastEightBits = instruction & 0xff;
  let type: SingleRegisterInstructionType;
  switch (lastEightBits) {
    case 0x07:
      type = SingleRegisterInstructionType.DT2R;
      break;
    case 0x0a:
      type = SingleRegisterInstructionType.LDK;
      break;
    case 0x15:
      type = SingleRegisterInstructionType.R2DT;
      break;
    case 0x18:
      type = SingleRegisterInstructionType.R2ST;
      break;
    case 0x1e:
      type = SingleRegisterInstructionType.ADD;
      break;
    case 0x29:
      type = SingleRegisterInstructionType.LDF;
      break;
    case 0x33:
      type = SingleRegisterInstructionType.BCD;
      break;
    case 0x55:
      type = SingleRegisterInstructionType.RMEM;
      break;
    case 0x65:
      type = SingleRegisterInstructionType.MEMR;
      break;
    default:
      throw new InvalidInstructionError(instruction);
  }

  return { raw, type, register };
};

const handleAddressInstruction = (
  instruction: number,
  firstFourBits: number
): AddressArgInstruction => {
  const address = instruction & 0xfff;
  const raw = getRawInstructionValue(instruction);
  let type;
  switch (firstFourBits) {
    case 0x1:
      type = AddressArgInstructionType.JP;
      break;
    case 0x2:
      type = AddressArgInstructionType.CALL;
      break;
    case 0xa:
      type = AddressArgInstructionType.LD;
      break;
    case 0xb:
      type = AddressArgInstructionType.JPADD;
      break;
    default:
      throw new InvalidInstructionError(instruction);
  }
  return { type, address, raw };
};

const handleRegisterByteInstruction = (
  instruction: number
): RegisterByteInstruction => {
  const upperFourBits = (instruction >> 12) & 0xf;
  const register = (instruction >> 8) & 0xf;
  const byte = instruction & 0xff;
  let type;
  switch (upperFourBits) {
    case 0x3:
      type = RegisterByteInstructionType.SE;
      break;
    case 0x4:
      type = RegisterByteInstructionType.SNE;
      break;
    case 0x6:
      type = RegisterByteInstructionType.LD;
      break;
    case 0x7:
      type = RegisterByteInstructionType.ADD;
      break;
    case 0xc:
      type = RegisterByteInstructionType.RND;
      break;
    default:
      throw new InvalidInstructionError(instruction);
  }
  return {
    type,
    register,
    byte,
    raw: getRawInstructionValue(instruction)
  };
};

const getRawInstructionValue = (instruction: number) => {
  const stringValue = instruction.toString(16).toUpperCase();
  return `${"0".repeat(4 - stringValue.length)}${stringValue}`;
};

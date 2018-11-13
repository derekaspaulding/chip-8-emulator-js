export enum NoArgInstructionType {
  CLS = "CLS",
  RET = "RET"
}

export interface NoArgInstruction {
  type: NoArgInstructionType;
  raw: string;
}

export enum AddressArgInstructionType {
  SYS = "SYS",
  JP = "JP",
  CALL = "CALL",
  LD = "LD",
  JPADD = "JPADD"
}

export interface AddressArgInstruction {
  type: AddressArgInstructionType;
  address: number;
  raw: string;
}

export enum RegisterByteInstructionType {
  SE = "SE",
  SNE = "SNE",
  LD = "LD",
  ADD = "ADD",
  RND = "RND"
}

export interface RegisterByteInstruction {
  type: RegisterByteInstructionType;
  register: number;
  byte: number;
  raw: string;
}

export enum SingleRegisterInstructionType {
  SHL = "SHL",
  SHR = "SHR",
  SKP = "SKP",
  SKNP = "SKNP",
  DT2R = "DT2R",
  R2DT = "R2DT",
  R2ST = "R2ST",
  LDK = "LDK",
  LDF = "LDF",
  BCD = "BCD",
  MEMR = "MEMR",
  RMEM = "RMEM",
  ADD = "ADD"
}

export interface SingleRegisterInstruction {
  type: SingleRegisterInstructionType;
  register: number;
  raw: string;
}

export enum TwoRegisterInstructionType {
  SE = "SE",
  LD = "LD",
  OR = "OR",
  AND = "AND",
  XOR = "XOR",
  ADD = "ADD",
  SUB = "SUB",
  SUBN = "SUBN",
  SNE = "SNE"
}

export interface TwoRegisterInstruction {
  type: TwoRegisterInstructionType;
  Vx: number;
  Vy: number;
  raw: string;
}

export interface DrawInstruction {
  type: "DRW";
  Vx: number;
  Vy: number;
  n: number;
  raw: string;
}

export type Instruction =
  | NoArgInstruction
  | AddressArgInstruction
  | RegisterByteInstruction
  | SingleRegisterInstruction
  | TwoRegisterInstruction
  | DrawInstruction;

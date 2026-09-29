import type { Module } from "./types";
import { llm01 } from "./modules/llm01";
import { llm02 } from "./modules/llm02";
import { llm03 } from "./modules/llm03";
import { llm04 } from "./modules/llm04";
import { llm05 } from "./modules/llm05";
import { llm06 } from "./modules/llm06";
import { llm07 } from "./modules/llm07";
import { llm08 } from "./modules/llm08";
import { llm09 } from "./modules/llm09";
import { llm10 } from "./modules/llm10";

export const MODULES: Module[] = [llm01, llm02, llm03, llm04, llm05, llm06, llm07, llm08, llm09, llm10];

export const getModule = (id: string): Module | undefined =>
  MODULES.find((m) => m.id.toLowerCase() === id.toLowerCase());

import { Xort } from "../xort";
import { BaseManager } from "./baseManager";

export class MemoryManager extends BaseManager {
    constructor(xort: Xort) {
        super(xort);
    }
}
import { WeakCache } from "@xort/of";
import { Xort } from "../xort"; 

export class BaseManager extends WeakCache {
    constructor(protected xort: Xort) {
        super();
    }
}
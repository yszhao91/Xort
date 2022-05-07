import { Xort } from "../xort";
import { WeakCache } from '../../of/core/cache';

export class BaseManager extends WeakCache {
    constructor(protected xort: Xort) {
        super();
    }
}
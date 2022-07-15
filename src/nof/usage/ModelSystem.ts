import { IStringDictionary } from '@/cga/utils/types';
import { ITimer } from 'object_frame';
import { ISystemQuery, System } from '../system';
export class LoaderSystem extends System {
    static queries: IStringDictionary<ISystemQuery> = {
  
    }
    execute(timer: ITimer) {
    }
}
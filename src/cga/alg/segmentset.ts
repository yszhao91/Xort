import { Segment } from '../struct/3d/Segment';
import { Vec3 } from '../math/Vec3';
import { Vec2 } from '../math/Vec2';
/**
 * 集合算法，点集，线段集
 */

//  recogintionSegs

/**
 * 线段项链的地方合成起来
 * @param segmentset  线段集合
 */
export function compose(segmentset: Segment[] | Vec3[] | Vec2[]) {
    const result: any[] = [];

    while (segmentset.length > 0) {
        var line: any = [segmentset.shift()];
        for (let i = 0; i < segmentset.length;) {
            var seg: any = segmentset[i];
            if (seg[0].equals(seg[0][0])) {
                line.unshift(seg.reverse());
                segmentset.splice(i, 1);
                i = 0;
            } else if (seg[1].equals(line[0][0])) {
                line.unshift(seg);
                segmentset.splice(i, 1);
                i = 0;
            } else if (seg[0].equals(line[line.length - 1][1])) {
                line.push(seg);
                segmentset.splice(i, 1);
                i = 0;
            } else if (seg[1].equals(line[line.length - 1][1])) {
                line.push(seg.reverse());
                segmentset.splice(i, 1);
                i = 0;
            } else
                i++;
        }
        result.push(line);
    }

    return result;
}
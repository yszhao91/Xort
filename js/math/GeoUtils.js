var GeoUtils={
    clone: function (ary) {
        var result = [];

        if (ary instanceof Array) {
            if (ary[0] !== undefined) {
                if (ary[0] instanceof Array)
                    for (var i = 0; i < ary.length; i++) {
                        result.push(GeometryUtils.clone(ary[i]));
                    }
                else {
                    if (ary[0].clone === undefined) {
                        if (ary instanceof Array)
                            console.error("元素不存在复制方法");
                        return undefined;
                    }

                    for (var i = 0; i < ary.length; i++) {
                        result.push(ary[i].clone());
                    }
                }
            }
        } else
            return ary.clone();

        return result;
    },
};
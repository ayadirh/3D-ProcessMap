define(['require', 'lodash', 'addFeatures'], function (require, _) {
    function convertLogScaleFunction(uniquelinking_) {
        // uniqueLinks_ = _.cloneDeep(uniquelinking_);
        uniqueLinks_ = JSON.parse(JSON.stringify(uniquelinking_))
        function logify(x){
            //taking the snallest factor for log as 1.0X
            const base = 1.04
            if(x == 1) {
                x = x+1;
            }
            return Math.log(x)/Math.log(base);
        }
        for (var i = 0; i < uniqueLinks_.length; i++) {
            console.warn("Checkpoint \u279D ",uniqueLinks_[i].allShort.val, uniqueLinks_[i].linkLength);
            // uniqueLinks_[i].linkLength = (uniqueLinks_[i].minTime.val + uniqueLinks_[i].binRange * (uniqueLinks_[i].bin - 1))
            // uniqueLinks_[i].linkCurvature =logify(uniqueLinks_[i].linkLength) / (uniqueLinks_[i].allShort.val)
            // uniqueLinks_[i].linkLength = logify(uniqueLinks_[i].linkLength)
            uniqueLinks_[i].linkLength = logify(uniqueLinks_[i].linkLength/1000)
            uniqueLinks_[i].linkCurvature =logify(uniqueLinks_[i].linkCurvature)
            uniqueLinks_[i].shortestPath = logify(uniqueLinks_[i].shortestPath/1000);
            uniqueLinks_[i].minTime.val = logify(uniqueLinks_[i].minTime.val/1000);
            uniqueLinks_[i].allShort.val = logify(uniqueLinks_[i].allShort.val/1000);
            uniqueLinks_[i].maxTime.val = logify(uniqueLinks_[i].maxTime.val/1000);
            uniqueLinks_[i].time = logify(uniqueLinks_[i].time/1000);
            uniqueLinks_[i].binRange  =    logify(uniqueLinks_[i].binRange/1000);
            uniqueLinks_[i].logScale = true; 
            uniqueLinks_[i].timeUnit = "seconds";
            
        };
        // console.warn("Hurray")
        return {
            uniqueLinks_: uniqueLinks_
        }
     }
    return {
        convertLogScaleFunction: convertLogScaleFunction
    };
})
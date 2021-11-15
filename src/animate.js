define(['require', 'lodash', 'timelinesChart'], function (require, _, TimelinesChart) {
    function animateFunction(givenData) {
        const minTime = _.minBy(givenData, 'time');
        const maxTime = _.maxBy(givenData, 'time');
        //console.log(new Date(maxTime.time));
        //console.log(maxDate, minDate);
        //var uniqLinking_ = _.toArray(_.uniq(_.map(givenData, 'case')));
        //console.log('friend: ', uniqLinking_);
        //const myData = getRandomData(false, uniqLinking_);
        // TimelinesChart()(document.body)
        //     .zScaleLabel('My Scale Units')
        //     .zQualitative(true)
        //     .dateMarker(new Date() - 365 * 24 * 60 * 60 * 1000) // Add a marker 1y ago
        //     .data(myData);
        // //console.log('Data is: ', myData);

        // function getRandomData(ordinal = false, uniqLinking_) {
        //     var ex = _.groupBy(givenData, "case");
        //     //console.log('here: ', ex);
        //     //console.log(typeof (uniqLinking_));
        //     const NGROUPS = uniqLinking_.length,
        //         MAXLINES = 4,
        //         MAXSEGMENTS = 2,
        //         MAXCATEGORIES = 2,
        //         MINTIME = new Date(minTime);

        //     const nCategories = Math.ceil(Math.random() * MAXCATEGORIES),
        //         //categoryLabels = ['A','B','C','D'];
        //         categoryLabels = csvTool.activities;

        //     return [...Array(NGROUPS).keys()].map(i => ({
        //         group: uniqLinking_[i],
        //         data: getGroupData(uniqLinking_[i])
        //     }));

        //     //
        //     function getGroupData(a) {
        //         //console.log('testing: ', a, ex[a]);
        //         return [...Array(_.size(ex[a])).keys()].map(i => ({
        //             label: ex[a][i]['activity'],
        //             data: getSegmentsData()
        //         }));

        //         //
        //         function getSegmentsData() {
        //             const nSegments = Math.ceil(Math.random() * MAXSEGMENTS),
        //                 segMaxLength = Math.round(((new Date()) - MINTIME) / nSegments);
        //             let runLength = MINTIME;

        //             return [...Array(nSegments).keys()].map(i => {
        //                 const tDivide = [Math.random(), Math.random()].sort(),
        //                     start = new Date(runLength.getTime() + tDivide[0] * segMaxLength),
        //                     end = new Date(runLength.getTime() + tDivide[1] * segMaxLength);

        //                 runLength = new Date(runLength.getTime() + segMaxLength);

        //                 return {
        //                     timeRange: [start, end],
        //                     val: ordinal ? categoryLabels[Math.ceil(Math.random() * nCategories)] : Math.random()
        //                     //labelVal: is optional - only displayed in the labels
        //                 };
        //             });
        //         }
        //     }
        // }
        return {
            minTime: minTime,
            maxTime: maxTime
        };
    }
    return { animateFunction: animateFunction };
});

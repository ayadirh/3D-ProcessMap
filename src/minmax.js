define(['require', 'lodash', 'getListsFromCSV'], function (require, _) {
    var csvTool = require('getListsFromCSV');
    min_temp = []
    max_temp = []
    for (i in csvTool.uniqueLinks) {
        min_temp.push({ 'time': Number.POSITIVE_INFINITY });
        max_temp.push({ 'time': Number.NEGATIVE_INFINITY });
    }
    min_linking_ = _.clone(csvTool.uniqueLinks);
    max_linking_ = _.clone(csvTool.uniqueLinks);
    _.merge(min_linking_, min_temp);

    var result = csvTool.links.filter(function (o1) {
        min_linking_.some(function (o2) {
            if (o1.source == o2.source && o1.target == o2.target && o1.time < o2.time) {
                //console.log('true');
                var index = _.findIndex(min_linking_, { source: o2.source, target: o2.target });
                min_linking_.splice(index, 1, { source: o2.source, target: o2.target, time: o1.time });
            }
        })
    });

    _.merge(max_linking_, max_temp);
    var result_ = csvTool.links.filter(function (o1) {
        max_linking_.some(function (o2) {
            if (o1.source == o2.source && o1.target == o2.target && o1.time > o2.time) {
                var index = _.findIndex(max_linking_, { source: o2.source, target: o2.target });
                max_linking_.splice(index, 1, { source: o2.source, target: o2.target, time: o1.time });
            }
        })
    });

    return {
        maxLinks: max_linking_,
        minLinks: min_linking_
    };
});
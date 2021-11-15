define(['require', 'lodash', 'getListsFromCSV'], function (require, _) {
    function addFeaturesFunction(linking_, bin) {
        // var csvTool = require('./getListsFromCSV');
        // var csvToolInstance = csvTool.getLists();
        // var linking_ = csvToolInstance.links;
        //sorting links
        linking_.sort(function (a, b) {
            if (a.source > b.source) { return 1; }
            else if (a.source < b.source) { return -1; }
            else {
                if (a.target > b.target) { return 1; }
                if (a.target < b.target) { return -1; }
                else if (a.time > b.time) { return 1; }
                else if (a.time < b.time) { return -1; }
                else { return 0; }
            }
        });

        //reference: http://jsfiddle.net/7HZcR/3/
        //any links with duplicate source and target get an incremented 'linknum'
        for (var i = 0; i < linking_.length; i++) {
            if (linking_[i].time == 0) {
                //when the time duration between two activities is 0, 1 sec is used. to avoid divide by zero
                console.warn('<<< addFeatures.js : when the time duration between event is 0, replacing with 1 second: >>>');
                linking_[i].time = 1000;
            }
            if (i != 0 &&
                linking_[i].source == linking_[i - 1].source &&
                linking_[i].target == linking_[i - 1].target) {
                linking_[i].linknum = linking_[i - 1].linknum + 1;
                // linking_[i].factor = linking_[i - 1].factor * linking_[i].time / linking_[i - 1].time;
                //to add minimum time between each source and target to each link data
                linking_[i].minTime = linking_[i - 1].minTime;
            }
            else {
                linking_[i].linknum = 1;
                // linking_[i].factor = 1;
                linking_[i].minTime = { val: linking_[i].time };
            };
        };

        //to calculate maximum time between each source and target to each link data
        for (var i = linking_.length - 1; i >= 0; i--) {
            // console.log('test ##43', linking_[i]);
            if (i != linking_.length - 1 &&
                linking_[i].source == linking_[i + 1].source &&
                linking_[i].target == linking_[i + 1].target) {
                linking_[i].maxTime = linking_[i + 1].maxTime;
            }
            else { linking_[i].maxTime = { val: linking_[i].time }; };
        };

        var binCount = bin;
        //to add bin time between each source and target to each link data
        for (var i = 0; i < linking_.length; i++) {
            linking_[i].binRange = (linking_[i].maxTime.val - linking_[i].minTime.val) / binCount;
            if (linking_[i].binRange == 0) {
                linking_[i].bin = 1;
                linking_[i].binRange = linking_[i].maxTime.val;
            }
            for (var x = 1; x <= binCount; x++) {
                if (linking_[i].time <= (x) * linking_[i].binRange + linking_[i].minTime.val) {
                    linking_[i].bin = x;
                    break;
                }
            }
        };

        //to calculate frequency
        for (var i = 0; i < linking_.length; i++) {
            if (i != 0 &&
                linking_[i].source == linking_[i - 1].source &&
                linking_[i].target == linking_[i - 1].target &&
                linking_[i].bin == linking_[i - 1].bin) {
                linking_[i - 1].frequency.val = linking_[i - 1].frequency.val + 1;
                linking_[i].frequency = linking_[i - 1].frequency;
            }
            else { linking_[i].frequency = { val: 1 }; };
        };
                        
        uniqueLinking_ = _.cloneDeep(linking_);
        //to get the unique links; not to repeat the displayed ones
        for (var i = 0; i < uniqueLinking_.length; i++) {
            if (i != 0 &&
                uniqueLinking_[i].source == uniqueLinking_[i - 1].source &&
                uniqueLinking_[i].target == uniqueLinking_[i - 1].target &&
                uniqueLinking_[i].bin == uniqueLinking_[i - 1].bin) {
                uniqueLinking_[i - 1].activity.push(uniqueLinking_[i].activity[0]);
                uniqueLinking_.splice(i, uniqueLinking_[i].frequency.val - 1);
            }
            else { };
        };

        //to calculate maximum freq of link data
        for (var i = 0; i < uniqueLinking_.length; i++) {
            if (i != 0) {
                uniqueLinking_[i - 1].highestFreq.val = (uniqueLinking_[i - 1].highestFreq.val > uniqueLinking_[i].frequency.val) ? uniqueLinking_[i - 1].highestFreq.val : uniqueLinking_[i].frequency.val;
                uniqueLinking_[i].highestFreq = uniqueLinking_[i - 1].highestFreq;
            } else {                
                uniqueLinking_[i].highestFreq = { val: uniqueLinking_[i].frequency.val};
            }
        }; 

        abbreviateStrings = function (eventName) {
            var splittedName = eventName.trim().split(" ");
            if (splittedName.length > 1) {
                var temp = "";
                for (var i = 0; i < splittedName.length; i++) {
                    temp += splittedName[i].charAt(0) + ".";
                }

                return temp;
            }
            return splittedName[0];
        };

        //check to find unique smallest links between two nodes, comparing both source and destination, to find shortest path
        for (var i = 0; i < uniqueLinking_.length; i++) {
            uniqueLinking_[i].shortestPath = uniqueLinking_[i].minTime.val;
            if (i != 0) {
                uniqueLinking_[i].allShort = uniqueLinking_[i - 1].allShort;
                if (uniqueLinking_[i].shortestPath < uniqueLinking_[0].allShort) {
                    uniqueLinking_[0].allShort.val = uniqueLinking_[i].shortestPath;
                }
            } else {
                uniqueLinking_[i].allShort = { val: uniqueLinking_[i].shortestPath };
            }
            for (var j = 0; j < uniqueLinking_.length; j++) {
                if (uniqueLinking_[i].source == uniqueLinking_[j].target && uniqueLinking_[i].target == uniqueLinking_[j].source) {
                    uniqueLinking_[i].shortestPath = uniqueLinking_[i].minTime.val < uniqueLinking_[j].minTime.val ? uniqueLinking_[i].minTime.val : uniqueLinking_[j].minTime.val;
                } else {
                }
                uniqueLinking_[i].linkLength = (uniqueLinking_[i].minTime.val + uniqueLinking_[i].binRange * (uniqueLinking_[i].bin - 1))
                uniqueLinking_[i].linkCurvature = (uniqueLinking_[i].linkLength) / (uniqueLinking_[i].allShort.val)
                uniqueLinking_[i].linkLengthLabel = uniqueLinking_[i].linkLength / 1000; //In seconds
                uniqueLinking_[i].sourceAbbreviated = abbreviateStrings(uniqueLinking_[i].source);
                uniqueLinking_[i].targetAbbreviated = abbreviateStrings(uniqueLinking_[i].target);
            }
        };
        console.log('Test AddFeatures.js #links: ', uniqueLinking_);
        return {
            uniqueLink: uniqueLinking_,
            links: linking_
        };
    }

    //console.log('#', uniqueLinking_);
    return {
        addFeaturesFunction: addFeaturesFunction,
        // uniqueLink: uniqueLinking_,
        // links: linking_
    };
});
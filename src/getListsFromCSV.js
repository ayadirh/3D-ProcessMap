// // https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript
define(['require', 'd3', 'lodash'], function (require, d3, _) {
  //replace var with let (block scopes)
  function getLists(csvData) {
    function unique(arr) {
      var u = {}, a = [];
      for (var i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
          a.push(arr[i]);
          u[arr[i]] = 1;
        }
      }
      return a;
    }
    // //https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
    function isIsoDate(str) {
      if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) { console.warn('<<< Milli seconds and Z missing at the end of ISO format - YYYY-MM-DDTHH:mm:ss . The graph may work >>>') };
      if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
      var d = new Date(str);
      return d.toISOString() === str;
    }
    var printOnceFlag = true;
    var activities = [];
    var cases = [];
    var linking = [];
    var givenData = [];
    if (csvData) {
      csvData.forEach(data => {
        try {
          if (!data.case) throw "No Case Column!";
          if (!data.activity) throw "No Activity Column!";
          if (!data.time) throw "No Time Column!";
        }
        catch (err) {
          console.error("Error in Given CSV data - ", err);
        }
        if (printOnceFlag) {
          if (!isIsoDate(data.time)) {
            console.error("<<< Date is not in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ). May lead to Inaccurate Results >>>");
          }
          printOnceFlag = false;
        }
        givenData.push({ 'case': data.case, 'activity': data.activity, 'time': Date.parse(data.time) });
        activities.push(data.activity);
        activities.push("start", "end");
        cases.push(data.case);
        linking.push({ case: data.case, activity: data.activity, time: Date.parse(data.time) });
      })
    } else {
      console.error("Input CSV data not avaialble")
    }
    // console.log('is time correct', givenData);
    activities = unique(activities);
    cases = unique(cases);
    var linking_ = [];
    var time_ = [];
    var activity_ = [];
    var temp = {};

    //we are grouping by case and extracting source and target for each case
    var ex = _.groupBy(linking, "case");
    for (key in ex) {
      var temp__ = [], time__ = [];
      var startEndLength = 40000;
      if(window.logScaledGraphFlag){} 
      else if(window.userScale) {
        console.log("<<< Scale is: ", window.userScale)
        startEndLength *=window.userScale;
      }
      if (ex[key][0]["activity"] != "start") {
        temp__ = ["start"];
        time__ = [(ex[key][0]["time"] - startEndLength)];
      }
      for (i in ex[key]) {
        temp__.push(ex[key][i]["activity"]);
        time__.push(ex[key][i]["time"]);
      };
      if (temp__.at(-1) != "end") {
        temp__.push("end");
        time__.push(time__.at(-1) + startEndLength);
      }
      for (var [index, cur] of temp__.entries()) {
        var nextIndex = index + 1;
        if (temp__[nextIndex] == undefined) {
          break;
        }
        linking_.push({ "source": cur, "target": temp__[nextIndex] });
      }
      //we are grouping by case and getting duration between two activities as time_
      for (var [index, cur] of time__.entries()) {
        var row = new Array();
        var nextIndex = index + 1;
        if (temp__[nextIndex] == undefined) {
          break;
        }
        time_.push({ "time": time__[nextIndex] - cur });
        // row.push({ "startTime": new Date(cur), "endTime": new Date(time__[nextIndex]) })
        row.push({ "startTime": cur, "endTime": time__[nextIndex], "case": key })
        //activity_.push({"activity": { "startTime": new Date(cur), "endTime": new Date(time__[nextIndex]) }});
        activity_.push({ "activity": row });
      }
    };
    linking_ = _.merge(linking_, time_);
    linking_ = _.merge(linking_, activity_);
    var uniqLinking_ = _.uniqWith(_.map(linking_, x => _.pick(x, ['source', 'target'])), _.isEqual);
    console.log('# Testing #uniqLinking_: ', uniqLinking_);
    return {
      givenData: givenData,
      activities: activities,
      links: linking_,
      uniqueLinks: uniqLinking_
    };
  }

  return {
    getLists: getLists
  };
});
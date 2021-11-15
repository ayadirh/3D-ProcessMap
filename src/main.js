define(['require', 'threeDForce', 'three', 'd3', 'dat', 'threeSprite', 'getListsFromCSV', 'addFeatures', 'animate', 'data', 'logScale'], function (require, ForceGraph3D, THREE, d3, dat, threeSprite) {
    var elem = document.getElementById('process-map');
    //console.log('by default is: ', elem);
    var gui = new dat.GUI();
    var controllerOne;
    var pData;
    var visualFlag = false;

    var drawChartFunction = function (data, scale, bin, caseOfInterest, nodeInwardPlacement, linkScaleRadio) {
        //pData = null;
        //var svg = d3.select("#process-map > *").remove();
        // svg.selectAll("*").remove();
        let logScaledGraphFlag = linkScaleRadio;
        window.logScaledGraphFlag = logScaledGraphFlag;
        window.userScale = scale;
        let csvTool = require('getListsFromCSV');
        let csvToolInstance = csvTool.getLists(data);
        let activities = csvToolInstance.activities;
        
        //var minmax = require('./minmax');
        let features = require('addFeatures');
        let logScale = require('logScale');
        let SpriteText = require('threeSprite');
        let featuresInstance = features.addFeaturesFunction(csvToolInstance.links, bin);
        let animateInstance = require('animate');
        let animate = animateInstance.animateFunction(csvToolInstance.givenData);

        let uniqueLinking_ = featuresInstance.uniqueLink;

        //scale as per the timerange
        //console.log('Scale :' , scale);
        //scale = 0.1;
        
        
        //const scale = scale;
        //scale = 1;
        var graphL;
        if (logScaledGraphFlag) {
            let logScaleInstance = logScale.convertLogScaleFunction(featuresInstance.uniqueLink);
            let loggedLinks = logScaleInstance.uniqueLinks_;
            console.log("<<< Check this logScaled json", loggedLinks);
            graphify(loggedLinks, logScaledGraphFlag)
        } else {
            graphify(uniqueLinking_, logScaledGraphFlag)
        }

        function graphify(inLink, logScaledGraphFlag) {
            // Process Map
            graphL = {
                nodes: [...activities.values()].map(i => ({ id: i })),
                links: [...inLink.values()]
            };
            let isRotationActive = false;
            const distance = 500;
            //const elem = document.getElementById('process-map');
            pData = ForceGraph3D()
                (elem)
                // .nodeThreeObject(({ id }) => new THREE.Mesh(
                //     new THREE.BoxGeometry(10 + Math.random() * 10, 10 + Math.random() * 10, 10 + Math.random() * 10),
                //     //   new THREE.SphereGeometry(Math.random() * 10),
                //     new THREE.MeshLambertMaterial({
                //         // color: Math.round(Math.random() * Math.pow(2, 24)),
                //         color: "#fffaf0",
                //         transparent: true,
                //         opacity: 0.45
                //     })
                // ))
                .graphData(graphL)
                .backgroundColor('#eeeeee')
                // .nodeThreeObject(node => {
                //     const sprite = new SpriteText(node.id);
                //     // sprite.material.depthWrite = false; // make sprite background transparent
                //     sprite.color = "#fffaf0";
                //     sprite.textHeight = 8;
                //     return sprite;
                //   })
                .linkDirectionalArrowLength(3.5)
                .linkDirectionalArrowRelPos(1)
                .linkCurvature(link => {
                    // temp = (link.minTime.val + link.binRange * (link.bin - 1)) / (link.allShort.val);
                    return 1 * link.linkCurvature;
                })
                .linkWidth(link => { return (0.8 + link.frequency.val / link.highestFreq.val * 7); })
                .linkAutoColorBy(link => { return link.bin; })
                .linkDirectionalParticleColor((link) => {
                    return '#de3163';
                })
                .linkDirectionalParticleWidth(4)
                .linkHoverPrecision(10)
                //.nodeAutoColorBy('group')
                .nodeLabel(node => `${node.id}`)
                // .linkLabel(link => `${link.sourceAbbreviated} \u279D ${link.targetAbbreviated} : ${(link.linkLengthLabel)} seconds (${((link.linkLengthLabel) / 3600).toPrecision(2)} hours) | ${"freq.".italics()} : ${(link.frequency.val)}`)
                .linkLabel(link => {
                    if (link.source.id == 'start' || link.target.id == 'end'){
                        return `${"freq.".italics()} : ${(link.frequency.val)}`
                        // return `${link.sourceAbbreviated} \u279D ${link.targetAbbreviated} : ${(link.linkLengthLabel)} seconds (${((link.linkLengthLabel) / 3600).toPrecision(2)} hours) | ${"freq.".italics()} : ${(link.frequency.val)}`
                    } else {
                        return `${link.sourceAbbreviated} \u279D ${link.targetAbbreviated} : ${(link.linkLengthLabel)} seconds (${((link.linkLengthLabel) / 3600).toPrecision(2)} hours) | ${"freq.".italics()} : ${(link.frequency.val)}`
                    }
                })
                .onLinkHover(link => {
                    if (link) {
                        elem.style.cursor = 'pointer';
                        console.log("<<< Length of the Curve ->", link.__curve.getLength());
                    }
                })
                .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
                .onNodeClick(node => {
                    // Aim at node from outside it
                    const distance = 200;
                    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                    pData.cameraPosition(
                        { x: node.x * distRatio, y: node.y, z: node.z }, // new position
                        node, // lookAt ({ x, y, z })
                        3000  // ms transition duration
                    );
                });

            // Spread nodes a little wider
            pData.d3Force('charge').strength(1);
            let initialPlacementDivisor = logScaledGraphFlag ? (1 + (nodeInwardPlacement / 100)) : ((1 + (nodeInwardPlacement / 100)) * 1000 * scale);
            pData.d3Force('link').distance(function (d) { return (d.shortestPath) / initialPlacementDivisor; });
            pData.d3Force('link').strength(function (d) { return 1; });
            //define GUI
            //https://github.com/vasturiano/3d-force-graph/blob/master/example/manipulate-link-force/index.html
            const Settings = function () {
                this.offset = 0;
            };
            const linkForce = pData.d3Force('link');
            const settings = new Settings();
            controllerOne = gui.add(settings, 'offset', 0, 40);
            controllerOne.onChange(updateLinkDistance);

            function updateLinkDistance() {
                window.userOffset = settings.offset;
                linkForce.distance(function (d) { return (((d.shortestPath) / (1000 * scale)) + settings.offset); });
                pData.numDimensions(3); // Re-heat simulation
            }

            // camera orbit
            let angle = 0;
            setInterval(() => {
                if (isRotationActive) {
                    pData.cameraPosition({
                        x: distance * Math.sin(angle),
                        z: distance * Math.cos(angle)
                    });
                    angle += Math.PI / 300;
                }
            }, 100);

            //to fix start and end on two side of the screen
            graphL.nodes.forEach(function (d) {
                if (d.id == 'start') {
                    d.color = 'green';
                } else if (d.id == 'end') {
                    d.color = 'red';
                }
            })
        }

        document.getElementById('startTesting').addEventListener('click', event => {
            testOutput = []
            //console.log('X', graphL);
            graphL.links.forEach(function (link) {
                temp_ = {
                    bin: link.bin,
                    binRange: link.binRange,
                    binnedTime: (link.minTime.val + link.binRange * (link.bin - 1)) / 1000,
                    binnedTimeII: link.linkLength,
                    frequency: link.frequency.val,
                    maxTime: link.maxTime.val / 1000,
                    minTime: link.minTime.val / 1000,
                    shortestPath: link.shortestPath / 1000,
                    source: link.source.id,
                    target: link.target.id,
                    time: link.time / 1000,
                    scale: scale
                }
                // pathfrequency: link.pathfrequency.val,
                temp = link.__curve
                temp_.threeJSLength = temp.getLength()
                temp_.curveLength = quadraticBezierLength(temp.v0.x, temp.v0.y, temp.v0.z, temp.v1.x, temp.v1.y, temp.v1.z, temp.v2.x, temp.v2.y, temp.v2.z);
                temp_.argumentLength = (link.shortestPath) / 1000
                temp_.allShort = (link.allShort.val) / 1000
                temp_.ratio1_L_argumentLength = temp_.curveLength / temp_.argumentLength
                temp_.ratio2_L_allShort = temp_.curveLength / temp_.allShort
                temp_.ratio3_L_binnedTime = temp_.curveLength / temp_.binnedTime
                // temp_.scale = window.scale
                testOutput.push(temp_)
            })
            console.log('# Test -> ', JSON.stringify(testOutput));
        });

        //https://gist.github.com/tunght13488/6744e77c242cc7a94859
        function quadraticBezierLength(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
            let a, b, c, u
            let v1x = x2 * 2
            let v1y = y2 * 2
            let v1z = z2 * 2
            let d = x1 - v1x + x3
            let d1 = y1 - v1y + y3
            let d2 = z1 - v1z + z3
            let e = v1x - 2 * x1
            let e1 = v1y - 2 * y1
            let e2 = v1z - 2 * z1
            let c1 = (a = 4 * (d * d + d1 * d1 + d2 * d2))
            c1 += b = 4 * (d * e + d1 * e1 + d2 * e2)
            c1 += c = e * e + e1 * e1 + e2 * e2
            c1 = 2 * Math.sqrt(c1)
            let a1 = 2 * a * (u = Math.sqrt(a))
            let u1 = b / u
            a = 4 * c * a - b * b
            c = 2 * Math.sqrt(c)
            return (
                (a1 * c1 + u * b * (c1 - c) + a * Math.log((2 * u + u1 + c1) / (u1 + c))) /
                (4 * a1)
            )
        }
        // Date.prototype.addMinutes = function (m) {
        //     this.setTime(this.getTime() + (m * 60 * 1000));
        //     return this;
        // }

        document.getElementById('animateTokens').addEventListener('click', () => {
            // [...Array(graphL.links.length).keys()].forEach(() => {
            //   const link = graphL.links[Math.floor(Math.random() * graphL.links.length)];
            //   pData.emitParticle(link);
            // });
            //to move animation by minute
            minuteFlag = false; //else set it false;
            //Mininum time increment for animation is considered as 1 seconds            
            var timer = minuteFlag ? 60000 : 1000; //60 seconds or 1 second
            window.tokenSpeed = 1;
            var speed = window.tokenSpeed * scale;
            // console.log("# GraphL.Links", graphL.links);
            // console.log(new Date(animate.minTime.time), new Date(animate.maxTime.time));
            // var startTime = animate.minTime.time - 60000 * scale; //From getListsFromCSV.js line 64
            // var endTime = animate.maxTime.time + 60000 * scale; //From getListsFromCSV.js line 64
            async function playAnimate(animate) {
                let timerPromise = new Promise(function (myResolve, myReject) {
                    //this could be optimized
                    // for (var i = animate.minTime.time, counter = 0; i < animate.maxTime.time; i = i + timer) {
                    for (var i = animate.minTime.time, counter = 0; i < animate.maxTime.time; i = i + timer) {
                        delay(i, counter);
                        counter++;
                    }
                });
                await timerPromise;
            }
            playAnimate(animate).then(display());
            function display() {
                console.log('-- Animation Ends --');
            }
            function delay(i, counter) {
                setTimeout(function () {
                    graphL.links.forEach((link) => {
                        for (j in link.activity) {
                            if (minuteFlag) {
                                if (link.activity[j].startTime <= i && link.activity[j].startTime > i - timer) {
                                    //console.log('Time: ', new Date(link.activity[j].startTime), new Date(i));
                                    console.log('Time: ', link.source.id, " --> ", link.target.id, " @ ", new Date(i));
                                    document.getElementById('animateLabel').innerHTML = new Date(i);
                                    pData.emitParticle(link, j, link.activity[j].case == caseOfInterest);
                                }
                            } else {
                                if (link.activity[j].startTime == i) {
                                    console.log('Time: ', link.source.id, " --> ", link.target.id, " @ ", new Date(i));
                                    document.getElementById('animateLabel').innerHTML = new Date(i);
                                    pData.emitParticle(link, j, link.activity[j].case == caseOfInterest);
                                }
                            }
                        }
                    })
                }, counter * timer / speed);
            }

        });
        document.getElementById('reset').addEventListener('click', () => {
            setTimeout(function () {
                window.location.reload();
            });
        });
    }

    function readFormElements() {
        var csv;
        const selectedFile = document.getElementById('eventlogs').files[0];
        const scale = document.getElementById('scale').value;
        const bin = document.getElementById('bin').value;
        const caseOfInterest = document.getElementById('caseOfInterest').value;
        const nodeInwardPlacement = document.getElementById('nodeInwardPlacement').value;
        const linkScaleRadio = document.getElementById('linear').checked ? false : true;
        // console.log(linkScaleRadio);
        let reader = new FileReader();
        reader.onload = function (e) {
            let contents = e.target.result;
            csv = parseContents(contents);
            //plot the data
            drawChartFunction(csv, parseInt(scale), parseInt(bin), caseOfInterest, parseInt(nodeInwardPlacement), linkScaleRadio);
        };
        reader.readAsText(selectedFile);
    }
    // parseContents method converts the input from into csv
    function parseContents(contents) {
        let element = document.getElementById('file-content');
        element.textContent = contents;
        return d3.csv.parse(contents);
    }
    var reset = '<form class="card p-2 needs-validation" id="formReset"><div id="AnimationTime"><p id="animateLabel"></p></div><div class="input-group"><button type="submit" id="reset" class="btn btn-secondary">Reset</button></div></form>'
    document.forms['formVisualize'].onsubmit = function (event) {
        event.preventDefault();
        event.stopPropagation();
        //to check if form is valid
        if (this.checkValidity() && !visualFlag) {
            readFormElements();
        };
        document.getElementById('formVisualize').outerHTML = reset;
        //visualFlag = true;

    }
});
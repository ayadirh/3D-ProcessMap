// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'lib',
    waitSeconds: 200,
    paths: {
        src: '../src',
        d3: 'https://d3js.org/d3.v3.min',
        lodash: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min',
        threeSprite: './three-spritetext.min',
        dat: './dat.gui',
        three: './three',
        threeDForce: './3d-force-graph - Copy',
        addFeatures: '../src/addFeatures',
        getListsFromCSV: '../src/getListsFromCSV',
        main: '../src/main',
        minmax: '../src/minmax',
        animate: '../src/animate',
        data: '../src/data',
        logScale: '../src/logScale',
        timelinesChart: './timelines-chart'
    },
    shim:{
        'data':{
            deps: ['d3']
        },
        'main':{
            deps: ['getListsFromCSV', 'addFeatures', 'three', 'animate', 'd3', 'data', 'dat', 'logScale','threeSprite']
        },        
        'getListsFromCSV':{
            deps: ['d3', 'lodash', 'data']
        },        
        'minmax':{deps:['lodash', 'getListsFromCSV']},
        'addFeatures':{deps:['lodash','getListsFromCSV']},
        'logScale':{deps:['lodash','addFeatures']},
        'animate': {deps:['require', 'lodash', 'getListsFromCSV','timelinesChart']}
    }
    // },
    // shim: {
    //     'd3.v3.min':{exports:'d3'},
    //     'lodash.min':{exports:'_'},
    //     'three':{exports: 'three'},
    //     'three-spritetext.min':{exports:'three-spritetext'},
    //     '3d-force-graph.min':{exports:'force3d'},
    //     'dat.gui':{exports:'dat'}
    // }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['src/main']);
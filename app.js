/*
    This is the heart of the platform - loading files, forking to petite, running gcc

 */
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

//windows support
var isWin = /^win/.test(process.platform);

if(isWin){
    orig_path_join = path.join;
    path.join = function(){
        var tmp = orig_path_join.apply(null,arguments);
        return tmp.replace(/\\/g,"/");
    }
}

//Initial params, don't change here, you can configure paths at the web-app
var params = {
    TESTS_PATH : path.join(__dirname,'tests'),
    OUTPUTS_PATH : path.join(__dirname, 'petite_outputs'),
    CODEGEN_PATH : path.join(__dirname, 'code-gen'),
    CODEGEN_EXE_PATH : path.join(__dirname, 'code-gen-exe'),
    CODEGEN_OUTPUT_PATH : path.join(__dirname, 'code-gen-outputs'),
    compilerDirectoryPath : path.join(__dirname, 'compiler')
}

var config_path = path.join(__dirname,'config.txt');

//load params from file if exists
if(fs.existsSync(config_path)){
    params = JSON.parse(fs.readFileSync(config_path,'utf8'));
}

var total=0;
var successCounter = 0;
var failCounter =0;
var testFiles;

var schemeUtil = path.join(__dirname,'util.scm');

var compilerPath = path.join(params.compilerDirectoryPath,'compiler.scm');
var spawn = require('child_process').spawn;


var headline = ""+
" _______  _______  _______  _______    _______  _______  _______   \n"+
"|       ||       ||       ||       |  |  _    ||       ||       |  \n"+
"|_     _||    ___||  _____||_     _|  | |_|   ||   _   ||_     _|  \n"+
"  |   |  |   |___ | |_____   |   |    |       ||  | |  |  |   |    \n"+
"  |   |  |    ___||_____  |  |   |    |  _   | |  |_|  |  |   |    \n"+
"  |   |  |   |___  _____| |  |   |    | |_|   ||       |  |   |    \n"+
"  |___|  |_______||_______|  |___|    |_______||_______|  |___|    \n\n";

var authors = ""+
"██████╗ ██╗   ██╗     █████╗ ██████╗ ██╗███████╗██╗            ██╗        ██████╗██╗  ██╗███████╗███╗   ██╗\n"+
" ██╔══██╗╚██╗ ██╔╝    ██╔══██╗██╔══██╗██║██╔════╝██║            ██║       ██╔════╝██║  ██║██╔════╝████╗  ██║\n"+
" ██████╔╝ ╚████╔╝     ███████║██████╔╝██║█████╗  ██║         ████████╗    ██║     ███████║█████╗  ██╔██╗ ██║\n"+
" ██╔══██╗  ╚██╔╝      ██╔══██║██╔══██╗██║██╔══╝  ██║         ██╔═██╔═╝    ██║     ██╔══██║██╔══╝  ██║╚██╗██║\n"+
" ██████╔╝   ██║       ██║  ██║██║  ██║██║███████╗███████╗    ██████║      ╚██████╗██║  ██║███████╗██║ ╚████║\n"+
" ╚═════╝    ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝    ╚═════╝       ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝\n";

var html = {
    small : function(str){
        console.log("<span style='font-size:12pt'>"+str+'</span>');
    },
    h1: function(str){
        console.log("<h2>"+str+"</h2>");
    },
    credits : function(str){
        console.log("<span style='color:dodgerblue;'>"+str+"</span>");
    },
    bold: function(str){
        console.log("<b>"+str+"</b>");
    },
    cmd: function(str){
        console.log("<span style='color:#d1d1d1;'>"+str+"</span>");
    },
    error:function(str){
        console.log("<span style='color:darkred;'>"+str+"</span>");
    },

}

/* compare Chez-Scheme (petite) output files and compiler results */
function generatePetiteOutput() {
    html.h1('Generating petite output files ..');

    var testList = '';
    var listItems = [];
    var results = '';
    var testFilePath, codeGenFilePath, petiteFilePath,pair;
    var errorOccurred = false;

    for(var i=0; i < testFiles.length; i++){
        testFilePath = path.join(params.TESTS_PATH,testFiles[i]);
        outputFilePath = path.join(params.OUTPUTS_PATH, testFiles[i].substr(0, testFiles[i].lastIndexOf('.')) + '.txt');

        if( typeOf(testFiles[i], 'scm') ){

            listItem = sc_makeList(["\""+testFiles[i]+"\"", "\""+testFilePath+"\"", "\""+outputFilePath+"\""]);
            listItems.push(listItem);
        }
    }
    testList = sc_makeList(listItems);

    html.bold("> running petite on environment ("+params.compilerDirectoryPath+')');
    var petite = spawn('petite',['-q'],{cwd: params.compilerDirectoryPath});

    petite.stdin.write( scm_loadCommand(compilerPath) );
    if(!errorOccurred) petite.stdin.write( scm_loadCommand(schemeUtil) );

    petite.stderr.on('data', function (data) {
        html.error('Oops! Error: '+ data);
        errorOccurred = true;
        petite.kill();
    });

    petite.stdout.on('data', function (data) {
        results += data;
    });

    petite.on('close', function (code) {
        if(errorOccurred){
            console.log('Exiting.. Please fix errors and try again.');
            return;
        }

        generateCodeGenOutput();
    });

    if(!errorOccurred) petite.stdin.write( scm_evalFileCommand(testList) );
}

/* compare Chez-Scheme (petite) output files and compiler results */
function generateCodeGenOutput() {
    html.h1('Generating code-gen .c output files ..');
    var errorOccurred = false;

    var testList = '';
    var listItems = [];
    var results = '';
    var testFilePath, codeGenFilePath, petiteFilePath,pair;

    for(var i=0; i < testFiles.length; i++){
        testFilePath = path.join(params.TESTS_PATH,testFiles[i]);
        codeGenCFilePath = path.join(params.CODEGEN_PATH,testFiles[i].substr(0, testFiles[i].lastIndexOf('.')) + '.c');

        if( typeOf(testFiles[i], 'scm') ){

            listItem = sc_makeList(["\""+testFiles[i]+"\"", "\""+testFilePath+"\"", "\""+codeGenCFilePath+"\""]);
            listItems.push(listItem);
        }
    }
    testList = sc_makeList(listItems);

    var petite = spawn('petite',['-q'],{cwd: params.compilerDirectoryPath});
    html.bold("> running petite on environment ("+params.compilerDirectoryPath+')');

    petite.stdin.write( scm_loadCommand(compilerPath) );
    if(!errorOccurred) petite.stdin.write( scm_loadCommand(schemeUtil) );

    petite.stderr.on('data', function (data) {
        html.error('Oops! Error: '+ data);
        errorOccurred = true;
        petite.kill();
    });

    petite.stdout.on('data', function (data) {
        console.log(data+"\n");
        results += data;
    });

    petite.on('close', function (code) {
        compileCodeGenOutput();
    });

    if(!errorOccurred) petite.stdin.write( scm_codegenCommand(testList) );
}

/* Generate code-gen output files and results */
function compileCodeGenOutput(){
    html.h1('Compiling code-gen .o output files ..');

    var current_i = 0;
    var codegenFilePath,outputFilePath,filename;


    function next(){
        if(current_i < testFiles.length){
            filename = testFiles[current_i];
            codegenFilePath = path.join(params.CODEGEN_PATH , filename.substr(0, filename.lastIndexOf('.')) + '.c');
            outputFilePath = path.join(params.CODEGEN_EXE_PATH , filename.substr(0, filename.lastIndexOf('.')) + '.o');
            outputFileResult = path.join(params.CODEGEN_OUTPUT_PATH , filename.substr(0, filename.lastIndexOf('.')) + '.txt');


            if( (filename == '.DS_Store')){
                current_i++;
                return next();
            }

            if(!fs.existsSync(codegenFilePath)){
                html.error(filename+" => Oops! "+codegenFilePath+" was not found.");
                current_i++;
                return next();
            }


            exec( gcc_command(codegenFilePath,outputFilePath),function (error, stdout, stderr) {
                //console.log('stdout: ' + stdout);

                if(stderr != ""){
                    html.error(filename+" => Oops! gcc Error occurred :\n"+stderr);
                    current_i++;

                    return next();
                }

                //console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                    current_i++;

                    return next();
                }

                exec( outputFilePath, function (error, stdout, stderr) {
                    if(stderr != ""){
                        html.error(filename+" => Oops! gcc Error occurred :\n"+stderr);
                        current_i++;

                        return next();
                    }

                    //console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                        current_i++;

                        return next();
                    }

                    console.info('writing results to file ..');
                    fs.writeFileSync(outputFileResult, stdout);
                    console.info('done');

                    current_i++;
                    next();
                });
            });
        }
        else{
            compareResults();
        }
    }

    next();
}



/* compare Chez-Scheme (petite) output files and compiler results */
function compareResults() {
    html.h1('Comparing petite and compiler output files ..\n');
    var errorOccurred = false;

    var testList = '';
    var listItems = [];
    var results = '';
    var testFilePath, codeGenFilePath, petiteFilePath,pair;

    for(var i=0; i < testFiles.length; i++){
        testFilePath = path.join(params.TESTS_PATH,testFiles[i]);
        codeGenFilePath = path.join(params.CODEGEN_OUTPUT_PATH,testFiles[i].substr(0, testFiles[i].lastIndexOf('.')) + '.txt');
        petiteFilePath = path.join(params.OUTPUTS_PATH,testFiles[i].substr(0, testFiles[i].lastIndexOf('.')) + '.txt');

        if( typeOf(testFiles[i], 'scm') ){
            total++;

            if( !fs.existsSync(codeGenFilePath) ){
                fileNotFoundError(testFiles[i],codeGenFilePath);
                failCounter++;
                continue;
            }

            if( !fs.existsSync(petiteFilePath) ){
                fileNotFoundError(testFiles[i],petiteFilePath);
                failCounter++;
                continue;
            }

            listItem = sc_makeList(["\""+testFiles[i]+"\"", "\""+codeGenFilePath+"\"", "\""+petiteFilePath+"\""]);
            listItems.push(listItem);
        }
    }
    testList = sc_makeList(listItems);


    var petite = spawn('petite',['-q'],{cwd: params.compilerDirectoryPath});
    html.bold("> running petite on environment ("+params.compilerDirectoryPath+')');

    petite.stdin.write( scm_loadCommand(compilerPath) );
    if(!errorOccurred) petite.stdin.write( scm_loadCommand(schemeUtil) );

    petite.stderr.on('data', function (data) {
        html.error('Oops! Error: '+ data);
        errorOccurred = true;
        petite.kill();
    });

    petite.stdout.on('data', function (data) {
        results += data;
    });

    petite.on('close', function (code) {
        console.log(results);
    });

    if(!errorOccurred) petite.stdin.write( scm_cmpFilesCommand(testList) );
}

function scm_cmpFilesCommand(list){
    var cmd = "( (do-and-exit cmp-list-files) '"+list+")";
    html.cmd(cmd);
    return cmd;
}

function gcc_command(input,output){
    var cmd = 'gcc '+input+' -o '+output;
    html.cmd(cmd);
    return cmd;
}
function scm_loadCommand(pathToFile){
    var cmd = "(load \"" + pathToFile +"\")";
    html.cmd(cmd);
    return cmd;
}

function scm_evalFileCommand(list){
    var cmd = "( (do-and-exit eval-files) '"+list+")";
    html.cmd(cmd);
    return cmd;
}

function scm_codegenCommand(list){
    var cmd = "( (do-and-exit compile-scheme-files) '"+list+")";
    html.cmd(cmd);
    return cmd;
}

function scm_exitCommand(code){
    var cmd = '(exit '+code+')';
    html.cmd(cmd);
    return cmd;
}

var run = function(){
    if(!startupTests()) return;
    testFiles = fs.readdirSync(params.TESTS_PATH);
    total=0;
    successCounter = 0;
    failCounter =0;

    html.credits(headline);
    html.credits(authors);
    console.log("cleaning old files..")
    deleteItems();
    generatePetiteOutput();
}

function sc_makePair(x,y){
    return '('+x+' '+y+')';
}

function sc_makeList(arr){
    var list = '( ';
    for(var i=0; i< arr.length; i++){
        list += ' ' + arr[i];
    }
    list += ' )';

    return list;
}

function typeOf(filename,ext){
    return (filename.indexOf('.'+ext) != -1);
}

function fileNotFoundError(file, filePath){
    html.error('('+file+') => FAILED: file '+filePath+' not found');
}


/*
 @name :     deleteFolderRecursive

 @purpose:   deleting a directory with all files and sub-directories
 @params:    path : absolute path to directory
 @return:    void
 @throws:    fs errors if they occur
 */
var deleteFolderRecursive = function(path,deleteSelf,extention) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recursion
                if(!extention) deleteFolderRecursive(curPath);
            } else { // delete file
                if(extention){
                    if(curPath.lastIndexOf(extention) != -1){
                        fs.unlinkSync(curPath);
                    }
                }
                else{
                    fs.unlinkSync(curPath);
                }
            }
        });
        if( (deleteSelf == undefined) || deleteSelf ){
            fs.rmdirSync(path);
        }
    }
};

function startupTests(){
    var errors = 0;
    errors += testDir("params.TESTS_PATH", params.TESTS_PATH);
    errors += testDir("params.OUTPUTS_PATH", params.OUTPUTS_PATH);
    errors += testDir("params.CODEGEN_PATH", params.CODEGEN_PATH);
    errors += testDir("params.CODEGEN_EXE_PATH", params.CODEGEN_EXE_PATH);
    errors += testDir("params.CODEGEN_OUTPUT_PATH", params.CODEGEN_OUTPUT_PATH);
    errors += testDir("params.compilerDirectoryPath", params.compilerDirectoryPath);

    if(errors > 0){
        console.log('\nBAD Configuration. Please correct errors before you continue\n');
        return false;
    }

    return true;
}

function testDir(name,pathTo){
    console.info('checking valid params: ');
    console.info(name + '=> '+ pathTo + ':');
    if(fs.existsSync(pathTo)){
        console.info('OK');
        return 0;
    }
    console.error('FAILED');
    return 1;
}

function deleteItems(){
    deleteFolderRecursive(params.OUTPUTS_PATH,false);
    deleteFolderRecursive(params.CODEGEN_EXE_PATH,false);
    deleteFolderRecursive(params.CODEGEN_OUTPUT_PATH,false);
    deleteFolderRecursive(params.CODEGEN_PATH,false,'.c');

}

module.exports.run = run;
module.exports.params = params;
module.exports.setParams = function(userParams){
        params.TESTS_PATH = userParams.TESTS_PATH;
        params.OUTPUTS_PATH = userParams.OUTPUTS_PATH;
        params.CODEGEN_PATH = userParams.CODEGEN_PATH;
        params.CODEGEN_EXE_PATH = userParams.CODEGEN_EXE_PATH;
        params.CODEGEN_OUTPUT_PATH = userParams.CODEGEN_OUTPUT_PATH;
        params.compilerDirectoryPath = userParams.compilerDirectoryPath;

    fs.writeFileSync(config_path,JSON.stringify(params));
};
module.exports.runTest = function(filename){
    var testFilePath = path.join(params.TESTS_PATH,filename);
    var codegenFilePath = path.join(params.CODEGEN_PATH , filename.substr(0, filename.lastIndexOf('.')) + '.c');
    var outputFileResult = path.join(params.CODEGEN_OUTPUT_PATH , filename.substr(0, filename.lastIndexOf('.')) + '.txt');
    var outputFilePath = path.join(params.OUTPUTS_PATH, filename.substr(0, filename.lastIndexOf('.')) + '.txt');

    var testFileData = testFilePath+" was not found!";
    var cFileData = codegenFilePath+" was not found!";
    var codegenOutputData = outputFileResult+" was not found!";
    var petiteOutData = outputFilePath+" was not found!";

    if(fs.existsSync(testFilePath)){
        testFileData = fs.readFileSync(testFilePath,'utf8');
    }

    if(fs.existsSync(codegenFilePath)){
        cFileData = fs.readFileSync(codegenFilePath,'utf8');
    }

    if(fs.existsSync(outputFilePath)){
        petiteOutData = fs.readFileSync(outputFilePath,'utf8');
    }

    if(fs.existsSync(outputFileResult)){
        codegenOutputData = fs.readFileSync(outputFileResult,'utf8');
    }

    var data = {
        testFile: testFileData,
        cFile: cFileData,
        petiteOut:petiteOutData,
        codegenOutput:codegenOutputData
    }
    return data;
}
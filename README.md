<h1>Testbot</h1>
By Ariel Baruch & Chen Elkind
Last update: 17.01.15 <arielbar@post.bgu.ac.il>
Feel free to send comments and suggestion
This is a testing platform design for a scheme compiler project @ Ben Gurion University.
http://www.cs.bgu.ac.il/~comp151/

A video tutorial is avaiable here:
http://youtu.be/yp-zrAk1NR4

<h1>Requirements</h1>
<a href='http://nodejs.org/'>Node js</a><br>
<a href='https://gcc.gnu.org/'>gcc</a><br>
<a href='http://scheme.com/'>chez-scheme petite</a>

<h1>Currently tested on (working on):</h1>
OSX 10.9.5 <br>
Ubunto 12.04 <br>
Windows 7 <br>

<h1>Usage</h1>
1. make sure you have node js and gcc installed on your machine
2. download all of the files from this repository
3. move your compiler file to testbot/compiler directory 
  (note: your compiler.scm file must be located here)
4. open your shell and go to testbot directory
5. run: node testbot.js
        (or nodejs testbot.js)
6. open your web-browser (pref' chrome) and go to: http://localhost:8080
7. go to configuration tab and make sure directories are valid
8. click on "Run Tests" to run all tests inside testbot/tests directory
9. you will see the progress and you can press any test to view specified details


** NOTE:
Please share tests @ our Dropbox at 
Dropbox/מדעי המחשב שנה א 2013/סמסטר ה/קומפילציה/Compiler/tests
***

A little explanation on what's going on
    first of all, All the files are here, free to view and change , totally open-source!

    We used 'Scheme', 'Node js' and 'Angular js' which allowed us to:
    Node js:
    -manipulate the filesystem (read,write, etc)
    -fork() to petite and manipulate it's output/input streams
    -run shell commands (such as gcc , make, etc)
    -open a localhost- web server so we can display our web-app in a easy-to-use manner
    -opened a websocket with our web-app so we can share logs

    We used 'Angular js' as our web-app framework

    Scheme:
    -Run compile-scheme-file and eval on the test files
    -check scheme equality of the output results


    The flow:
    (1). generating valid scheme output:
    -We go through each file in the tests directory and make a list of lists ( (input1 output1) (input2 output2) ...)
    -we send this list to a scheme procedure (eval-files) that generates a valid eval input of those files

    (2). generate .c files from our code-gen
    -We go through each file in the tests directory and make a list of lists ( (input1 output1) (input2 output2) ...)
    -we send this list to a scheme procedure (compiler-scheme-files) that wraps your compile-scheme-file and runs it       through the files

    (3). compile .c files and run .o files
    -for each file in the code-gen directory
    -we run gcc and compiling a .o file to the code-gen-exe directory
    -for each file in the code-gen-exe directory we run it and save it's result to code-gen-outputs directory

    (4). compare
    -We go through each file in the tests directory and make a list of lists ( (scheme-output1 codegen-output1)       (scheme-output2 codegen-output2) ...)
    -we send this list to a scheme procedure (cmp-list-files) that compares with scheme equal?

    note that all of the directories can be modified using the 'configuration' tab.

    Happy testing.
# testbot
# testbot

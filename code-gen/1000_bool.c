#include <stdio.h>
#include <stdlib.h>
#include "cisc.h"
int main() {
START_MACHINE;
JUMP(CONTINUE);
#include "char.lib"
#include "io.lib"
#include "math.lib"
#include "string.lib"
#include "system.lib"
#include "scheme.lib"
CONTINUE:
ADD(IND(0), IMM(10));
MOV(IND(1), IMM(T_BOOL));
MOV(IND(2), IMM(0));
#define SOB_FALSE 1
MOV(IND(3), IMM(T_BOOL));
MOV(IND(4), IMM(1));
#define SOB_TRUE 3
MOV(IND(5), IMM(T_VOID));
#define SOB_VOID 5
MOV(IND(6), IMM(T_NIL));
#define SOB_NIL 6

MOV(R0, IMM(SOB_TRUE));
PUSH(R0);
CMP(R0, SOB_VOID);
JUMP_EQ(DONT_PRONT_VOID55);
CALL(WRITE_SOB);
CALL(NEWLINE);
DONT_PRONT_VOID55:
DROP(1);

EXIT:
STOP_MACHINE;
return 0;
/*
	------- PRINTING ERROR MASSAGES -------
*/
NOT_A_CLOSURE_ERROR:
printf("proc is not a closure, failed in applic");
JUMP(EXIT);
WRONG_NUMBER_OF_ARGS_OF_CLOSER:
printf("number or argument doesnt match number of parameters");
JUMP(EXIT);
/*
	------- PRINTING ERROR MASSAGES -------
*/
}


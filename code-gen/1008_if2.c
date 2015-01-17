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

/*
	start(if3 dit dif)
*/
MOV(R0, IMM(SOB_FALSE));

CMP(R0, SOB_FALSE);
JUMP_EQ(Lif3else38);
MOV(R0, IMM(SOB_TRUE));

JUMP(Lif3exit38);
Lif3else38:
MOV(R0, IMM(SOB_VOID));

Lif3exit38:
/*
	end(if3 dit dif)
*/
PUSH(R0);
CMP(R0, SOB_VOID);
JUMP_EQ(DONT_PRONT_VOID38);
CALL(WRITE_SOB);
CALL(NEWLINE);
DONT_PRONT_VOID38:
DROP(1);

/*
	start(if3 dit dif)
*/
MOV(R0, IMM(SOB_TRUE));

CMP(R0, SOB_FALSE);
JUMP_EQ(Lif3else37);
MOV(R0, IMM(SOB_FALSE));

JUMP(Lif3exit37);
Lif3else37:
MOV(R0, IMM(SOB_VOID));

Lif3exit37:
/*
	end(if3 dit dif)
*/
PUSH(R0);
CMP(R0, SOB_VOID);
JUMP_EQ(DONT_PRONT_VOID37);
CALL(WRITE_SOB);
CALL(NEWLINE);
DONT_PRONT_VOID37:
DROP(1);

/*
	start(if3 dit dif)
*/
MOV(R0, IMM(SOB_FALSE));

CMP(R0, SOB_FALSE);
JUMP_EQ(Lif3else36);
MOV(R0, IMM(SOB_FALSE));

JUMP(Lif3exit36);
Lif3else36:
MOV(R0, IMM(SOB_VOID));

Lif3exit36:
/*
	end(if3 dit dif)
*/
PUSH(R0);
CMP(R0, SOB_VOID);
JUMP_EQ(DONT_PRONT_VOID36);
CALL(WRITE_SOB);
CALL(NEWLINE);
DONT_PRONT_VOID36:
DROP(1);

/*
	start(if3 dit dif)
*/
MOV(R0, IMM(SOB_TRUE));

CMP(R0, SOB_FALSE);
JUMP_EQ(Lif3else35);
MOV(R0, IMM(SOB_TRUE));

JUMP(Lif3exit35);
Lif3else35:
MOV(R0, IMM(SOB_VOID));

Lif3exit35:
/*
	end(if3 dit dif)
*/
PUSH(R0);
CMP(R0, SOB_VOID);
JUMP_EQ(DONT_PRONT_VOID35);
CALL(WRITE_SOB);
CALL(NEWLINE);
DONT_PRONT_VOID35:
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


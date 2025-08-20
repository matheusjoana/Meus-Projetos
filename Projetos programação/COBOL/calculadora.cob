       IDENTIFICATION DIVISION.
       PROGRAM-ID. calculadora.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.

       77 STR-NUM1      PIC X(10).
       77 STR-NUM2      PIC X(10).
       77 STR-OPCAO     PIC X(2).
       77 STR-RESPOSTA  PIC X.

       77 NUM1          PIC 9(5)V99 VALUE 0.
       77 NUM2          PIC 9(5)V99 VALUE 0.
       77 RESULT        PIC 9(7)V99 VALUE 0.
       77 OPCAO         PIC 9 VALUE 0.

       77 NUMERIC-CHECK PIC X.

       PROCEDURE DIVISION.

       MAIN-PROGRAM
           DISPLAY "Bem-vindo à calculadora COBOL.".
           MOVE 'S' TO STR-RESPOSTA.

           PERFORM UNTIL STR-RESPOSTA = "N"
               PERFORM LER-NUM1
               PERFORM LER-NUM2
               PERFORM MENU-OPERACOES
               DISPLAY "Deseja fazer outra conta? (S/N): ".
               ACCEPT STR-RESPOSTA
               MOVE FUNCTION UPPER-CASE(STR-RESPOSTA) TO STR-RESPOSTA
           END-PERFORM.

           DISPLAY "Obrigado por usar a calculadora!".
           STOP RUN.

       LER-NUM1.
           MOVE 'N' TO NUMERIC-CHECK.
           PERFORM UNTIL NUMERIC-CHECK = 'Y'
               DISPLAY "Digite o primeiro número: ".
               ACCEPT STR-NUM1
               IF STR-NUM1 NUMERIC
                   COMPUTE NUM1 = FUNCTION NUMVAL(STR-NUM1)
                   MOVE 'Y' TO NUMERIC-CHECK
               ELSE
                   DISPLAY "Valor inválido! Digite apenas números."
               END-IF
           END-PERFORM.

       LER-NUM2.
           MOVE 'N' TO NUMERIC-CHECK.
           PERFORM UNTIL NUMERIC-CHECK = 'Y'
               DISPLAY "Digite o segundo número: ".
               ACCEPT STR-NUM2
               IF STR-NUM2 NUMERIC
                   COMPUTE NUM2 = FUNCTION NUMVAL(STR-NUM2)
                   MOVE 'Y' TO NUMERIC-CHECK
               ELSE
                   DISPLAY "Valor inválido! Digite apenas números."
               END-IF
           END-PERFORM.

       MENU-OPERACOES.
           DISPLAY " ".
           DISPLAY "Escolha a operação:".
           DISPLAY "1 - Soma".
           DISPLAY "2 - Subtração".
           DISPLAY "3 - Multiplicação".
           DISPLAY "4 - Divisão".
           DISPLAY "Opção: ".
           ACCEPT STR-OPCAO

           IF STR-OPCAO NUMERIC
               COMPUTE OPCAO = FUNCTION NUMVAL(STR-OPCAO)
           ELSE
               MOVE 0 TO OPCAO
           END-IF

           EVALUATE OPCAO
               WHEN 1
                   ADD NUM1 TO NUM2 GIVING RESULT ROUNDED
                   DISPLAY "Resultado da soma: " RESULT
               WHEN 2
                   SUBTRACT NUM2 FROM NUM1 GIVING RESULT ROUNDED
                   DISPLAY "Resultado da subtração: " RESULT
               WHEN 3
                   MULTIPLY NUM1 BY NUM2 GIVING RESULT ROUNDED
                   DISPLAY "Resultado da multiplicação: " RESULT
               WHEN 4
                   IF NUM2 NOT = 0
                       DIVIDE NUM1 BY NUM2 GIVING RESULT ROUNDED
                       DISPLAY "Resultado da divisão: " RESULT
                   ELSE
                       DISPLAY "Erro: divisão por zero!"
                   END-IF
               WHEN OTHER
                   DISPLAY "Opção inválida!"
           END-EVALUATE.

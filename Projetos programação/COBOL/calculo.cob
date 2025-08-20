       IDENTIFICATION DIVISION.
       PROGRAM-ID. CALCULADORA-MENU.
       AUTHOR. MATHEUS.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       77 NUM1        PIC 9(5)V99.
       77 NUM2        PIC 9(5)V99.
       77 RESULT      PIC 9(7)V99.
       77 OPCAO       PIC 9.

       

       PROCEDURE DIVISION.
               
       
      
       MAIN-PROGRAM.

           
           DISPLAY "-----------------------------------".
           DISPLAY "   CALCULADORA SIMPLES EM COBOL".
           DISPLAY "-----------------------------------".
           
           DISPLAY "Digite o primeiro numero: " WITH NO ADVANCING.
           ACCEPT NUM1.
           
           DISPLAY "Digite o segundo numero: " WITH NO ADVANCING.
           ACCEPT NUM2.

           DISPLAY " ".
           DISPLAY "Escolha a operacao:".
           DISPLAY "1 - Soma".
           DISPLAY "2 - Subtracao".
           DISPLAY "3 - Multiplicacao".
           DISPLAY "4 - Divisao".
           DISPLAY "Opcao: " WITH NO ADVANCING.
           ACCEPT OPCAO.

           DISPLAY " ".
           EVALUATE OPCAO
               WHEN 1
                   ADD NUM1 TO NUM2 GIVING RESULT
                   DISPLAY "Resultado da soma: " RESULT
               WHEN 2
                   SUBTRACT NUM2 FROM NUM1 GIVING RESULT
                   DISPLAY "Resultado da subtracao: " RESULT
               WHEN 3
                   MULTIPLY NUM1 BY NUM2 GIVING RESULT
                   DISPLAY "Resultado da multiplicacao: " RESULT
               WHEN 4
                   IF NUM2 NOT = 0
                       DIVIDE NUM1 BY NUM2 GIVING RESULT
                       DISPLAY "Resultado da divisao: " RESULT
                   ELSE
                       DISPLAY "Erro: divisao por zero!"
                   END-IF
               WHEN OTHER
                   DISPLAY "Opcao invalida!"
           END-EVALUATE.

           DISPLAY "-----------------------------------".
               
              
              
               
           
           STOP RUN.

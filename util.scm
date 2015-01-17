(define *void* (if #f #f))

(define util-write-to-file
	(lambda (file-name list-to-be-printed)
		(let ((port (open-output-file file-name)))
		  (let f ((ls list-to-be-printed))
		    (if (not (null? ls))
		        (begin
		          (display (car ls) port)
		          (newline port)
		          (f (cdr ls)))))
		  (close-output-port port))))

(define file->sexpr
	(lambda (filename)
		(let ((input (open-input-file filename) ))
			 (letrec ((run (lambda ()
				(let ((e (read input)))
					 (if (eof-object? e)
					 	(begin (close-input-port input) '())
					 	(cons e (run))
					 )))))
		 		 (run)))
))

(define safe-eval (lambda(sexpr error-msg) 
	(guard (condition
	           (else error-msg))
	   (eval sexpr ))
))

(define eval-sexpr-ls
	(lambda (sexpr-ls)
		(map (lambda (sexpr)  (safe-eval sexpr (format "Syntax-Error in: ~s" sexpr)) ) sexpr-ls )
))

(define print-sexpr-ls
	(lambda (sexpr-ls)
		(letrec ((print (lambda(ls)
				(if (null? ls) (void)
					(begin
						(if (not (equal? *void* (car ls))) (begin (display (car ls)) (newline)) void)
					(print (cdr ls)))
				))))
			(print sexpr-ls))
))

(define eval-files
	(lambda (ls)
		(map (lambda(x) (util-write-to-file (caddr x)
			`(,(apply string-append ( map
			(lambda(y) (if (or (equal? *void* y) (procedure? y)) "" (format "~s \n" y)) )
			(eval-sexpr-ls (file->sexpr (cadr x)))
			)))
		))
		ls)
))

(define cmp-list-files (lambda(ls)
	(let* (
			(total 0)
			(success 0)
			(fail 0)
			(cmp-output-input
				(lambda (filename outputFile resultFile)
					(let (
							(output (file->sexpr outputFile))
							(result (file->sexpr resultFile))
						)
					(if (equal? output result)
						(begin (set! total (+ total 1)) (set! success (+ success 1)) (format "(~s) => SUCCESS \n" filename))
						(begin (set! total (+ total 1)) (set! fail (+ fail 1)) 		 (format "(~s) => ERROR: (expected: ~s got: ~s) \n" filename result output))
					)))
			)
		 )
		(display (string-append  (apply string-append
			(cons "---\n" (map (lambda(x) (cmp-output-input (car x) (cadr x) (caddr x)) ) ls)))
			(format "~s/~s tests Succeed\n" success total) (format "~s/~s tests Failed \n---" fail total)
			 )
	))
))

(define do-and-exit (lambda(f)
	(lambda x
		(begin (apply f x) (exit 0)))))


(define compile-scheme-files (lambda(ls)
	(map (lambda(x) (compile-scheme-file (cadr x) (caddr x))) ls)
))
/**
 * The package declaration places the class in the student.exception namespace, making its purpose explicit and keeping 
 * exception types grouped and discoverable. It also defines the fully qualified name used for imports and classpath scanning.
 * The imports bring in Spring’s HttpStatus enum and the @ResponseStatus annotation. In a not-found scenario, the class 
 * typically uses @ResponseStatus(HttpStatus.NOT_FOUND) so that throwing the exception automatically produces an HTTP 404 
 * without manual ResponseEntity handling. 
 * This keeps controller code clean and leverages Spring’s built-in exception-to-response mapping.
 * Gotchas:
 * Omitting @ResponseStatus yields a default 500 error instead of the intended client error.
 * If you centralize error handling with @ControllerAdvice/@ExceptionHandler, @ResponseStatus on the exception may be r
 * edundant or overridden.
 */
package com.syscomz.springbootfullstackprofessional.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception thrown when a student is not found in the system.
 * <p>
 * This exception is mapped to HTTP 404 (NOT_FOUND) status code when thrown
 * from a REST controller, thanks to the {@link ResponseStatus} annotation.
 * </p>
 *
 * @author syscomz
 * @version 1.0
 * @since 1.0
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(String msg) {
        super(msg);
    }
}

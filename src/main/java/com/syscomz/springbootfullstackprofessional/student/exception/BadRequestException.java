/**
 * This code starts with a package declaration, placing the class in the namespace com.syscomz.springbootfullstackprofessional.student.exception. 
 * Organizing exception types under a dedicated package improves discoverability, enforces layering, and keeps domain concerns (students) separate 
 * from cross-cutting infrastructure (error handling).
 * The imported types org.springframework.http.HttpStatus and org.springframework.web.bind.annotation. ResponseStatus indicate the exception class 
 * will likely be annotated with @ResponseStatus(HttpStatus.XYZ). That annotation lets Spring translate the thrown 
 * exception directly into an HTTP response with the specified status, avoiding manual ResponseEntity creation. HttpStatus is an enum of standard 
 * status codes, providing type safety over using raw numeric codes (e.g., 400 instead of 400 400). If the exception extends RuntimeException, 
 * throwing it from a controller or service will produce a concise error path: exception → Spring’s ExceptionHandler → automatic status mapping 
 * via @ResponseStatus. 
 * If additional fields (e.g., a message) are added later, Spring will still honor the status from @ResponseStatus, and the message can propagate 
 * to the response body if not overridden by a global error handler. Potential gotcha: forgetting @ResponseStatus causes the default 500 Internal 
 * Server Error instead of the intended client error (e.g., BAD_REQUEST).
 */
package com.syscomz.springbootfullstackprofessional.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception class for handling bad request scenarios in the application.
 * <p>
 * This exception is thrown when a client request contains invalid data or parameters
 * that cannot be processed by the server. It automatically maps to an HTTP 400 Bad Request
 * response status when thrown in a Spring Boot application.
 * </p>
 * 
 * @author SystemZ
 * @version 1.0
 * @see RuntimeException
 * @see ResponseStatus
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException{
    public BadRequestException(String msg) {
        super(msg);
    }
}

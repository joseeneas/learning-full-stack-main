package com.syscomz.springbootfullstackprofessional.student.exception;

import java.time.Instant;
import java.util.List;

/**
 * Simple DTO representing a standardized error payload returned by the API.
 */
public class ApiError {
    private final Instant timestamp = Instant.now();
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final List<String> errors;

    public ApiError(int status, String error, String message, String path, List<String> errors) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.errors = errors;
    }

    public Instant getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public String getPath() { return path; }
    public List<String> getErrors() { return errors; }
}

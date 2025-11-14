/*
 * This package declaration places the StudentController class inside the 
 * com.syscomz.springbootfullstackprofessional.student namespace. 
 * Keeping controllers, entities, and related services under a common base package ensures Spring’s 
 * component scan (starting at the @SpringBootApplication root) detects them automatically 
 * without extra configuration.
 * A coherent package path clarifies domain ownership (student) and separates it from other bounded 
 * contexts. It also produces a stable fully qualified name used for imports, logging, and reflective 
 * operations. Consistent package structuring reduces accidental cyclic dependencies and makes 
 * refactoring safer.
 */
package com.syscomz.springbootfullstackprofessional.student;

/*
 * These imports pull in Spring MVC web annotation types (via the wildcard) such as @RestController, 
 * @RequestMapping, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PathVariable, 
 * @RequestBody, and @RequestParam. They let the controller declaratively map HTTP verbs and URIs 
 * to Java methods, bind request data to parameters, and signal that return values should be 
 * serialized as HTTP responses. The jakarta.validation.Valid import enables method parameters 
 * (e.g., @RequestBody @Valid Student student) to trigger Bean Validation before the controller 
 * logic runs. Failed constraints produce a 400 response with error details, preventing invalid 
 * data from reaching the service layer. Finally,
 * java.util.List is used as a return or parameter type for ordered collections of students. 
 * Returning List<Student> from a @GetMapping allows Spring to serialize it (typically to JSON) 
 * automatically. Gotchas: avoid exposing large unpaged lists; prefer pagination to control memory 
 * and response size.
 */
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import java.util.Map;
// import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/*
 * The StudentController class is annotated with @RestController, marking it as a Spring MVC
 * controller where every method’s return value is automatically serialized to the HTTP response body.
 * The @RequestMapping at the class level sets a common base URI path (api/v1/students) for all endpoints in this controller,
 * promoting consistent versioning and resource organization.
 * The controller depends on a StudentService (injected via constructor) to handle business logic and
 * data access, adhering to the separation of concerns principle. Each method is mapped to an HTTP verb:
 * - @GetMapping handles GET requests to retrieve all students.
 * - @PostMapping handles POST requests to add a new student, with @Valid ensuring the request body
 *   is validated against the Student entity’s constraints before processing.
 * - @DeleteMapping handles DELETE requests to remove a student by ID, with @PathVariable binding the
 *   URI segment to the method parameter.
 * This structure keeps the controller focused on request handling, delegating core logic to the service layer.
 * Gotchas:
 * Ensure proper exception handling in the service layer to return meaningful HTTP responses.
 * Validate input data thoroughly to prevent invalid states.
 */
@RestController
@RequestMapping(path = "api/v1/students")
/*
 * The StudentController class manages HTTP requests related to student entities.
 * It provides endpoints to retrieve all students, add a new student, and delete a student by ID.
 * Each method is mapped to a specific HTTP verb and URI pattern, facilitating RESTful interactions.
 * The controller relies on a StudentService to perform business logic and data access, promoting
 * a clean separation of concerns.
 * @since 1.0
 * @author syscomz
 */
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/page")
    public Page<Student> getStudentsPaged(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "50") int size,
                                          @RequestParam(defaultValue = "id") String sortBy,
                                          @RequestParam(defaultValue = "asc") String direction) {
        return studentService.getStudentsPage(page, size, sortBy, direction);
    }

    @PostMapping
    public void addStudent(@Valid @RequestBody Student student) {
        studentService.addStudent(student);
    }

    @DeleteMapping(path = "{studentId}")
    public void deleteStudent(@PathVariable("studentId") Long studentId) {
        studentService.deleteStudent(studentId);
    }

    @PutMapping(path = "{studentId}")
    public void updateStudent(
            @PathVariable("studentId") Long studentId,
            @Valid @RequestBody Student student) {
        studentService.updateStudent(studentId, student);
    }

    @GetMapping("/stats/gender")
    public Map<String, Long> getGenderStats() {
        return studentService.getGenderStats();
    }

    @GetMapping("/search")
    public Page<Student> searchStudents(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "50") int size,
                                        @RequestParam(defaultValue = "id") String sortBy,
                                        @RequestParam(defaultValue = "asc") String direction,
                                        @RequestParam(required = false) Gender gender,
                                        @RequestParam(required = false) String domain) {
        return studentService.searchStudents(page, size, sortBy, direction, gender, domain);
    }

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<String> exportStudentsCsv(@RequestParam(defaultValue = "id") String sortBy,
                                                    @RequestParam(defaultValue = "asc") String direction,
                                                    @RequestParam(required = false) Gender gender,
                                                    @RequestParam(required = false) String domain) {
        List<Student> all = studentService.searchStudentsAll(sortBy, direction, gender, domain);
        StringBuilder sb = new StringBuilder();
        // header
        sb.append("id,name,email,gender\n");
        for (Student s : all) {
            sb.append(csv(s.getId()))
              .append(',').append(csv(s.getName()))
              .append(',').append(csv(s.getEmail()))
              .append(',').append(csv(s.getGender() != null ? s.getGender().name() : ""))
              .append('\n');
        }
        String filename = "students-export-" + java.time.LocalDate.now() + ".csv";
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString());
    }

    private static String csv(Object value) {
        if (value == null) return "";
        String s = String.valueOf(value);
        if (s.contains("\"") || s.contains(",") || s.contains("\n") || s.contains("\r")) {
            s = '"' + s.replace("\"", "\"\"") + '"';
        }
        return s;
    }

}

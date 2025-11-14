/*
 * The package declaration places the class in the student namespace, grouping related
 * functionalities and making it easier to locate and manage student-related services.
 * It also defines the fully qualified name used for imports and classpath scanning.
 * Gotchas:
 * Ensure that the package structure aligns with your project's organization to avoid
 * confusion and maintainability issues.
 * Keep service classes focused on business logic, avoiding mixing with controller or 
 * repository logic.
 * Use appropriate annotations to define the class's role within the Spring framework.
 * Consider using constructor injection (as done here with Lombok's @AllArgsConstructor)
 * for better testability and immutability of service dependencies.
 * Document exceptions thrown by service methods to inform callers of potential error conditions.
 * Avoid placing too much logic in service methods; delegate to repositories or other 
 * services as needed.
 * Be mindful of transaction management if your service methods involve multiple
 * database operations.
 * Handle edge cases, such as null inputs or non-existent entities, to prevent runtime errors.
 * Use meaningful exception messages to aid in debugging and user feedback.
 * Leverage Spring's exception handling mechanisms to translate exceptions into
 * appropriate HTTP responses when used in a web context.
 * Consider the performance implications of service methods, especially those that
 * may involve large data sets or complex queries.
 * Ensure that service methods are cohesive and focused on a single responsibility.
 * Regularly review and refactor service code to maintain clarity and efficiency.
 * Utilize logging within service methods to track execution flow and errors.
 * Test service methods thoroughly, including unit tests and integration tests,
 * to ensure reliability and correctness.
 * Be cautious with exception handling; avoid catching generic exceptions unless necessary.
 * Document the service class and its methods to provide clarity on their purpose
 * and usage.
 * Consider security implications, such as validating inputs and managing access
 * to sensitive operations within the service.  
 */
package com.syscomz.springbootfullstackprofessional.student;

/*
 * These imports bring in necessary classes for defining the service.
 * StudentRepository is used for data access operations related to Student entities.
 * Custom exceptions BadRequestException and StudentNotFoundException are used to
 * signal specific error conditions in the service methods.
 * Lombok's @AllArgsConstructor generates a constructor with parameters for all
 * final fields, facilitating dependency injection.
 * The @Service annotation marks the class as a Spring service component,
 * enabling component scanning and allowing it to be injected into other components.
 * Gotchas:
 * Ensure that the StudentRepository is properly defined and annotated as a Spring
 * repository to avoid injection issues.
 * Custom exceptions should extend appropriate base exception classes to ensure
 * they integrate well with Spring's exception handling mechanisms.
 * Be cautious with Lombok annotations; ensure that your IDE is configured to
 * recognize and process them correctly.
 * The @Service annotation should be used on classes that contain business logic,
 * not on data access or controller classes.    
 */
import com.syscomz.springbootfullstackprofessional.student.exception.BadRequestException;
import com.syscomz.springbootfullstackprofessional.student.exception.StudentNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Objects;
import java.util.LinkedHashMap;
import java.util.Map;

/*
 * The StudentService class encapsulates the business logic related to Student entities.
 * It provides methods to retrieve all students, add a new student, and delete an existing student.
 * Gotchas:
 * Ensure that the methods handle edge cases, such as checking for existing emails
 * before adding a new student and verifying the existence of a student before deletion.
 * Use meaningful exception messages to aid in debugging and user feedback.
 * Consider transaction management if these methods involve multiple database operations.
 * Regularly review and refactor service code to maintain clarity and efficiency.
 * Test service methods thoroughly, including unit tests and integration tests,
 * to ensure reliability and correctness.
 */
@Service
public class    StudentService {
    private final StudentRepository studentRepository;
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }
    public List<Student> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }
    public Page<Student> getStudentsPage(int page, int size, String sortBy, String direction) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return studentRepository.findAll(pageable);
    }
    public Page<Student> searchStudents(int page, int size, String sortBy, String direction, Gender gender, String domain) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return studentRepository.search(gender, (domain == null || domain.isBlank()) ? null : domain, pageable);
    }
    public List<Student> searchStudentsAll(String sortBy, String direction, Gender gender, String domain) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(dir, sortBy);
        return studentRepository.search(gender, (domain == null || domain.isBlank()) ? null : domain, sort);
    }
    public void addStudent(Student student) {
        Boolean isEmailTaken = studentRepository.selectExistsEmail(student.getEmail());
        if (isEmailTaken)
            throw new BadRequestException(String.format("Student with email %s, already exists!", student.getEmail()));
        studentRepository.save(student);
    }
    @SuppressWarnings("null")
    public void deleteStudent(Long studentId) {
        boolean isStudentNotExists = !studentRepository.existsById(studentId);
        if (isStudentNotExists)
            throw new StudentNotFoundException(String.format("Student with id %d, does not exists!", studentId));
        studentRepository.deleteById(studentId);
    }

    @SuppressWarnings("null")
    public void updateStudent(Long studentId, Student update) {
        Student existing = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(
                        String.format("Student with id %d, does not exists!", studentId)));

        // Validate email uniqueness if changed
        if (update.getEmail() != null && !Objects.equals(update.getEmail(), existing.getEmail())) {
            boolean emailTaken = studentRepository.existsByEmailAndIdNot(update.getEmail(), studentId);
            if (emailTaken) {
                throw new BadRequestException(String.format("Student with email %s, already exists!", update.getEmail()));
            }
            existing.setEmail(update.getEmail());
        }

        if (update.getName() != null) {
            existing.setName(update.getName());
        }
        if (update.getGender() != null) {
            existing.setGender(update.getGender());
        }

        studentRepository.save(existing);
    }

    public Map<String, Long> getGenderStats() {
        // Initialize with fixed order and zero defaults
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("Male", 0L);
        result.put("Female", 0L);
        result.put("Other", 0L);
        for (StudentRepository.GenderCountView row : studentRepository.countByGender()) {
            if (row.getGender() == null) continue;
            switch (row.getGender()) {
                case MALE -> result.put("Male", row.getCount());
                case FEMALE -> result.put("Female", row.getCount());
                case OTHER -> result.put("Other", row.getCount());
            }
        }
        return result;
    }
}

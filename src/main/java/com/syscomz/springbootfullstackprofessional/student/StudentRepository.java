/*
 * The package declaration places the interface in the student namespace, making its purpose explicit and keeping
 * repository types grouped and discoverable. It also defines the fully qualified name used for imports and
 * classpath scanning.
 */
package com.syscomz.springbootfullstackprofessional.student;
/*
 * These imports bring in Spring Data JPA types needed to define a repository interface.
 * JpaRepository provides standard CRUD and pagination methods for the Student entity with Long IDs.
 * The @Repository annotation marks the interface as a Spring bean for component scanning and exception translation.
 * The @Query import allows defining custom JPQL queries for more complex data access patterns. 
 * Gotchas:
 * Ensure the Student entity is properly annotated with @Entity for JPA to recognize it.
 * Custom queries must use JPQL syntax, which operates on entity fields and types, not directly on database tables/columns.
 * Repository interfaces should be placed in packages scanned by Spring Boot (typically under the main application package).
 * Failing to annotate with @Repository may lead to missing bean definitions or lack of exception translation.
 * Avoid defining business logic in repository interfaces; keep them focused on data access.
 */
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/*
 * The StudentRepository interface extends JpaRepository, providing CRUD operations 
 * for Student entities.
 * It includes a custom JPQL query method selectExistsEmail to check for the existence of a
 * student by email. The @Repository annotation marks it as a Spring Data repository bean,
 * enabling component scanning and exception translation.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // JPQL request, which is enabled by @Entity in Student object
    @Query("" +
            "SELECT CASE WHEN COUNT(s) > 0 THEN " +
            "TRUE ELSE FALSE END " +
            "FROM Student s " +
            "WHERE s.email = ?1"
    )
    Boolean selectExistsEmail(String email);

    // Spring Data derived query to check email usage excluding a specific student id
    boolean existsByEmailAndIdNot(String email, Long id);
}
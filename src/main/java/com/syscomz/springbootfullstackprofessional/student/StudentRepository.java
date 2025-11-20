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
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

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

    // Projection for gender counts
    interface GenderCountView {
        Gender getGender();
        long getCount();
    }

    // Aggregate counts by gender using JPQL
    @Query("SELECT s.gender as gender, COUNT(s) as count FROM Student s GROUP BY s.gender")
    List<GenderCountView> countByGender();

    // Aggregate counts by email domain (part after '@'), lower-cased
    // Use native SQL to ensure proper text casting in PostgreSQL and avoid dialect translation issues
    @Query(value = "SELECT LOWER(split_part(email, '@', 2)) as domain, COUNT(*) as count " +
                   "FROM student WHERE email IS NOT NULL AND position('@' in email) > 0 " +
                   "GROUP BY LOWER(split_part(email, '@', 2)) ORDER BY COUNT(*) DESC",
           nativeQuery = true)
    List<Object[]> countByDomain();

    // Aggregate counts by nationality
    @Query(value = "SELECT nationality, COUNT(*) as count " +
                   "FROM student WHERE nationality IS NOT NULL " +
                   "GROUP BY nationality ORDER BY COUNT(*) DESC",
           nativeQuery = true)
    List<Object[]> countByNationality();

    // Aggregate counts by college
    @Query(value = "SELECT college, COUNT(*) as count " +
                   "FROM student WHERE college IS NOT NULL " +
                   "GROUP BY college ORDER BY COUNT(*) DESC",
           nativeQuery = true)
    List<Object[]> countByCollege();

        // Paged search with optional gender and domain filters
        // Use native queries and explicit CAST(email AS TEXT) to avoid bytea/lower issues on Postgres
            @Query(value = "SELECT * FROM student WHERE (:gender IS NULL OR gender = :gender) " +
                   "AND (:domain IS NULL OR LOWER(CAST(email AS TEXT)) LIKE CONCAT('%@', LOWER(:domain)))",
               countQuery = "SELECT COUNT(*) FROM student WHERE (:gender IS NULL OR gender = :gender) " +
                    "AND (:domain IS NULL OR LOWER(CAST(email AS TEXT)) LIKE CONCAT('%@', LOWER(:domain)))",
               nativeQuery = true)
            Page<Student> search(@Param("gender") String gender,
                     @Param("domain") String domain,
                     Pageable pageable);

        // Unpaged search variant for exports (with sorting)
            @Query(value = "SELECT * FROM student WHERE (:gender IS NULL OR gender = :gender) " +
                   "AND (:domain IS NULL OR LOWER(CAST(email AS TEXT)) LIKE CONCAT('%@', LOWER(:domain)))",
               nativeQuery = true)
            List<Student> search(@Param("gender") String gender,
                     @Param("domain") String domain,
                     org.springframework.data.domain.Sort sort);
}
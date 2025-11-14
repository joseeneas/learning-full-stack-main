/**
 * Package declaration for student-related classes in the Spring Boot full stack professional application.
 * This package contains domain models, services, repositories, and controllers related to student management.
 * 
 * @since 1.0
 * @author syscomz  
 * 
 * This package declaration places the Student type in the student domain of your application. 
 * Keeping entities under com.syscomz.springbootfullstackprofessional.student aligns with Spring Boot’s 
 * component scanning conventions, so JPA entities and related components are discovered when your 
 * @SpringBootApplication sits at or above this package.
 * The lombok.* import enables Lombok annotations (e.g., @Getter, @Setter, @Builder, @NoArgsConstructor, 
 * @AllArgsConstructor, @EqualsAndHashCode) to generate boilerplate at compile time via annotation processing. 
 * This keeps the entity concise while still providing standard methods. Ensure the Lombok plugin is enabled 
 * in your IDE and annotation processing is on; otherwise, the code compiles with Maven but appears “missing” 
 * methods in the editor.
 * The jakarta.persistence.* import brings in JPA/Hibernate annotations such as @Entity, @Id, @GeneratedValue, 
 * @Table, @Column, and @Enumerated to map the class and its fields to a relational table. Using jakarta.* 
 * (not javax.*) matches Spring Boot 3/Hibernate 6, which migrated to the Jakarta namespace.
 * The jakarta.validation.constraints imports add Bean Validation annotations applied to fields: 
 * @Email validates email shape, @NotBlank ensures non-empty text, and @NotNull ensures presence of a value. 
 * Validation runs when objects are bound with @Valid (e.g., in controller method parameters) or through method validation on services if enabled, and failures surface as 400 responses by default in Spring MVC.
 * Gotchas:
 * @Email permits empty strings; pair it with @NotBlank to enforce presence and format together.
 * Prefer explicit imports over wildcards if your code style or Checkstyle enforces it.
 * @NotNull applies to reference types; for primitives, use wrapper types if you need nullability constraints.
 * Ensure your application’s base package matches this package structure so entity scanning works as expected.
 */
package com.syscomz.springbootfullstackprofessional.student;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
// Lombok added back to reduce boilerplate; custom equals/hashCode retained for JPA safety.
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Entity class representing a Student in the system.
 * This class is mapped to a database table using JPA annotations and follows
 * the camelCase naming convention for table creation.
 *
 * <p>The Student entity includes:</p>
 * <ul>
 *   <li>Auto-generated ID using a sequence generator</li>
 *   <li>Name with backend validation (not blank) and database constraint (not null)</li>
 *   <li>Email with format validation and uniqueness constraint</li>
 *   <li>Gender as an enumerated type stored as a string</li>
 * </ul>
 *
 * <p>This class uses Lombok annotations for:</p>
 * <ul>
 *   <li>Getters and Setters generation</li>
 *   <li>toString() method generation</li>
 *   <li>equals() and hashCode() methods generation</li>
 *   <li>All-args and no-args constructors</li>
 * </ul>
 *
 * <p>Validation is implemented at two levels:</p>
 * <ul>
 *   <li>Backend validation using Bean Validation annotations (@NotBlank, @Email, @NotNull)</li>
 *   <li>Database validation using JPA column constraints (nullable, unique)</li>
 * </ul>
 *
 * @author syscomz
 * @version 1.0
 * @see Gender
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
public class Student {
/*
 * This snippet marks a field as the JPA primary key with @Id and declares a
 * reusable sequence generator definition via @SequenceGenerator. The
 * generator’s name (student_sequence) is the logical identifier you reference
 * from @GeneratedValue(generator = "student_sequence") on the same field;
 * sequenceName is the physical database sequence name Hibernate will use (or
 * create if DDL generation is enabled).
 * 
 * allocationSize = 1 tells the persistence provider to fetch a new value from
 * the database sequence for every insert. This guarantees strictly gap‑free,
 * monotonic numbers but increases round trips. A higher allocationSize (e.g.,
 * 50) improves insert performance by preallocating a block of IDs in memory
 * (hi/lo optimization), at the cost of possible gaps after crashes or restarts.
 * 
 * Gotchas:
 * 
 * Without a matching @GeneratedValue, this @SequenceGenerator is never invoked.
 * The database must have a sequence named student_sequence (Hibernate can
 * create it if ddl-auto is update/create).
 * Using allocationSize = 1 on high‑volume inserts can become a bottleneck; tune
 * if needed.
 */
    @Id
    @SequenceGenerator(
            name           = "student_sequence",
            sequenceName   = "student_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "student_sequence",
            strategy  = GenerationType.SEQUENCE
    )
    /*
     * Field declarations with validation and database constraints
     * 
     * @NotBlank ensures the name is not null or empty (after trimming) at the
     * backend validation level.
     * 
     * @Column(nullable = false) enforces a NOT NULL constraint in the database
     * schema.
     * 
     * @Email validates the email format at the backend validation level.
     * 
     * @Column(nullable = false, unique = true) enforces NOT NULL and UNIQUE
     * constraints in the database schema.
     * 
     * @NotNull ensures the gender is not null at the backend validation level.
     * 
     * @Enumerated(EnumType.STRING) stores the enum constant name (e.g., "MALE") in
     * the database instead of its ordinal value.
     * 
     * @Column(nullable = false) enforces a NOT NULL constraint in the database
     * schema.
     * The id field holds the primary key value (Long wrapper allows null before
     * persistence).
     * It is typically paired elsewhere with @Id and a generation strategy; without
     * those,
     * JPA treats it as a basic column and you would have to assign it manually.
     * The name field combines @NotBlank (rejects null, empty, or whitespace-only
     * input at validation time) with @Column(nullable = false) to enforce presence
     * both in the Java layer (Bean Validation) and at the database level. This dual
     * enforcement catches errors early (during request binding) and prevents
     * inconsistent rows if validation is bypassed.
     * The email field uses @Email for format checking plus @Column(nullable =
     * false, unique = true) to guarantee every persisted student has an email and
     * no two students share one. @Email alone allows empty strings, so pairing with
     * the non-nullable column (and often @NotBlank if added) closes that gap. The
     * uniqueness constraint delegates conflict detection to the database; handle
     * DataIntegrityViolationException gracefully.
     * The gender field applies @NotNull to require a value,
     * and @Enumerated(EnumType.STRING) stores the enum constant name instead of its
     * ordinal. Using STRING is safer for future changes (adding/reordering enum
     * values) because ordinals would shift and corrupt meaning. The nullable =
     * false column guard ensures every row has a defined gender, removing ambiguity
     * and avoiding null-handling branches in domain logic.
     * Gotchas:
     * @Email permits empty strings; pair it with @NotBlank to enforce presence and
     * format together.
     * @NotNull applies to reference types; for primitives, use wrapper types if you
     * need nullability constraints.
     * Ensure your application’s base package matches this package structure so
     * entity scanning works as expected.
     * Relying only on database constraints pushes feedback to later in the
     * request cycle; keep Bean Validation for earlier, clearer error messages. If
     * you add @Builder from Lombok, ensure mandatory fields (name, email, gender)
     * are set, or introduce a custom builder method enforcing them.
     */
    private Long id;
    @NotBlank                                // BE validation
    @Column(nullable = false)                // database validations
    private String name;                     // camelCase naming convention
    @Email                                   // BE validation. can have custom regex.
    @Column(nullable = false, unique = true) // database validations
    private String email;                    // camelCase naming convention
    @NotNull                                 // BE validation
    @Enumerated(EnumType.STRING)             // store the enum as string in DB
    @Column(nullable = false)                // database validations
    private Gender gender;                   // camelCase naming convention

    // Convenience constructor excluding id (used for create operations)
    public Student(String name, String email, Gender gender) {
        this.name = name;
        this.email = email;
        this.gender = gender;
    }

    // Explicit accessors to ensure availability even if Lombok processing is disabled
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    // Custom equals & hashCode (id-based if both present; otherwise business fields)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        if (id != null && student.id != null) return id.equals(student.id);
        return java.util.Objects.equals(name, student.name) &&
                java.util.Objects.equals(email, student.email) &&
                gender == student.gender;
    }

    @Override
    public int hashCode() {
        if (id != null) return id.hashCode();
        return java.util.Objects.hash(name, email, gender);
    }
}
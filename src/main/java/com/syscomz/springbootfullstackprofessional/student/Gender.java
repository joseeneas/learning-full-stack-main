/**
 * Package declaration for student-related classes in the Spring Boot full stack professional application.
 * This package contains domain models, services, repositories, and controllers related to student management.
 * 
 * @since 1.0
 * @author syscomz
 */
package com.syscomz.springbootfullstackprofessional.student;
/*
 * Enumeration representing the gender of a student.
 * This enum can be used to specify the gender attribute in the Student class.
 * It includes three possible values: MALE, FEMALE, and OTHER.
 * 
 * This declaration defines a Java enum named Gender with three constants: MALE, FEMALE, and OTHER. Enums model a closed set of valid values, 
 * giving you compile-time type safety compared to using plain strings. Anywhere a Gender is required, the compiler prevents invalid inputs, 
 * and switch statements over Gender can be exhaustively checked.
 * Enums are singletons per constant and immutable, so identity comparisons (==) are safe and fast. Although this enum has no fields or methods, 
 * Java enums can carry additional data and behavior if needed (e.g., a display label), which can be helpful for UI or localization without
 * exposing raw names.
 * Persistence and API tips: For JPA, map using EnumType. STRING to store the constant name, not ORDINAL; relying on ordinal positions is brittle 
 * if you ever reorder or insert values. For JSON, the default serialization uses the constant names; changing them is a breaking API change. 
 * If you need stable external names, add a property and a custom serializer/deserializer. Adding new constants later is generally backward 
 * compatible for producers, but consumers that switch over specific cases may need updates. Consider a sensible default handling to avoid surprises.
 * Avoid using null to represent “unknown”; prefer an explicit value (e.g., OTHER or UNKNOWN) or handle absence at the API boundary to keep domain 
 * logic clear.
 */
public enum Gender {
    MALE,
    FEMALE,
    OTHER
}

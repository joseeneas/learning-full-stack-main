/*
 * This package declaration places the main Spring Boot application class in the com.syscomz.springbootfullstackprofessional namespace. 
 * In Spring Boot, the class annotated with @SpringBootApplication defines the base package for component scanning, so all components, 
 * controllers, services, repositories, and entities under this package and its subpackages are auto-detected.
 * It also establishes the class’s fully qualified name for imports and logging, and mirrors typical Maven groupId conventions. 
 * Gotcha: if you place beans outside this package hierarchy, they won’t be discovered unless you adjust scanBasePackages or move the main a
 * pplication class higher in the package tree.
 */
package com.syscomz.springbootfullstackprofessional;
/*
 * These imports bring in the necessary Spring Boot classes to bootstrap the application.
 * SpringApplication is a helper class that sets up the Spring application context,
 * while @SpringBootApplication is a convenience annotation that combines @Configuration, 
 * @EnableAutoConfiguration, and @ComponentScan.
 * This setup allows for automatic configuration and component scanning within the 
 * specified package and its subpackages.
 * By using these imports, the application can leverage Spring Boot's auto-configuration
 * capabilities, simplifying the setup and reducing boilerplate code.
 */ 
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
/*
 * The @SpringBootApplication annotation indicates that this is the main class for a Spring Boot application.
 * It enables auto-configuration, component scanning, and allows for defining extra configuration on the application
 * level. This annotation is a combination of three annotations: @Configuration, @EnableAutoConfiguration, and @ComponentScan.
 * The main method uses SpringApplication.run() to launch the application. This method bootstraps the Spring application context,
 * starting the embedded server (like Tomcat) and initializing all Spring components.
 * This class serves as the entry point for the Spring Boot application.
 * When the application is started, this class is executed, and the Spring framework takes over 
 * to manage the application's lifecycle.
 * Gotcha: Ensure that this class is located in a package that is a parent to all other packages
 * containing Spring components to ensure they are discovered during component scanning.
 */
@SpringBootApplication
public class SpringBootFullStackProfessionalApplication {
	/*
	 * The main method is the entry point of the Java application.
	 * It calls SpringApplication.run() with the current class and command-line arguments,
	 * which starts the Spring Boot application.
	 * This method sets up the default configuration, starts the Spring application context,
	 * performs class path scans, and launches the embedded server.
	 */
	public static void main(String[] args) {
		SpringApplication.run(SpringBootFullStackProfessionalApplication.class, args);
	}
}

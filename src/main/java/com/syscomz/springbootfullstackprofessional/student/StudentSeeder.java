package com.syscomz.springbootfullstackprofessional.student;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Seeds the database with 2,000 random Student rows when the "seed" profile is active.
 * Activation: run the application with SPRING_PROFILES_ACTIVE including "seed" (and a DB profile), e.g.
 *   mvn spring-boot:run -Dspring-boot.run.profiles=local,seed
 * Safe for reruns: if the table already has >= TARGET_COUNT rows, seeding is skipped.
 */
@Component
@Profile("seed")
public class StudentSeeder implements CommandLineRunner {

    private static final int TARGET_COUNT = 2000;

    private final StudentRepository studentRepository;

    public StudentSeeder(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        long existing = studentRepository.count();
        if (existing >= TARGET_COUNT) {
            return; // already seeded sufficiently
        }
        int toCreate = TARGET_COUNT - (int) existing;
        List<Student> batch = new ArrayList<>(toCreate);

        String[] firstNames = {"Alex","Jamie","Taylor","Jordan","Casey","Riley","Morgan","Avery","Quinn","Hayden","Evan","Kai","Logan","Peyton","Sawyer"};
        String[] lastNames  = {"Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Garcia","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson"};
        Gender[] genders    = Gender.values();
        String[] nationalities = {"USA","Canada","UK","Brazil","Germany","France","Japan","Australia"};
        String[] colleges      = {"Engineering","Business","Arts","Science","Liberal Arts","General Studies","Mathematics","Medicine"};
        String[] majors        = {"Computer Science","Economics","Biology","Mathematics","History","Physics","Chemistry","Philosophy"};
        String[] minors        = {"Statistics","Music","Spanish","Art","Psychology","Sociology","French","German"};

        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        int emailCounterStart = (int) existing + 1; // ensure uniqueness across reruns

        for (int i = 0; i < toCreate; i++) {
            String first = firstNames[rnd.nextInt(firstNames.length)];
            String last  = lastNames[rnd.nextInt(lastNames.length)];
            String name  = first + " " + last;
            // Diverse domain set to exercise domain-based stats
            String domain = switch (rnd.nextInt(6)) {
                case 0 -> "gmail.com";
                case 1 -> "hotmail.com";
                case 2 -> "yahoo.com";
                case 3 -> "outlook.com";
                case 4 -> "edu.example";
                default -> "example.org";
            };
            String email = "student" + (emailCounterStart + i) + "@" + domain;
            Gender gender = genders[rnd.nextInt(genders.length)];
            String nationality = nationalities[rnd.nextInt(nationalities.length)];
            String college = colleges[rnd.nextInt(colleges.length)];
            String major = majors[rnd.nextInt(majors.length)];
            String minor = minors[rnd.nextInt(minors.length)];

            Student s = new Student(name, email, gender, nationality, college, major, minor);
            batch.add(s);
        }

        // Persist in chunks to avoid memory pressure
        int chunkSize = 500;
        for (int start = 0; start < batch.size(); start += chunkSize) {
            int end = Math.min(start + chunkSize, batch.size());
            List<Student> chunk = new ArrayList<>(batch.subList(start, end));
            studentRepository.saveAll(chunk);
        }
    }
}

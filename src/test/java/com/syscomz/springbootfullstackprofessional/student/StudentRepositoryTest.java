package com.syscomz.springbootfullstackprofessional.student;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

// Testing Unit StudentRepositoryTest
// @SpringBootTest(classes = StudentRepositoryTest.class)
@DataJpaTest
class StudentRepositoryTest {
    // We should test only our own custom methods
    // Spring Data JPA methods are already tested for us

    @Autowired
    private StudentRepository underTest;

    @AfterEach
    void tearDown() {
        underTest.deleteAll();
    }

    @Test
    void itShouldCheckWhenStudentEmailExists() {
        // given
        String email = "b.dostumski@gmail.com";
        Student student = new Student("Borislav", email, Gender.MALE);
        underTest.save(student);

        //when
        boolean expected = underTest.selectExistsEmail(email);

        // then
        assertThat(expected).isTrue();
    }

    @Test
    void itShouldCheckWhenStudentEmailDoesNotExists() {
        // given
        String email = "b.dostumski@gmail.com";

        //when
        boolean expected = underTest.selectExistsEmail(email);

        // then
        assertThat(expected).isFalse();
    }

    @Test
    void searchShouldFilterByDomainPaged() {
        // given
        underTest.save(new Student("Alice", "alice@gmail.com", Gender.FEMALE));
        underTest.save(new Student("Bob", "bob@gmail.com", Gender.MALE));
        underTest.save(new Student("Carol", "carol@outlook.com", Gender.FEMALE));

        // when
        Page<Student> page = underTest.search(null, "gmail.com", PageRequest.of(0, 10, Sort.by("id")));

        // then
        assertThat(page.getTotalElements()).isEqualTo(2);
    }

    @Test
    void unpagedSearchShouldFilterByGender() {
        // given
        underTest.save(new Student("Alice", "alice@gmail.com", Gender.FEMALE));
        underTest.save(new Student("Bob", "bob@gmail.com", Gender.MALE));
        underTest.save(new Student("Carol", "carol@outlook.com", Gender.FEMALE));

        // when
        java.util.List<Student> list = underTest.search("FEMALE", null, Sort.by("id"));

        // then
        assertThat(list.size()).isEqualTo(2);
    }
}
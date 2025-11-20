package com.syscomz.springbootfullstackprofessional.integration;

import com.syscomz.springbootfullstackprofessional.student.Gender;
import com.syscomz.springbootfullstackprofessional.student.Student;
import com.syscomz.springbootfullstackprofessional.student.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-it.properties")
@AutoConfigureMockMvc
class StudentExportIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository;

    @BeforeEach
    void setup() {
        studentRepository.deleteAll();
        studentRepository.save(new Student("Alice", "alice@gmail.com", Gender.FEMALE, "USA", "MIT", "Computer Science", null));
        studentRepository.save(new Student("Bob", "bob@gmail.com", Gender.MALE, "Canada", "UBC", "Engineering", null));
        studentRepository.save(new Student("Carol", "carol@outlook.com", Gender.FEMALE, "UK", "Oxford", "Mathematics", null));
    }

    @Test
    void exportCsv_hasAttachmentHeader_andTextCsv_andFiltersByGender() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/v1/students/export")
                .param("gender", "FEMALE")
                .param("sortBy", "id")
                .param("direction", "asc"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("text/csv"))
            .andReturn();

        String body = res.getResponse().getContentAsString();
        String cd = res.getResponse().getHeader(HttpHeaders.CONTENT_DISPOSITION);
        assertThat(cd).isNotNull();
        assertThat(cd).contains("attachment");
        // header exists with all fields
        assertThat(body).startsWith("id,name,email,gender,nationality,college,major,minor\n");
        // contains both FEMALE rows
        assertThat(body).contains("alice@gmail.com");
        assertThat(body).contains("carol@outlook.com");
        // excludes MALE row when filtering FEMALE
        assertThat(body).doesNotContain("bob@gmail.com");
    }
}

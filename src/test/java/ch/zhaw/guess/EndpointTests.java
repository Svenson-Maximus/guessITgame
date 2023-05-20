package ch.zhaw.guess;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.guess.model.Player;
import ch.zhaw.guess.repository.PlayerRepository;

import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;

@SpringBootTest
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc
@TestMethodOrder(OrderAnnotation.class)
class EndpointTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlayerRepository playerRepository;

    private static final String testName = "testPlayerName";
    private static final String testEmail = "testEmail@example.com";

    @Test
    @Order(1)
    @WithMockUser
    void testCreatePlayer() throws Exception {
        // create a test player and convert to Json
        Player player = new Player(testEmail, testName);
        var jsonBody = objectMapper.writeValueAsString(player);

        // POST Json to service with authorization header
        mockMvc.perform(post("/api/player")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonBody)
                .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andDo(print())
                .andExpect(status().isCreated())
                .andReturn();

        // Save the created player into class level variable

    }

    @Test
    @Order(2)
    @WithMockUser
    void testGetPlayer() throws Exception {
        mockMvc.perform(get("/api/player")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andDo(print())
                .andExpect(status().isOk())
                .andReturn();
    }

    @Test
    // @Disabled
    @Order(3)
    @WithMockUser
    void testGetPlayerById() throws Exception {
        Player player = playerRepository.findFirstByEmail(testEmail);
        System.out.println("///////////////////////" + player.toString());
        // Use the class level variable 'player'
        mockMvc.perform(get("/api/player/" + player.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andDo(print())
                .andExpect(status().isOk())
                .andReturn();
    }

    @Test
    // @Disabled
    @Order(4)
    @WithMockUser
    void testDeletePlayer() throws Exception {
        Player player = playerRepository.findFirstByEmail(testEmail);
        // Use the class level variable 'player'
        mockMvc.perform(delete("/api/player/" + player.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andDo(print())
                .andExpect(status().isOk())
                .andReturn();
        // Ensure that the Player was deleted
        Player result = playerRepository.findFirstByEmail(testEmail);
        assertNull(result);
    }

    @Test
    @Order(5)
    @WithMockUser
    void testGetQuestions() throws Exception {
        mockMvc.perform(get("/api/question")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andReturn();
    }
}

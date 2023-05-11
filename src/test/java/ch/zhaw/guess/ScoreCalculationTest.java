package ch.zhaw.guess;

import ch.zhaw.guess.model.AnsweredQuestionDTO;
import ch.zhaw.guess.model.Player;
import ch.zhaw.guess.model.Question;
import ch.zhaw.guess.repository.PlayerRepository;
import ch.zhaw.guess.repository.QuestionRepository;
import ch.zhaw.guess.service.AnswerQuestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ScoreCalculationTest {

    // Inject the mocks into the AnswerQuestionService instance for testing
    @InjectMocks
    private AnswerQuestionService answerQuestionService;

    // Mock the PlayerRepository and QuestionRepository dependencies
    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private QuestionRepository questionRepository;

    private Player testPlayer;
    private Question testQuestion;

    @BeforeEach
    public void setUpForScoreTest() {
        testPlayer = new Player("test@example.com", "TestUser");
        testPlayer.setId("1");
        testPlayer.setAnsweredQuestions(new ArrayList<>());

        testQuestion = new Question("1", "Test question", 42, "LEVEL_1");

        // Configure the mock repositories to return the test data
        when(playerRepository.findById("1")).thenReturn(Optional.of(testPlayer));
        when(questionRepository.findById("1")).thenReturn(Optional.of(testQuestion));
        when(playerRepository.save(any(Player.class))).thenAnswer(i -> i.getArguments()[0]);
    }

    private static Stream<Arguments> provideScoreTestData() {
        return Stream.of(
                // playerAnswer, expectedScore
                Arguments.of(42, 100),
                Arguments.of(43, 99),
                Arguments.of(47, 89),
                Arguments.of(53, 75)
        );
    }

    @ParameterizedTest
    @MethodSource("provideScoreTestData")
    public void answerQuestionScoreTest(int playerAnswer, int expectedScore) {
        AnsweredQuestionDTO answeredQuestionDTO = new AnsweredQuestionDTO("1", playerAnswer);

        testPlayer = answerQuestionService.answerQuestion("1", answeredQuestionDTO);

        int actualScore = testPlayer.getScore();

        // Assert that the calculated score matches the expected score
        assertEquals(expectedScore, actualScore);
    }
}

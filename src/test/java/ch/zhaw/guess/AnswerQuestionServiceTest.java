package ch.zhaw.guess;

import ch.zhaw.guess.model.AnsweredQuestion;
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
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AnswerQuestionServiceTest {

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
    private static List<AnsweredQuestion> answeredQuestionsAccumulator = new ArrayList<>();

    // Set up the test data before each test method
    @BeforeEach
    public void setUp() {
        testPlayer = new Player("test@example.com", "TestUser");
        testPlayer.setId("1");
        testPlayer.setAnsweredQuestions(new ArrayList<>());

        testQuestion = new Question("1", "Test question", 42, "LEVEL_1");

        // Configure the mock repositories to return the test data
        when(playerRepository.findById("1")).thenReturn(Optional.of(testPlayer));
        when(questionRepository.findById("1")).thenReturn(Optional.of(testQuestion));
        when(playerRepository.save(any(Player.class))).thenAnswer(i -> i.getArguments()[0]);

        answeredQuestionsAccumulator.clear();
    }

    // Provide test data for testing the difference calculation
    private static Stream<Arguments> provideTestData() {
        return Stream.of(
                Arguments.of(50, 8),
                Arguments.of(44, 2),
                Arguments.of(54, 12));
    }

    // Parameterized test for testing the difference calculation
    @ParameterizedTest
    @MethodSource("provideTestData")
    public void answerQuestionTest(int playerAnswer, int expectedDifference) {
        AnsweredQuestionDTO answeredQuestionDTO = new AnsweredQuestionDTO("1", playerAnswer);

        Player updatedPlayer = answerQuestionService.answerQuestion("1", answeredQuestionDTO);

        int actualDifference = updatedPlayer.getAnsweredQuestions().get(0).getDifference();

        // Assert that the calculated difference matches the expected difference
        assertEquals(expectedDifference, actualDifference);
    }

    // Provide test data for testing the deviation calculation
    private static Stream<Arguments> provideDeviationTestData() {
        return Stream.of(
                Arguments.of(50, 19.05),
                Arguments.of(44, 4.76),
                Arguments.of(54, 28.57));
    }

    // Parameterized test for testing the deviation calculation
    @ParameterizedTest
    @MethodSource("provideDeviationTestData")
    public void answerQuestionDeviationTest(int playerAnswer, double expectedDeviation) {
        AnsweredQuestionDTO answeredQuestionDTO = new AnsweredQuestionDTO("1", playerAnswer);
        Player updatedPlayer = answerQuestionService.answerQuestion("1", answeredQuestionDTO);

        double actualDeviation = updatedPlayer.getAnsweredQuestions().get(0).getDeviation();

        // Assert that the calculated deviation matches the expected deviation within a
        // tolerance of 0.01 (two decimal places)
        assertEquals(expectedDeviation, actualDeviation, 0.01);
    }

    // Provide test data for testing the average deviation calculation
    private static Stream<Arguments> provideAverageDeviationTestData() {
        return Stream.of(
                Arguments.of(50, 19.05), // First question, average deviation is the same as the deviation itself
                Arguments.of(33, 20.24), // Second question, average deviation = (19.05 + 21.43) / 2 = 20.24
                Arguments.of(59, 26.99) // Third question, average deviation = (19.05 + 21.43 + 40.48) / 3 = 26.99
        );
    }

    // Parameterized test for testing the average deviation calculation
    @ParameterizedTest
@MethodSource("provideAverageDeviationTestData")
public void answerQuestionAverageDeviationTest(int playerAnswer, double expectedAverageDeviation) {
    // Initialize testPlayer if it's null
    if (testPlayer == null) {
        testPlayer = playerRepository.findById("1").orElseThrow(() -> new RuntimeException("Player not found with id: 1"));
        answeredQuestionsAccumulator = new ArrayList<>();
    }

    AnsweredQuestionDTO answeredQuestionDTO = new AnsweredQuestionDTO("1", playerAnswer);
    testPlayer = answerQuestionService.answerQuestion("1", answeredQuestionDTO);

    // Add the current answered question to the accumulator
    answeredQuestionsAccumulator.add(testPlayer.getAnsweredQuestions().get(testPlayer.getAnsweredQuestions().size() - 1));
    testPlayer.setAnsweredQuestions(answeredQuestionsAccumulator);

    double actualAverageDeviation = testPlayer.getAverageDeviation();

    // Assert that the calculated average deviation matches the expected average
    // deviation within a tolerance of 0.01 (two decimal places)
    assertEquals(expectedAverageDeviation, actualAverageDeviation, 0.01);
}

    private static Stream<Arguments> provideScoreTestData() {
        return Stream.of(
                // Test case 1: playerAnswer, expectedScore
                Arguments.of(42, 100), // roundedDeviation = 0, score = 100
                // Test case 2: playerAnswer, expectedScore
                Arguments.of(43, 99), // roundedDeviation = 2, score = 99
                // Test case 3: playerAnswer, expectedScore
                Arguments.of(47, 89), // roundedDeviation = 12, score = 89
                // Test case 4: playerAnswer, expectedScore
                Arguments.of(53, 75) // roundedDeviation = 26, score = 75
        );
    }
    

    // Parameterized test for testing the score calculation
    @ParameterizedTest
    @MethodSource("provideScoreTestData")
    public void answerQuestionScoreTest(int playerAnswer, int expectedScore) {
        AnsweredQuestionDTO answeredQuestionDTO = new AnsweredQuestionDTO("1", playerAnswer);

        testPlayer.setAnsweredQuestions(new ArrayList<>(answeredQuestionsAccumulator));
        testPlayer = answerQuestionService.answerQuestion("1", answeredQuestionDTO);

        // Add the current answered question to the accumulator
        answeredQuestionsAccumulator
                .add(testPlayer.getAnsweredQuestions().get(testPlayer.getAnsweredQuestions().size() - 1));

        int actualScore = testPlayer.getScore();

        // Assert that the calculated score matches the expected score
        assertEquals(expectedScore, actualScore);
    }
}

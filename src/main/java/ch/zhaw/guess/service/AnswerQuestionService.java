package ch.zhaw.guess.service;

import ch.zhaw.guess.model.AnsweredQuestion;
import ch.zhaw.guess.model.AnsweredQuestionDTO;
import ch.zhaw.guess.model.Player;
import ch.zhaw.guess.model.Question;
import ch.zhaw.guess.repository.PlayerRepository;
import ch.zhaw.guess.repository.QuestionRepository;

import java.util.ArrayList;
import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnswerQuestionService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    public Player answerQuestion(String playerId, AnsweredQuestionDTO answeredQuestionDTO) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + playerId));

        Question question = questionRepository.findById(answeredQuestionDTO.getQuestionId())
                .orElseThrow(() -> new RuntimeException(
                        "Question not found with id: " + answeredQuestionDTO.getQuestionId()));

        int difference = (int) Math.abs(question.getCorrectAnswer() - answeredQuestionDTO.getPlayerAnswer());
        double deviation = round(((double) difference / question.getCorrectAnswer()) * 100, 2);

        AnsweredQuestion answeredQuestion = new AnsweredQuestion(
                answeredQuestionDTO.getQuestionId(),
                answeredQuestionDTO.getPlayerAnswer(),
                difference, question.getCorrectAnswer(),
                deviation);

        if (player.getAnsweredQuestions() == null) {
            player.setAnsweredQuestions(new ArrayList<>());
        }

        player.getAnsweredQuestions().add(answeredQuestion);

        // Calculate the average deviation
        calculateAverageDeviation(player);

        // Calculate the score
        calculateScore(player);

        return playerRepository.save(player);

    }

    private double round(double value, int places) {
        if (places < 0)
            throw new IllegalArgumentException();

        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);

        return bd.doubleValue();
    }

    // calculateAverageDeviation
    private void calculateAverageDeviation(Player player) {
        if (player.getAnsweredQuestions() == null || player.getAnsweredQuestions().isEmpty()) {
            player.setAverageDeviation(0);
            return;
        }

        double sumOfDeviations = 0;
        int numberOfAnsweredQuestions = player.getAnsweredQuestions().size();

        for (AnsweredQuestion answeredQuestion : player.getAnsweredQuestions()) {
            sumOfDeviations += answeredQuestion.getDeviation();
        }

        double averageDeviation = round(sumOfDeviations / numberOfAnsweredQuestions, 2);
        player.setAverageDeviation(averageDeviation);
    }

    // calculateScore
    private void calculateScore(Player player) {
        if (player.getAnsweredQuestions() == null || player.getAnsweredQuestions().isEmpty()) {
            player.setScore(0);
            return;
        }

        int totalScore = 0;

        for (AnsweredQuestion answeredQuestion : player.getAnsweredQuestions()) {
            double deviation = answeredQuestion.getDeviation();
            int roundedDeviation = (int) Math.round(deviation);

            if (roundedDeviation <= 1) {
                totalScore += 100;
            } else {
                totalScore += (100 - (roundedDeviation - 1));
            }
        }

        player.setScore(totalScore);
    }
}

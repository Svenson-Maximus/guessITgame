    package ch.zhaw.guess.service;

    import ch.zhaw.guess.model.AnsweredQuestion;
    import ch.zhaw.guess.model.AnsweredQuestionDTO;
    import ch.zhaw.guess.model.Player;
    import ch.zhaw.guess.model.Question;
    import ch.zhaw.guess.repository.PlayerRepository;
    import ch.zhaw.guess.repository.QuestionRepository;

import java.util.ArrayList;

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
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + answeredQuestionDTO.getQuestionId()));

        int difference = (int) Math.abs(question.getCorrectAnswer() - answeredQuestionDTO.getPlayerAnswer());

        AnsweredQuestion answeredQuestion = new AnsweredQuestion(
                answeredQuestionDTO.getQuestionId(),
                answeredQuestionDTO.getPlayerAnswer(),
                difference, question.getCorrectAnswer()
        );

        if (player.getAnsweredQuestions() == null) {
            player.setAnsweredQuestions(new ArrayList<>());
        }

        player.getAnsweredQuestions().add(answeredQuestion);
        return playerRepository.save(player);
    }
}

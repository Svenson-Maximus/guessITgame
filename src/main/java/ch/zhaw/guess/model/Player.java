package ch.zhaw.guess.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@Document("player")
public class Player {
    @Id
    private String id;
    @NonNull
    private String email;
    @NonNull
    private String username;
    private PlayerLevelState playerLevelState = PlayerLevelState.LEVEL_1;
    private double averageDeviation;
    private int score;
    private String roboHashUrl;
    private List<AnsweredQuestion> answeredQuestions;

    public void setAnsweredQuestions(List<AnsweredQuestion> answeredQuestions) {
        this.answeredQuestions = answeredQuestions;
    }
}

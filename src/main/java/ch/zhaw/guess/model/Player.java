package ch.zhaw.guess.model;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Document("player")
public class Player {
    @Id
    private String id;
    @NonNull
    private String email;
    @NonNull
    private String username;
    private List<AnsweredQuestion> answeredQuestions;
    private Map<Integer, LevelState> levelStates;
}

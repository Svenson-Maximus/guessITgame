package ch.zhaw.guess.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AnsweredQuestion {
    private String questionId;
    private int playerAnswer;
    private int difference;
    private int correctAnswer;
    private double deviation;
    private int questionScore;
}
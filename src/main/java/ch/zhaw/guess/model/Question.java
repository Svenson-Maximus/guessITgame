package ch.zhaw.guess.model;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Document("question")
public class Question {
    private String id;
    private String questionText;
    private int correctAnswer;
    private String level;
    
}
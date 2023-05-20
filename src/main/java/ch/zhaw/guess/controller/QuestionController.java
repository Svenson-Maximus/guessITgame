package ch.zhaw.guess.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.guess.model.Question;
import ch.zhaw.guess.repository.QuestionRepository;

@RestController
@RequestMapping("/api")
public class QuestionController {
    @Autowired
    QuestionRepository questionRepository;


    @GetMapping("/question")
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> allQuestions = questionRepository.findAll();
        return new ResponseEntity<>(allQuestions, HttpStatus.OK);
    }

    @GetMapping("/question/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable String id) {
        Optional<Question> optQuestion = questionRepository.findById(id);

        if (optQuestion.isPresent()) {
            Question question = optQuestion.get();
            return new ResponseEntity<>(question, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

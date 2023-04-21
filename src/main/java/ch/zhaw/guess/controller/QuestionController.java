package ch.zhaw.guess.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.guess.model.Question;
import ch.zhaw.guess.repository.QuestionRepository;

@RestController
@RequestMapping("/api")
public class QuestionController {
    @Autowired
    QuestionRepository questionRepository;

    @PostMapping("/question")
    public ResponseEntity<Question> createQuestion(
            @RequestBody Question question) {
        Question newQuestion = questionRepository.save(question);
        return new ResponseEntity<>(newQuestion, HttpStatus.CREATED);
    }

    @GetMapping("/question")
    public ResponseEntity<Page<Question>> getAllQuestions(
            @RequestParam(required = false, defaultValue = "1") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        Page<Question> allQuestions = questionRepository.findAll(PageRequest.of(pageNumber - 1, pageSize));
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

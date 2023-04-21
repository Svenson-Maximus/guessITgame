package ch.zhaw.guess.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.guess.model.Question;

public interface QuestionRepository extends MongoRepository<Question, String> {
}

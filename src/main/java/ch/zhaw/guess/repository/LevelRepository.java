package ch.zhaw.guess.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.guess.model.Level;


public interface LevelRepository extends MongoRepository<Level, String> {
}

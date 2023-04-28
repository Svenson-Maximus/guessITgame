package ch.zhaw.guess.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import ch.zhaw.guess.model.Player;


public interface PlayerRepository extends MongoRepository<Player, String> {
    Player findFirstByEmail(String email);
}

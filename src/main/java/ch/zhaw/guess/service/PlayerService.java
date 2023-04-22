package ch.zhaw.guess.service;

import ch.zhaw.guess.model.Player;
import ch.zhaw.guess.model.PlayerLevelStateDTO;
import ch.zhaw.guess.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    public Player updatePlayerLevelState(String playerId, PlayerLevelStateDTO newLevelStateDTO) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + playerId));

        player.setPlayerLevelState(newLevelStateDTO.getLevel());
        return playerRepository.save(player);
    }
}

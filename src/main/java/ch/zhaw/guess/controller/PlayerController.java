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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.guess.model.Player;
import ch.zhaw.guess.model.PlayerDTO;
import ch.zhaw.guess.model.PlayerLevelState;
import ch.zhaw.guess.repository.PlayerRepository;
import ch.zhaw.guess.service.PlayerService;

@RestController
@RequestMapping("/api")
public class PlayerController {
    @Autowired
    PlayerRepository playerRepository;

    @PostMapping("/player")
    public ResponseEntity<Player> createPlayer(
            @RequestBody PlayerDTO pDTO) {
        Player pDAO = new Player(pDTO.getEmail(), pDTO.getUsername());
        Player p = playerRepository.save(pDAO);
        return new ResponseEntity<>(p, HttpStatus.CREATED);
    }

    @GetMapping("/player")
    public ResponseEntity<Page<Player>> getAllPlayer(
            @RequestParam(required = false, defaultValue = "1") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        Page<Player> allPlayers = playerRepository.findAll(PageRequest.of(pageNumber - 1, pageSize));
        return new ResponseEntity<>(allPlayers, HttpStatus.OK);
    }

    @GetMapping("/player/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable String id) {
        Optional<Player> optPlayer = playerRepository.findById(id);

        if (optPlayer.isPresent()) {
            Player player = optPlayer.get();
            return new ResponseEntity<>(player, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Autowired
    private PlayerService playerService;

    @PutMapping("/player/{id}/levelstate")
    public ResponseEntity<Player> updatePlayerLevelState(@PathVariable String id,
                                                          @RequestBody PlayerLevelState newLevelState) {
        Player updatedPlayer = playerService.updatePlayerLevelState(id, newLevelState);
        return new ResponseEntity<>(updatedPlayer, HttpStatus.OK);
    }
}



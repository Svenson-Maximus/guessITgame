package ch.zhaw.guess.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.guess.model.AnsweredQuestionDTO;
import ch.zhaw.guess.model.Player;
import ch.zhaw.guess.model.PlayerDTO;
import ch.zhaw.guess.model.PlayerLevelStateDTO;
import ch.zhaw.guess.repository.PlayerRepository;
import ch.zhaw.guess.service.AnswerQuestionService;
import ch.zhaw.guess.service.PlayerService;

@RestController
@RequestMapping("/api")
public class PlayerController {
    @Autowired
    PlayerRepository playerRepository;

    @Autowired
    private AnswerQuestionService answerQuestionService;

    @PostMapping("/player")
    public ResponseEntity<Player> createPlayer(
            @RequestBody PlayerDTO pDTO) {
        Player pDAO = new Player(pDTO.getEmail(), pDTO.getUsername());
        Player p = playerRepository.save(pDAO);
        return new ResponseEntity<>(p, HttpStatus.CREATED);
    }

    @GetMapping("/player")
    @Secured("ROLE_admin")
    public ResponseEntity<Page<Player>> getAllPlayer(
            @RequestParam(required = false, defaultValue = "1") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        Page<Player> allPlayers = playerRepository.findAll(PageRequest.of(pageNumber - 1, pageSize));
        return new ResponseEntity<>(allPlayers, HttpStatus.OK);
    }

    @GetMapping("/player/{id}")
    @Secured("ROLE_admin")
    public ResponseEntity<Player> getPlayerById(@PathVariable String id) {
        Optional<Player> optPlayer = playerRepository.findById(id);

        if (optPlayer.isPresent()) {
            Player player = optPlayer.get();
            return new ResponseEntity<>(player, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/player/answer")
public ResponseEntity<Player> answerQuestion(@RequestHeader("Player-Id") String playerId,
        @RequestBody AnsweredQuestionDTO answeredQuestionDTO) {
    Player updatedPlayer = answerQuestionService.answerQuestion(playerId, answeredQuestionDTO);
    return new ResponseEntity<>(updatedPlayer, HttpStatus.OK);
}


    @Autowired
    private PlayerService playerService;

    @PutMapping("/player/{id}/levelstate")
    public ResponseEntity<Player> updatePlayerLevelState(@PathVariable String id,
            @RequestBody PlayerLevelStateDTO newLevelStateDTO) {
        Player updatedPlayer = playerService.updatePlayerLevelState(id, newLevelStateDTO);
        return new ResponseEntity<>(updatedPlayer, HttpStatus.OK);
    }

    @GetMapping("/me/player")
    public ResponseEntity<Player> assignToMe(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        Player player = playerRepository.findFirstByEmail(email);
        if (player != null) {
            return new ResponseEntity<>(player, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
}

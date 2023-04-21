package ch.zhaw.guess.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.guess.model.Level;
import ch.zhaw.guess.repository.LevelRepository;

@RestController
@RequestMapping("/api")
public class LevelController {
    @Autowired
    LevelRepository levelRepository;

    @GetMapping("/level")
    public ResponseEntity<Page<Level>> getAllLevels(
            @RequestParam(required = false, defaultValue = "1") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        Page<Level> allLevels = levelRepository.findAll(PageRequest.of(pageNumber - 1, pageSize));
        return new ResponseEntity<>(allLevels, HttpStatus.OK);
    }

    @GetMapping("/level/{id}")
    public ResponseEntity<Level> getLevelById(@PathVariable String id) {
        Optional<Level> optLevel = levelRepository.findById(id);

        if (optLevel.isPresent()) {
            Level level = optLevel.get();
            return new ResponseEntity<>(level, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

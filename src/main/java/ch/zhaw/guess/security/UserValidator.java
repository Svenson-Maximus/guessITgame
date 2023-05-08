package ch.zhaw.guess.security;


import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import ch.zhaw.guess.model.Player;
import ch.zhaw.guess.repository.PlayerRepository;



class UserValidator implements OAuth2TokenValidator<Jwt> {

    PlayerRepository playerRepository;

    public UserValidator(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        OAuth2Error error = new OAuth2Error("invalid_token", "The required email is missing", null);

        String email = jwt.getClaimAsString("email");
        if (email != null && !email.equals("")) { 
            Player f = playerRepository.findFirstByEmail(email);
            if (f==null ) {     
                String username = jwt.getClaimAsString("nickname");
                playerRepository.save(new Player(email, username));
            }
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(error);
    }
}



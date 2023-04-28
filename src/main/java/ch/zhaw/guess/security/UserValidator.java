package ch.zhaw.guess.security;
import java.util.List;

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

        String userEmail = jwt.getClaimAsString("email");
        List<String> userRoles = jwt.getClaimAsStringList("user_roles");
        if (userEmail != null && !userEmail.equals("")) { 
            Player f = playerRepository.findFirstByEmail(userEmail);
            if (f==null && (userRoles==null || userRoles.isEmpty())) {     
                String username = jwt.getClaimAsString("nickname");
                playerRepository.save(new Player(userEmail, username));
            }
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(error);
    }
}



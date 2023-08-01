package cmpt276.project.djjnp.projectdjjnp;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import cmpt276.project.djjnp.projectdjjnp.controllers.EventController;
import cmpt276.project.djjnp.projectdjjnp.controllers.UsersLogin;

@SpringBootTest
public class ControllerTests {
    
    @Autowired
    private UsersLogin userController;

    @Autowired
    private EventController eventController;

    @Test
    public void contextLoads() throws Exception{
        assertThat(userController).isNotNull();
        assertThat(eventController).isNotNull();
    }
}

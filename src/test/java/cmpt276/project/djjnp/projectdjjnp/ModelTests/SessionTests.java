package cmpt276.project.djjnp.projectdjjnp.ModelTests;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;

import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@AutoConfigureMockMvc
public class SessionTests {
    @MockBean
    private UserRepository userRepo;

    @Autowired
    private MockMvc mvc;

    @Test
    public void testNoSession() throws Exception {
        mvc.perform(MockMvcRequestBuilders.get("/home"))
                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/view/login"));
    }

    @Test
    public void testInvalidSession() throws Exception {
        String invalid_email = "invalid@example.com";
        String invalid_password = "invalidpassword";

        User invalidUser = new User();
        invalidUser.setEmail(invalid_email);
        invalidUser.setPassword(invalid_password);

        MockHttpSession session = new MockHttpSession();
        // EXCLUDE: there should be no existing session for this user
        // session.setAttribute("sessionUser", invalidUser);

        mvc.perform(MockMvcRequestBuilders.get("/home").session(session))
                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/view/login"));
    }

    @Test
    public void testValidSession() throws Exception {
        String valid_email = "valid@example.com";
        String valid_password = "validpassword";

        User validUser = new User();
        validUser.setEmail(valid_email);
        validUser.setPassword(valid_password);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("sessionUser", validUser);

        mvc.perform(MockMvcRequestBuilders.get("/home").session(session))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.view().name("view/homePage"));
    }

}
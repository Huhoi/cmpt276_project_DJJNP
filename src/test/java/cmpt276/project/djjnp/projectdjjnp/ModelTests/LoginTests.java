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
import jakarta.servlet.http.HttpSession;

import org.springframework.boot.test.context.SpringBootTest;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
public class LoginTests {
    @MockBean
    private UserRepository userRepo;

    @Autowired
    private MockMvc mvc;

    @Test
    public void testRegisterSuccess() throws Exception {
        String email = "user@example.com";
        String password = "password";

        User user = new User();
        user.setEmail(email);
        user.setPassword(password);

        List<User> users = new ArrayList<User>();

        when(userRepo.findByEmail(email)).thenReturn(users);

        mvc.perform(MockMvcRequestBuilders.post("/view/registerUser")
                .param("email", email)
                .param("password", password))

                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/view/login"));
    }

    @Test
    public void testRegisterFail() throws Exception {
        String email1 = "user@example.com";
        String password1 = "password";

        String email2 = "user@example.com";
        String password2 = "different_password";

        User user1 = new User();
        user1.setEmail(email1);
        user1.setPassword(password1);

        User user2 = new User();
        user2.setEmail(email2);
        user2.setPassword(password2);

        List<User> users = new ArrayList<User>();
        users.add(user1);

        when(userRepo.findByEmail(email2)).thenReturn(users);

        mvc.perform(MockMvcRequestBuilders.post("/view/registerUser")
                .param("email", email2)
                .param("password", password2))

                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/view/register"));
    }

    @Test
    public void testLoginSuccess() throws Exception {
        String login_email = "user@example.com";
        String login_password = "password";

        User user = new User();
        user.setEmail(login_email);
        user.setPassword(login_password);

        List<User> users = new ArrayList<User>();
        users.add(user);

        when(userRepo.findByEmailAndPassword(login_email, login_password)).thenReturn(users);

        mvc.perform(MockMvcRequestBuilders.post("/view/loginUser")
                .param("email", login_email)
                .param("password", login_password))

                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/home"));
    }

    @Test
    public void testLoginInvalidEmail() throws Exception {
        String login_email = "user@example.com";
        String login_password = "password";

        String invalid_email = "fakeuser@example.com";

        User user = new User();
        user.setEmail(login_email);
        user.setPassword(login_password);

        List<User> users = new ArrayList<User>();
        users.add(user);

        when(userRepo.findByEmailAndPassword(login_email, login_password)).thenReturn(users);

        mvc.perform(MockMvcRequestBuilders.post("/view/loginUser")
                .param("email", invalid_email)
                .param("password", login_password))

                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/view/login"));
    }

    @Test
    public void testLoginIncorrectPassword() throws Exception {
        String login_email = "user@example.com";
        String login_password = "password";

        String incorrect_password = "fakepassword";

        User user = new User();
        user.setEmail(login_email);
        user.setPassword(login_password);

        List<User> users = new ArrayList<User>();
        users.add(user);

        when(userRepo.findByEmailAndPassword(login_email, login_password)).thenReturn(users);

        mvc.perform(MockMvcRequestBuilders.post("/view/loginUser")
                .param("email", login_email)
                .param("password", incorrect_password))

                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/view/login"));
    }

    @Test
    public void testLoginAdmin() throws Exception {
        String login_email = "adminEmail";
        String login_password = "adminpassword";

        User user = new User();
        user.setEmail(login_email);
        user.setPassword(login_password);

        List<User> users = new ArrayList<User>();
        users.add(user);

        when(userRepo.findByEmailAndPassword(login_email, login_password)).thenReturn(users);

        mvc.perform(MockMvcRequestBuilders.post("/view/loginUser")
                .param("email", login_email)
                .param("password", login_password))

                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/accountAdmin"));
    }

    @Test
    public void testLogout() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("sessionUser", "testUser");

        mvc.perform(MockMvcRequestBuilders.get("/logout"))
                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.view().name("redirect:/view/login"));
    }
}

package cmpt276.project.djjnp.projectdjjnp.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import cmpt276.project.djjnp.projectdjjnp.models.User;

@Controller
public class UsersLogin {
    @GetMapping("/view/login")
    public String getLogin(Model model){
        
        List<User> users = new ArrayList<>();
        users.add(new User("adminemail", "adminpassword"));
        model.addAttribute("us", users);

        return "view/loginPage";
    }


}

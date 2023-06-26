package cmpt276.project.djjnp.projectdjjnp.controllers;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;
import cmpt276.project.djjnp.projectdjjnp.service.UserService;

@Controller
public class UsersLogin {
    
    @Autowired
    private UserService service;
    
    @GetMapping("/view/register")
    public String register(Model model){
        
        User users = new User();
        model.addAttribute("us", users);
    
        return "view/registrationPage";
    }

    @PostMapping("/view/registerUser")
    public String registerUser(@ModelAttribute("us") User user){
        service.registerUser(user);
        return "view/login";
    }

    @GetMapping("/view/login")
    public String login(Model model){
        return "view/loginPage";
    }




}

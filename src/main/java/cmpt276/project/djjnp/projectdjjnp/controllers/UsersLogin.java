package cmpt276.project.djjnp.projectdjjnp.controllers;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;
import cmpt276.project.djjnp.projectdjjnp.service.UserService;
import cmpt276.project.djjnp.projectdjjnp.service.UserServiceImplementation;

@Controller
public class UsersLogin {
    
    @Autowired
    private UserService service;

    @Autowired(required = true)
    private UserRepository userRepo;

    //------------------------------------------
    // Registration Mapping
    //------------------------------------------
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

    //------------------------------------------
    // Login Mapping
    //------------------------------------------
    @GetMapping("/view/login")
    public String login(Model model){
        User users = new User();
        model.addAttribute("us", users);
        return "view/loginPage";
    }

    @PostMapping("/view/loginUser")
    public String loginUser(@ModelAttribute("us") User user){
        System.out.println(user.getEmail());
        System.out.println(user.getPassword());
        
        String userEmail = user.getEmail();
        User userData = this.userRepo.findByEmail(userEmail);

        if(user.getPassword().equals(userData.getPassword())){
            return "view/success";
        }
        else{
            return"view/loginPage";
        }
        
    }




}

package cmpt276.project.djjnp.projectdjjnp.controllers;


import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;
import cmpt276.project.djjnp.projectdjjnp.service.UserService;
import cmpt276.project.djjnp.projectdjjnp.service.UserServiceImplementation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

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
    public String login(Model model, HttpServletRequest request, HttpSession session){
        User users = new User();
        model.addAttribute("us", users);
        return "view/loginPage";
    }

    @PostMapping("/view/loginUser")
    public String loginUser(@RequestParam Map<String,String> formData, Model model, HttpServletRequest request, HttpSession session, @ModelAttribute("us") User user){
        System.out.println(user.getEmail());
        System.out.println(user.getPassword());
        
        String userEmail = formData.get("email");
        String userPassword = formData.get("password");

        List<User> userList = userRepo.findByEmailAndPassword(userEmail, userPassword);

        if (userList.isEmpty()) {
            return "view/loginPage";
        }
        else {
            User newUser = userList.get(0);
            request.getSession().setAttribute("sessionUser", newUser);
            model.addAttribute("user", newUser);
            System.out.println("~~~ Creating new session for email: " + userEmail + " ~~~\n~~~ Session ID: " + request.getSession().getId() + " ~~~");
            return "view/success";
        }
    }

    //------------------------------------------
    // Logout Mapping
    //------------------------------------------
    @GetMapping("/view/logout")
    public String destroySession(HttpServletRequest request) {
        request.getSession().invalidate();
        return "view/loginPage";
    }





}

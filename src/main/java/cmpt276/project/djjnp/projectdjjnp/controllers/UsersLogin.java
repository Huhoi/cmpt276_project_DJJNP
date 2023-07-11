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
import org.springframework.web.servlet.view.RedirectView;

import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;
import cmpt276.project.djjnp.projectdjjnp.service.UserService;
import cmpt276.project.djjnp.projectdjjnp.service.UserServiceImplementation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Controller
public class UsersLogin {
    
    @Autowired
    private UserService service;

    @Autowired(required = true)
    private UserRepository userRepo;

    @GetMapping("/")
    public RedirectView homeRedirect() {
        return new RedirectView("view/login");
    }

    //------------------------------------------
    // Registration Mapping
    //------------------------------------------
    @GetMapping("/view/register")
    public String register(Model model) {
        
        User users = new User();
        model.addAttribute("us", users);
    
        return "view/registrationPage";
    }

    @PostMapping("/view/registerUser")
    public String registerUser(@RequestParam Map<String,String> formData, Model model, HttpServletRequest request, HttpSession session, @ModelAttribute("us") User user) {
        String userEmail = formData.get("email");

        List<User> userList = userRepo.findByEmail(userEmail);

        if (userList.isEmpty()) {
            String userPass = formData.get("password");
            user.setEmail(userEmail);
            user.setPassword(userPass);
            service.registerUser(user);
            return "redirect:/view/login";
        }
        else {
            return "redirect:/view/register";
        }
    }

    
    //------------------------------------------
    // Login Mapping
    //------------------------------------------
    @GetMapping("/view/login")

    public String login(Model model, HttpServletRequest request, HttpSession session, HttpServletResponse response){
        User users = new User();
        model.addAttribute("us", users);
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.
        if(request.getSession().getAttribute("sessionUser") != null){
            return "redirect:/home";
        }
        return "view/loginPage";
    }

    @PostMapping("/view/loginUser")
    public String loginUser(@RequestParam Map<String,String> formData, Model model, HttpServletRequest request, HttpSession session, @ModelAttribute("us") User user) {
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
            System.out.println("~~~ Creating new session for email: " + newUser.getEmail() + " ~~~\n~~~ Session ID: " + request.getSession().getId() + " ~~~");
           
            // Checks if ADMIN account
            if(newUser.getEmail().equals("adminEmail")) {
                return "redirect:/accountAdmin";
            }
            else {
                return "redirect:/home";
            }
           
        }
    }



    //------------------------------------------
    // Logout Mapping
    //------------------------------------------
    @GetMapping("/logout")
    public String destroySession(HttpServletRequest request, HttpServletResponse response, HttpSession session) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.
        request.getSession().removeAttribute("sessionUser");
        request.getSession().invalidate();
        if(request.getSession().getAttribute("sessionUser") == null){
            return "redirect:/view/login";
        }
        return "redirect:/view/login";
    }

    //------------------------------------------
    // Delete Mapping
    //------------------------------------------
    @GetMapping("/delete/{uid}")
    public String deleteAdminView(@PathVariable String uid, HttpServletRequest request, @RequestParam Map<String,String> formData, @ModelAttribute("us") User user) {

        int id = Integer.parseInt(uid);
        User u = userRepo.findById(id).get();

        userRepo.delete(u);
        
        return "redirect:/accountAdmin";

    }

    @GetMapping("/deleteUser/{uid}")
    public String deleteUser(@PathVariable String uid, HttpServletRequest request) {

        int id = Integer.parseInt(uid);
        User u = userRepo.findById(id).get();

        System.out.println("~~~ Deleting session for email: " + u.getEmail() + " ~~~\n~~~ Session ID: " + request.getSession().getId() + " ~~~");

        userRepo.delete(u);
        request.getSession().invalidate();

        return "redirect:/view/login";
    }

    //------------------------------------------
    // Home Page After Logging In
    //------------------------------------------
    @GetMapping("/home")
    public String showHome(Model model, HttpServletRequest request, HttpSession session, HttpServletResponse response){
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.

        if(request.getSession().getAttribute("sessionUser") == null){
            return "redirect:/view/login";
        }

        User currentUser = (User) request.getSession().getAttribute("sessionUser");
        model.addAttribute("user", currentUser);
        return "view/homePage";
    }

    //------------------------------------------
    // Calendar Page
    //------------------------------------------
    @GetMapping("/calendar")
    public String showCalendar(Model model, HttpServletRequest request, HttpSession session, HttpServletResponse response){
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.

        if(request.getSession().getAttribute("sessionUser") == null){
            return "redirect:/view/login";
        }
        User currentUser = (User) request.getSession().getAttribute("sessionUser");
        model.addAttribute("user", currentUser);
        return "view/calendarPage";
    }

    //------------------------------------------
    // Display Page
    //------------------------------------------
    @GetMapping("/display")
    public String showMap(Model model, HttpServletRequest request, HttpSession session) {
        // get info from database to display on map/list
        return "view/displayPage";
    }

  
    //------------------------------------------
    // Account Page
    //------------------------------------------
    @GetMapping("/account")
    public String showAccount(Model model, HttpServletRequest request, HttpSession session, HttpServletResponse response){
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.

        if(request.getSession().getAttribute("sessionUser") == null){
            return "redirect:/view/login";
          
        User currentUser = (User) request.getSession().getAttribute("sessionUser");
        model.addAttribute("user", currentUser);
        
        // Checks if ADMIN account else REGULAR user
        if(currentUser.getPassword().equals("adminPass")) {
            List<User> users = userRepo.findAll();
            model.addAttribute("us", users);
            return "view/accountAdminPage";
        }
        else {
            return "view/accountPage";
        }
    }

    //------------------------------------------
    // Admin Account Page
    //------------------------------------------
    @GetMapping("/accountAdmin")
    public String showAdminAccount(Model model, HttpServletResponse response, HttpServletRequest request){
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.
        
        if(request.getSession().getAttribute("sessionUser") == null){
            return "redirect:/view/login";
        }
        //Get all users from database
        List<User> users = userRepo.findAll();
        model.addAttribute("us", users);
        return "view/accountAdminPage";
    }

}

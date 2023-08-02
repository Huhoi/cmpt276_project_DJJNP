package cmpt276.project.djjnp.projectdjjnp.controllers;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

import cmpt276.project.djjnp.projectdjjnp.models.Event;
import cmpt276.project.djjnp.projectdjjnp.models.EventRepository;
import cmpt276.project.djjnp.projectdjjnp.models.Location;
import cmpt276.project.djjnp.projectdjjnp.models.LocationRepository;
import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;
import cmpt276.project.djjnp.projectdjjnp.models.ShareLink;
import cmpt276.project.djjnp.projectdjjnp.service.ShareLinkService;
import cmpt276.project.djjnp.projectdjjnp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Controller
public class UsersLogin {
    
    @Autowired
    private UserService service;

    @Autowired(required = true)
    private UserRepository userRepo;

    @Autowired(required = true)
    private EventRepository eventRepo;

    @Autowired(required = true)
    private LocationRepository locationRepo;

    @Autowired
    private ShareLinkService shareLinkService;

    private String errorMessageString = "";

    private String loginErrorMessageString = "";

    @GetMapping("/")
    public RedirectView homeRedirect() {
        return new RedirectView("view/login");
    }
    
    //------------------------------------------
    // Registration Mapping
    //------------------------------------------
    @GetMapping("/view/register")
    public String register(Model model) {   
        loginErrorMessageString = "";
        User users = new User();
        model.addAttribute("us", users);
        
        model.addAttribute("errorMessage", errorMessageString);
    
        return "view/registrationPage";
    }

    @PostMapping("/view/registerUser")
    public String registerUser(@RequestParam Map<String,String> formData, Model model, HttpServletRequest request, HttpSession session, @ModelAttribute("us") User user) {
        String userEmail = formData.get("email");

        List<User> userList = userRepo.findByEmail(userEmail);
        model.addAttribute("error", userEmail);

        if (userList.isEmpty()) {
            String userPass = formData.get("password");
            user.setEmail(userEmail);
            user.setPassword(userPass);
            service.registerUser(user);
            return "redirect:/view/login";
        }
        else {
            errorMessageString = "Email/Username Already Exists!";
            return "redirect:/view/register";
        }
    }

    
    //------------------------------------------
    // Login Mapping
    //------------------------------------------
    @GetMapping("/view/login")
    public String login(Model model, HttpServletRequest request, HttpSession session, HttpServletResponse response){
        errorMessageString = "";
        User users = new User();
        model.addAttribute("us", users);
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.

        model.addAttribute("loginErrorMessage", loginErrorMessageString);
    
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
            loginErrorMessageString = "Incorrect Password/Invalid Email!";
           return "redirect:/view/login";
        }
        else {
            User newUser = userList.get(0);
            request.getSession().setAttribute("sessionUser", newUser);
            model.addAttribute("user", newUser);
            System.out.println("~~~ Creating new session for email: " + newUser.getEmail() + " ~~~\n~~~ Session ID: " + request.getSession().getId() + " ~~~");
           
            // Checks if ADMIN account
            if(newUser.getEmail().equals("adminEmail")) {
                loginErrorMessageString = "";
                return "redirect:/accountAdmin";
            }
            else {
                loginErrorMessageString = "";
                return "redirect:/home";
            }
           
        }
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
    public String showCalendar(@RequestParam Map<String, String> form, Model model, HttpServletRequest request,
            HttpSession session, HttpServletResponse response) throws Exception {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.

        if (request.getSession().getAttribute("sessionUser") == null) {
            return "redirect:/view/login";
        }


        if(request.getSession().getAttribute("sessionUserShare") == null){
            return "redirect:/share";
        }
        else{
            ShareLink currentUserShare = (ShareLink) request.getSession().getAttribute("sessionUserShare");
            // String userShare = currentUserShare.getShareLink();
            // System.out.println("This is the share link" + userShare);
            model.addAttribute("currentUserShare", currentUserShare);
        }
        

        //Get Data
        User currentUser = (User) request.getSession().getAttribute("sessionUser");
        List<Event> currentUserEvent = eventRepo.findAll();


        
        model.addAttribute("user", currentUser);
        model.addAttribute("event", currentUserEvent);

        return "view/calendarPage";
    }

    //------------------------------------------
    // Display Page
    //------------------------------------------
    @GetMapping("/display")
    public String showMap(Model model, HttpServletRequest request, HttpSession session, HttpServletResponse response) {
        // get info from database to display on map/list
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.

        User currentUser = (User) request.getSession().getAttribute("sessionUser");
        List<Event> currentUserEvent = eventRepo.findAll();
        List<Location> currentUserLocation = locationRepo.findAll();

        if (request.getSession().getAttribute("sessionUser") == null) {
            return "redirect:/view/login";
        }

        LocalDate curDate = LocalDate.now();


        model.addAttribute("curDate", curDate);
        model.addAttribute("user", currentUser);
        model.addAttribute("event", currentUserEvent);
        model.addAttribute("location", currentUserLocation);

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

        if (request.getSession().getAttribute("sessionUser") == null) {
            return "redirect:/view/login";
        }
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
    public String showAdminAccount(Model model, HttpServletResponse response, HttpServletRequest request) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setDateHeader("Expires", 0); // Proxies.

        if (request.getSession().getAttribute("sessionUser") == null) {
            return "redirect:/view/login";
        }
        //Get all users from database
        List<User> users = userRepo.findAll();
        model.addAttribute("us", users);
        return "view/accountAdminPage";
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
        List<Event> userEvents = eventRepo.findByUid(u.getUid());
        for (int i = 0; i < userEvents.size(); i++){
            eventRepo.delete(userEvents.get(i));
        }
        request.getSession().invalidate();

        return "redirect:/view/login";
    }

    @GetMapping("/share")
    public String generateShareLink(HttpServletRequest request){
        User currentUser = (User) request.getSession().getAttribute("sessionUser");

        int uid = currentUser.getUid();
        String userName = currentUser.getEmail();
        String shareToken = generateShareToken();
        LocalDateTime expDateTime = LocalDateTime.now().plusMinutes(5);

        ShareLink shareLink = new ShareLink();
        shareLink.setUid(uid);
        shareLink.setShareToken(shareToken);
        shareLink.setExpirationTimestamp(expDateTime);
        shareLink.setUserName(userName);
        
        // RENDER LINK
        String shareLinkUrl = "https://project-djjnp-iteration1.onrender.com/share/" + shareToken;

        // LOCAL HOST LINK
        // String shareLinkUrl = "http://localhost:8080/share/" + shareToken;

        shareLink.setShareLink(shareLinkUrl);
        shareLinkService.saveShareLink(shareLink);
        request.getSession().setAttribute("sessionUserShare", shareLink);

        return "redirect:/calendar";
    }

    // Helper Function for share
    // Generates unique share token
    public static String generateShareToken() {
        UUID uuid = UUID.randomUUID();
        String token = uuid.toString();
        return token;
    }

    @GetMapping("/share/{shareToken}")
    public RedirectView handleShareLink(@PathVariable String shareToken, Model model){
        ShareLink shareLink = shareLinkService.getShareLinkByToken(shareToken);

        if (shareLink != null && !isShareLinkExpired((ShareLink) shareLink)){
            model.addAttribute("shareToken", shareLink);
            return new RedirectView("/shareSuccess/{shareToken}");
        }
        else{
            return new RedirectView("/shareError");
        }
    }

    // Helper Function for share
    // Helps check if share link is valid
    private boolean isShareLinkExpired(ShareLink shareLink){
        return shareLink.getExpirationTimestamp().isBefore(LocalDateTime.now());
    }

    @GetMapping("/shareError")
    public String expiredShareLink(){
        return "view/expiredShareLink";
    }

    @GetMapping("/shareSuccess/{shareToken}")
    public String shareSuccess(Model model, @PathVariable String shareToken ){
        ShareLink shareLink = shareLinkService.getShareLinkByToken(shareToken);
        int uid = shareLinkService.getUidFromShareLink(shareLink);
        String userName = shareLinkService.getUserNameFromShareLink(shareLink);
        
        model.addAttribute("shareLink", shareLink);
        model.addAttribute("shareUid", uid);
        model.addAttribute("shareUserName", userName);

        return "view/shareSuccess";
    }
    
}
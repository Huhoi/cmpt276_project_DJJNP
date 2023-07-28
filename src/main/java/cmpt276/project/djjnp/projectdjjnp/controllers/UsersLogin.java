package cmpt276.project.djjnp.projectdjjnp.controllers;


import java.text.SimpleDateFormat;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.support.incrementer.SybaseAnywhereMaxValueIncrementer;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import cmpt276.project.djjnp.projectdjjnp.models.Event;
import cmpt276.project.djjnp.projectdjjnp.models.EventRepository;
import cmpt276.project.djjnp.projectdjjnp.models.Location;
import cmpt276.project.djjnp.projectdjjnp.models.LocationRepository;
import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;
import cmpt276.project.djjnp.projectdjjnp.models.ShareLink;
import cmpt276.project.djjnp.projectdjjnp.models.ShareLinkRepository;
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

    @Autowired(required = true)
    private ShareLinkRepository shareLinkRepo;

    @Autowired
    private ShareLinkService shareLinkService;

    private String errorMessageString = "";

    private final LocationController locationController;

    @Autowired
    public UsersLogin(LocationController locationController){
        this.locationController = locationController;
    }

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
            errorMessageString = "Email Already Exists";
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

        //Get Data
        User currentUser = (User) request.getSession().getAttribute("sessionUser");
        List<Event> currentUserEvent = eventRepo.findAll();


        
        model.addAttribute("user", currentUser);
        model.addAttribute("event", currentUserEvent);

        return "view/calendarPage";
    }

    //Adding From Calendar
    // @PostMapping("/calendar/add")
    // public String addCalendar(@RequestParam Map<String, String> form, Model model, HttpServletRequest request,
    //         HttpSession session, HttpServletResponse response) throws Exception {
    //     //Saves Event
    //     User currentUser = (User) request.getSession().getAttribute("sessionUser");
    //     model.addAttribute("user", currentUser);

    //     //Gets Paremeters from form
    //     int id = currentUser.getUid();
    //     String event = form.get("eventTitleInput");
    //     int timeBegin = Integer.parseInt(form.get("timeBegin"));
    //     int timeEnd = Integer.parseInt(form.get("timeEnd"));
    //     String locationLatitude = form.get("locationLat");
    //     String locationLongitude = form.get("locationLng");

    

    //     //Gets selected date
    //     SimpleDateFormat formatter = new SimpleDateFormat("MM/dd/yyyy");
    //     Date date = formatter.parse(form.get("selectedDate"));
    //     String dateAsString = formatter.format(date);
        

    //     //Prints into console for error check
    //     System.out.println("Event: " + event);
    //     System.out.println("Date: " + date);
    //     System.out.println("time: " + timeBegin);
    //     System.out.println("time: " + timeEnd);

    //     eventRepo.save(new Event(id, event, locationLatitude ,locationLongitude, timeBegin, timeEnd, dateAsString));

    //     return "redirect:/calendar";
    // }
    


    
    // //Delete From Event List
    // @GetMapping("/calendar/delete/{sid}")
    // public String deleteCalendar(@PathVariable String sid){
    //     eventRepo.deleteById(Integer.parseInt(sid));
    //     return "redirect:/calendar";
    // }
    



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

        model.addAttribute("user", currentUser);
        model.addAttribute("event", currentUserEvent);
        model.addAttribute("location", currentUserLocation);

        return "view/displayPage";
    }


    //Adds location to database
    // @PostMapping("/display/add")
    // public String showMapAdd(@RequestParam Map<String, String> form, Model model, HttpServletRequest request,
    //         HttpSession session, HttpServletResponse response) throws Exception {

    //     //Saves Location
    //     User currentUser = (User) request.getSession().getAttribute("sessionUser");
    //     List<Location> currentUserLocations = locationRepo.findAll();
    //     model.addAttribute("user", currentUser);
    //     model.addAttribute("location", currentUserLocations);
        
    //     //Gets parameters from form
    //     int id = currentUser.getUid();
    //     String timestamp = form.get("timestampInput");
    //     String latitude = form.get("latitudeInput");
    //     String longitude = form.get("longitudeInput");
    //     String description = form.get("descriptionInput");
        

    //     //Testing if it works
    //     System.out.println("Sumbiting");
    //     System.out.println("Timestamp: " + timestamp);
    //     System.out.println("Latitude: " + latitude);
    //     System.out.println("Longitude: " + longitude);
    //     System.out.println("Description: " + description);
        
    //     locationRepo.save(new Location(id, timestamp, latitude, longitude, description));

    //     return "redirect:/display";

    // }


  
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
        request.getSession().invalidate();

        return "redirect:/view/login";
    }

    @GetMapping("/share")
    @ResponseBody
    public String generateShareLink(HttpServletRequest request){
        User currentUser = (User) request.getSession().getAttribute("sessionUser");

        int uid = currentUser.getUid();
        String shareToken = generateShareToken();
        LocalDateTime expDateTime = LocalDateTime.now().plusMinutes(5);

        ShareLink shareLink = new ShareLink();
        shareLink.setUid(uid);
        shareLink.setShareToken(shareToken);
        shareLink.setExpirationTimestamp(expDateTime);
        
        shareLinkService.saveShareLink(shareLink);


        System.out.println("This is the current user id: " + uid);
        System.out.println("This is the current share token: " + shareToken);
        System.out.println("This is the current expiration time: " + expDateTime);

        //
        // CHANGE URL FOR RENDER
        //
        String shareLinkUrl = "http://localhost:8080/share/" + shareToken;

        ShareLink sharedLink = shareLinkService.getShareLinkByToken(shareToken);
        System.out.println("This is the current sharedlink: " + sharedLink);

        return shareLinkUrl;
    }

    public static String generateShareToken() {
        UUID uuid = UUID.randomUUID();
        String token = uuid.toString();
        return token;
    }

    @GetMapping("/share/{shareToken}")
    public RedirectView handleShareLink(@PathVariable String shareToken, Model model){
        ShareLink shareLink = shareLinkService.getShareLinkByToken(shareToken);
        System.out.println("This is the current sharelink: " + shareLink);

        if (shareLink != null && !isShareLinkExpired((ShareLink) shareLink)){
            model.addAttribute("shareToken", shareLink);
            return new RedirectView("/shareSuccess");
        }
        else{
            return new RedirectView("/shareError");
        }
    }

    private boolean isShareLinkExpired(ShareLink shareLink){
        return shareLink.getExpirationTimestamp().isBefore(LocalDateTime.now());
    }

    @GetMapping("/shareError")
    public String expiredShareLink(){
        return "view/expiredShareLink";
    }

    @GetMapping("/shareSuccess")
    public String shareSuccess(){
        return "view/shareSuccess";
    }
    
}



// // Controller-compatible Ajax call for live updates (unfinished)
// @PostMapping("/display/add")
// public ResponseEntity<?> showMapAdd(Errors errors) {

//     AjaxResponseBody result = new AjaxResponseBody();

//     if (errors.hasErrors()) {

//         result.setMsg(errors.getAllErrors()
//                     .stream().map(x -> x.getDefaultMessage())
//                     .collect(Collectors.joining(",")));

//         return ResponseEntity.badRequest().body(result);

//     }

//     //Saves Location
//     User currentUser = (User) request.getSession().getAttribute("sessionUser");
//     List<Location> currentUserLocations = locationRepo.findAll();
//     model.addAttribute("user", currentUser);
//     model.addAttribute("location", currentUserLocations);
    
//     //Gets parameters from form
//     int id = currentUser.getUid();
//     String timestamp = form.get("timestampInput");
//     String latitude = form.get("latitudeInput");
//     String longitude = form.get("longitudeInput");
//     String description = form.get("descriptionInput");
    

//     //Testing if it works
//     System.out.println("Sumbiting");
//     System.out.println("Timestamp: " + timestamp);
//     System.out.println("Latitude: " + latitude);
//     System.out.println("Longitude: " + longitude);
//     System.out.println("Description: " + description);
    
//     locationRepo.save(new Location(id, timestamp, latitude, longitude, description));

//     return "redirect:/display";
// }
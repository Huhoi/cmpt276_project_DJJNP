package cmpt276.project.djjnp.projectdjjnp.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cmpt276.project.djjnp.projectdjjnp.models.Event;
import cmpt276.project.djjnp.projectdjjnp.models.EventRepository;


@RestController
@RequestMapping("/api")
public class EventController {

    @Autowired(required = true)
    private EventRepository eventRepo;

    @GetMapping("/event")
    public List<Event> getEvents(){
        if (eventRepo.count() > 0){
            return eventRepo.findAll();
        }
        
        return null;
    }
}

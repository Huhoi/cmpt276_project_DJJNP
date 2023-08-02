package cmpt276.project.djjnp.projectdjjnp.service;

import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;


import cmpt276.project.djjnp.projectdjjnp.models.Event;
import cmpt276.project.djjnp.projectdjjnp.models.EventRepository;

@Service
public class EventServiceImplementation implements EventService {
    private final EventRepository eventRepo;

    @Autowired
    public EventServiceImplementation(EventRepository eventRepo) {
        this.eventRepo = eventRepo;
    }

    public List<Event> getAllEvents(){
        return eventRepo.findAll();
    }

    public void deleteEventById(int eventId) {
        eventRepo.deleteById(eventId);
    }

    public void saveEvent(Event event) {
        eventRepo.save(event);
    }

    public List<Event> getEventsByUserId(int uid) {
        return eventRepo.findByUid(uid);
    }

}
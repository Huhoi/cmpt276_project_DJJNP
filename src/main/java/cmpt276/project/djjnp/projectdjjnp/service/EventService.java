package cmpt276.project.djjnp.projectdjjnp.service;

import java.util.List;

import cmpt276.project.djjnp.projectdjjnp.models.Event;

public interface EventService {
    void deleteEventById(int sid);

    void deleteEventByUid(int uid);

    void saveEvent(Event event);

    List<Event> getEventsByUserId(int uid);
}


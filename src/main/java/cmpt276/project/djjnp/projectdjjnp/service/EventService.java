package cmpt276.project.djjnp.projectdjjnp.service;

import cmpt276.project.djjnp.projectdjjnp.models.Event;

public interface EventService {
    void deleteEventById(int sid);

    void saveEvent(Event event);
}


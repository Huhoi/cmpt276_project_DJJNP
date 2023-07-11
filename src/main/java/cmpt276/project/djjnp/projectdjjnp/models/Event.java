package cmpt276.project.djjnp.projectdjjnp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {
    @Id
    private int uid;
    private String eventName; // replace with location/event from map API
    private int date;

    public Event() {
    }

    public Event(int uid, String eventName, int date) {
        this.uid = uid;
        this.eventName = eventName;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }


    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }

   
    public int getDate() {
        return date;
    }

    public void setDate(int date) {
        this.date = date;
    }

}


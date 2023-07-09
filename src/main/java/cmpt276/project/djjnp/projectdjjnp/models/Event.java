package cmpt276.project.djjnp.projectdjjnp.models;
import java.time.LocalDateTime;

public class Event {
    private String eventName; //replace with location/event from map API
    private LocalDateTime date;

    public Event(){}

    public Event(String eventName, LocalDateTime date){
        this.eventName = eventName;
        this.date = date;
    }

    public String getEventName() {
        return eventName;
    }
    public void setEventName(String eventName) {
        this.eventName = eventName;
    }
    public LocalDateTime getDate() {
        return date;
    }
    public void setDate(LocalDateTime date) {
        this.date = date;
    }
    public boolean equals(Event event){
        if (event.getEventName().equals(this.eventName) && event.getDate().equals(this.date)){
            return true;
        }
        else{
            return false;
        }
    }
}

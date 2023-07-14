package cmpt276.project.djjnp.projectdjjnp.models;

import java.util.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int sid;
    private int uid;
    private String eventName; // replace with location/event from map API
    private Date date;
    private int timeBegin;
    private int timeEnd;
    
    

    public Event() {
    }

    public Event(int uid, String eventName, int timeBegin, int timeEnd, Date date) {
        this.uid = uid;
        this.eventName = eventName;
        this.timeBegin = timeBegin;
        this.timeEnd = timeEnd;
        this.date = date;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }
   
    public int getTimeBegin() {
        return timeBegin;
    }

    public void setTimeBegin(int timeBegin) {
        this.timeBegin = timeBegin;
    }

    public int getTimeEnd() {
        return timeEnd;
    }

    public void setTimeEnd(int timeEnd) {
        this.timeEnd = timeEnd;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public int getSid() {
        return sid;
    }

    public void setSid(int sid) {
        this.sid = sid;
    }

    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }

    

   

}

